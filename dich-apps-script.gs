// Dán toàn bộ file này vào https://script.google.com (Dự án mới) rồi Deploy > Web app
// Execute as: Me | Who has access: Anyone
function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var tl = String(p.tl || 'en'), texts = p.texts || [], out;
    var r = LanguageApp.translate(texts.join('\n'), '', tl).split('\n');
    if (r.length === texts.length) out = r;
    else out = texts.map(function (t) { return LanguageApp.translate(t, '', tl); });
    return ContentService.createTextOutput(JSON.stringify({ lines: out })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() { return ContentService.createTextOutput('ok'); }
