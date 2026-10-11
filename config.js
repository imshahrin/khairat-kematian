// URL /exec Apps Script (tukar jika deployment baru).
window.CONFIG = {
  PUBLIC_API: 'https://script.google.com/macros/s/AKfycbw973pKn-yFHN-oM7NWJYa-XSJSyaAFa8Od4Ojot625JzlU5wiaC4ekysiLeWssTxHcTA/exec',
  KERANI_API: 'https://script.google.com/macros/s/AKfycbzntiOTP6Wts-4LPREpTCMF4hYQktZ1OM9D6o4KRtrnUDQxcdCTas-luCIL8t7zEQ8RBQ/exec'
};
// Panggil API: body JSON sebagai text/plain (tiada preflight CORS). fetch ikut redirect ke googleusercontent.
window.api = function (url, action, params) {
  var body = Object.assign({ action: action }, params || {});
  return fetch(url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' })
    .then(function (r) {
      if (!r.ok) throw new Error('Ralat rangkaian (' + r.status + ').');
      return r.text();
    })
    .then(function (t) {
      var j; try { j = JSON.parse(t); } catch (e) { throw new Error('Balasan pelayan tidak sah. Semak URL API / deployment.'); }
      if (!j.success) throw new Error(j.error || 'Ralat.');
      return j.result;
    });
};
