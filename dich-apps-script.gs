// Dán toàn bộ file này vào https://script.google.com (Dự án mới) rồi Deploy > Web app
// Execute as: Me | Who has access: Anyone
// Dùng cho: (1) tự dịch báo cáo, (2) tra từ điển Anh/Nhật + nghĩa tiếng Việt
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
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

function doGet() { return ContentService.createTextOutput('ok'); }
