// Dán toàn bộ file này vào https://script.google.com (Dự án mới) rồi Deploy > Web app
// Execute as: Me | Who has access: Anyone
// Dùng cho: (1) tự dịch báo cáo, (2) tra từ điển Anh/Nhật + nghĩa tiếng Việt
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.mode === 'sync_get') return json(syncGet(p.key));
    if (p.mode === 'sync_set') return json(syncSet(p.key, String(p.data || '')));
    if (p.mode === 'dict') return json(dictLookup(String(p.word || ''), String(p.lang || 'en'), String(p.ext || '')));
    var tl = String(p.tl || 'en'), texts = p.texts || [], out;
    var r = LanguageApp.translate(texts.join('\n'), '', tl).split('\n');
    if (r.length === texts.length) out = r;
    else out = texts.map(function (t) { return LanguageApp.translate(t, '', tl); });
    return json({ lines: out });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function jotobaFirst(q) {
  var r = UrlFetchApp.fetch('https://jotoba.de/api/search/words', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ query: q, language: 'English', no_english: false }),
    muteHttpExceptions: true
  });
  return (JSON.parse(r.getContentText()).words || [])[0];
}

function posText(p) {
  if (typeof p === 'string') return p;
  return Object.keys(p).map(function (k) { return k + (p[k] && typeof p[k] === 'string' ? ' ' + p[k] : ''); }).join(' ');
}

function dictLookup(word, lang, ext) {
  var out = { word: word, reading: '', pos: '', en: [], vi: '', jlpt: '' };
  try {
    if (lang === 'ja') {
      var d = null;
      if (ext && ext !== word) {
        var d1 = jotobaFirst(ext);
        if (d1) {
          var w = d1.reading.kanji || d1.reading.kana || '';
          var stem = w.length > 1 ? w.slice(0, -1) : w;
          if (stem && ext.indexOf(stem) === 0) d = d1;
        }
      }
      if (!d) d = jotobaFirst(word);
      if (d) {
        out.word = d.reading.kanji || d.reading.kana || word;
        out.reading = d.reading.kana || '';
        var s0 = d.senses[0] || {};
        out.pos = (s0.pos || []).map(posText).join(', ');
        out.en = d.senses.slice(0, 3).map(function (s) { return s.glosses.slice(0, 4).join('; '); });
        if (d.jlpt_lvl) out.jlpt = 'N' + d.jlpt_lvl;
      }
    } else {
      var r2 = UrlFetchApp.fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word.toLowerCase()), { muteHttpExceptions: true });
      var arr = JSON.parse(r2.getContentText());
      if (Array.isArray(arr) && arr[0]) {
        var m = (arr[0].meanings || [])[0];
        out.reading = arr[0].phonetic || ((arr[0].phonetics || []).filter(function (x) { return x.text; })[0] || {}).text || '';
        if (m) {
          out.pos = m.partOfSpeech || '';
          out.en = m.definitions.slice(0, 3).map(function (x) { return x.definition; });
        }
      }
    }
  } catch (err) { out.err = String(err); }
  var src = lang === 'ja' ? 'ja' : 'en';
  out.vi = LanguageApp.translate(out.word, src, 'vi');
  if (out.en.length) {
    var viDef = LanguageApp.translate(out.en[0].replace(/;/g, ','), 'en', 'vi');
    if (viDef && viDef.toLowerCase() !== out.vi.toLowerCase()) out.vi = out.vi + ' — ' + viDef;
  }
  return out;
}

// ----- Đồng bộ giữa các thiết bị: lưu JSON trong Script Properties (chia nhỏ) -----
function syncName(k) { return 'S_' + String(k).replace(/[^A-Za-z0-9]/g, '').slice(0, 40); }

function syncGet(k) {
  var props = PropertiesService.getScriptProperties(), name = syncName(k);
  var n = Number(props.getProperty(name + '_n') || 0);
  if (!n) return { data: null };
  var s = '';
  for (var i = 0; i < n; i++) s += props.getProperty(name + '_' + i) || '';
  return { data: s };
}

function syncSet(k, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), name = syncName(k);
    var old = Number(props.getProperty(name + '_n') || 0), chunks = [];
    for (var i = 0; i < data.length; i += 2500) chunks.push(data.substr(i, 2500));
    var o = {};
    o[name + '_n'] = String(chunks.length);
    chunks.forEach(function (c, j) { o[name + '_' + j] = c; });
    props.setProperties(o);
    for (var j = chunks.length; j < old; j++) props.deleteProperty(name + '_' + j);
    return { ok: true, chunks: chunks.length };
  } finally { lock.releaseLock(); }
}

function doGet() { return ContentService.createTextOutput('ok'); }
