// URL /exec Apps Script (tukar jika deployment baru).
window.CONFIG = {
  PUBLIC_API: 'https://script.google.com/macros/s/AKfycbw973pKn-yFHN-oM7NWJYa-XSJSyaAFa8Od4Ojot625JzlU5wiaC4ekysiLeWssTxHcTA/exec',
  KERANI_API: 'https://script.google.com/macros/s/AKfycbzntiOTP6Wts-4LPREpTCMF4hYQktZ1OM9D6o4KRtrnUDQxcdCTas-luCIL8t7zEQ8RBQ/exec'
};
// Tindakan tulis: tiada auto-retry; setiap panggilan dapat requestId unik (server tolak pendua).
window.WRITE_ACTIONS = ['simpanAhli', 'rekodBayaran', 'tambahTanggungan', 'buangTanggungan'];
window.MSG_SAMBUNGAN = 'Sambungan terputus. Semak dahulu rekod sebelum hantar semula.';
window.TIMEOUT_MS = 45000;
window.newRequestId = function () {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  var a = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
  return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
};
// Panggil API: body JSON sebagai text/plain (tiada preflight CORS). fetch ikut redirect ke googleusercontent.
// Ralat sambungan/balasan bukan JSON/timeout ditanda e.sambungan = true (untuk tulis: mesej MSG_SAMBUNGAN).
window.api = function (url, action, params) {
  var tulis = window.WRITE_ACTIONS.indexOf(action) >= 0;
  var body = Object.assign({ action: action }, params || {});
  if (tulis) body.requestId = window.newRequestId();
  function putus(mesej) { var e = new Error(tulis ? window.MSG_SAMBUNGAN : mesej); e.sambungan = true; return e; }
  var ctl = window.AbortController ? new AbortController() : null;
  var timer = ctl ? setTimeout(function () { ctl.abort(); }, window.TIMEOUT_MS) : null;
  var opt = { method: 'POST', body: JSON.stringify(body), redirect: 'follow' };
  if (ctl) opt.signal = ctl.signal;
  return fetch(url, opt)
    .then(function (r) {
      if (!r.ok) throw putus('Ralat rangkaian (' + r.status + ').');
      return r.text();
    }, function () { throw putus('Sambungan terputus. Cuba lagi.'); })
    .then(function (t) {
      var j; try { j = JSON.parse(t); } catch (e) { throw putus('Balasan pelayan tidak sah. Semak URL API / deployment.'); }
      if (!j.success) throw new Error(j.error || 'Ralat.');
      return j.result;
    })
    .then(function (r) { if (timer) clearTimeout(timer); return r; },
          function (e) { if (timer) clearTimeout(timer); if (e && e.name === 'AbortError') e = putus('Sambungan tamat masa.'); throw e; });
};
