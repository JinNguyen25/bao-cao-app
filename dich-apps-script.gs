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

function jishoFirst(q) {
  var r = UrlFetchApp.fetch('https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(q), { muteHttpExceptions: true });
  return (JSON.parse(r.getContentText()).data || [])[0];
}

function dictLookup(word, lang, ext) {
  var out = { word: word, reading: '', pos: '', en: [], vi: '', jlpt: '' };
  try {
    if (lang === 'ja') {
      // thử cả cụm có đuôi chia động từ (食べます), nếu không khớp thì dùng đúng từ đã chạm
      var d = null;
      if (ext && ext !== word) {
        var d1 = jishoFirst(ext);
        if (d1) {
          var ok = d1.japanese.some(function (x) { var w = x.word || x.reading || ''; var stem = w.length > 1 ? w.slice(0, -1) : w; return stem && ext.indexOf(stem) === 0; });
          if (ok) d = d1;
        }
      }
      if (!d) d = jishoFirst(word);
      if (d) {
        var jp = d.japanese[0] || {};
        out.word = jp.word || jp.reading || word;
        out.reading = jp.reading || '';
        out.pos = ((d.senses[0] || {}).parts_of_speech || []).join(', ');
        out.en = d.senses.slice(0, 3).map(function (s) { return s.english_definitions.slice(0, 4).join('; '); });
        out.jlpt = (d.jlpt || []).map(function (x) { return x.replace('jlpt-', '').toUpperCase(); }).join(',');
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
  } catch (err) { /* vẫn trả về bản dịch bên dưới */ }
  var src = lang === 'ja' ? 'ja' : 'en';
  out.vi = LanguageApp.translate(out.word, src, 'vi');
  if (out.en.length) {
    var vi = LanguageApp.translate(out.en.join('\n'), 'en', 'vi').split('\n');
    if (vi.length === out.en.length) out.vi = out.vi + ' — ' + vi[0];
  }
  return out;
}

function doGet() { return ContentService.createTextOutput('ok'); }
