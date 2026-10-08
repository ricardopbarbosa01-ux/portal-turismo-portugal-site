/* SO PARA TESTES (testar-praias.ps1) - nunca vai para producao: e copiado para a pasta de teste e apagado no proximo deploy.
 * Mostra as praias novas (B5) que ainda estao INATIVAS na BD e usa as fotos locais em vez das de producao. */
(function () {
  'use strict';
  var IDS = ["155d7724-e194-428d-8bf4-7e18abb2aed7", "055cca4d-ee7d-4ef6-8204-ea9265ec704e", "bc1e4246-a8e1-42c5-8577-119318b3fbb9", "37c4cd58-a82c-4f38-9710-48d3dd24660b", "6ce5992f-4bd3-42c3-a710-d2d987c8363c", "cc5562a4-a203-4797-89bf-b8703ff615c4", "2ee1dd1f-3e70-46cc-8e65-ef7e035a78f8", "65cf5f44-de44-41c0-a419-00e0554f607f", "f1e950a5-61b6-41e3-b173-22153898c3b3", "9cf66c0f-974c-475b-9668-88731057e69f", "dfd873aa-3fc6-48d4-9cd1-1b64e235af9a", "f058fd9e-b587-41d2-bc5a-de0385aa8b73", "7cf2d44f-99d9-4338-a8c7-5894e891137f", "61887f8a-8922-4ba5-ad0a-45f881c351bf", "46869249-375b-4a32-9adb-c372544414ba", "eab15399-eeb4-48a2-a798-eba7a12e0d28", "e4fb473e-c931-412b-89a3-f165663cc0df", "12507b31-9a7c-41c4-a13a-306fe86756bb", "03fbf94b-0b57-4dc6-b591-c0c6e3741a4d", "865a8bf2-f14c-4162-b617-c30fe5e8df5d", "73903aa6-2381-4de2-bb7e-711c3f7eeedb", "57526254-1697-4e4e-bccb-8aad4845637c", "5b6a2683-e641-4d24-ab09-8344ab155721", "7191f050-c51a-4b02-be5d-f05e2cf9e26e", "2bc9625b-be86-4e05-8863-9cc2bb287a79", "58f01940-1eba-48f6-9f31-3b9a085a8e84", "8e8b1a53-d25b-4819-bbb2-a5ea088797e6", "d6ed45a0-b239-4478-bd96-dc730241b2c7", "47ae4764-a60d-4ec5-a7c5-00a21e871fdb", "01e58d32-5fe4-4700-9772-5cc1cd9760fc", "1c240aa4-6970-4f9d-8635-80cb7422cb35", "06b247da-0079-4522-a065-25add87fb95f", "00788621-1158-4184-9bcd-43c1d8755977", "f18f80b9-9924-469d-818d-c23488065d31", "f0074430-0747-4d08-a8e9-162468afc3d8", "6fcea0e0-eed8-4e71-b4ad-33c24815692e", "18030e2e-70b5-4e6e-9a5c-7935cdd13f6f", "dc0629c2-fb75-4706-bafd-08d8cf4466be", "06d98cdf-b310-4dfb-ac51-89ba00cdf277", "400e7e4d-66b0-4efc-baf0-d3b79f694039", "71adeb03-5026-4bba-b65f-8d79125e3c5d", "e0c0455f-3e2c-4d90-95c9-01b28f661172"];
  var f0 = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('supabase.co/rest/v1/beaches') > -1 && url.indexOf('is_active=eq.true') > -1) {
      url = url.replace('is_active=eq.true', 'or=(is_active.eq.true,id.in.(' + IDS.join(',') + '))');
      input = typeof input === 'string' ? url : new Request(url, input);
    }
    var p = f0.call(this, input, init);
    if (url.indexOf('supabase.co/rest/v1/beaches') < 0) return p;
    return p.then(function (r) {
      return r.text().then(function (t) {
        t = t.split('https://www.portalturismoportugal.com/images/').join('/images/');
        return new Response(t, { status: r.status, statusText: r.statusText, headers: r.headers });
      });
    });
  };
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.textContent = 'MODO TESTE: ' + IDS.length + ' praias novas (ainda inativas) visiveis';
    b.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;background:#c0392b;color:#fff;font:600 12px/1.2 system-ui;padding:6px 10px;border-radius:8px;pointer-events:none;opacity:.92';
    document.body.appendChild(b);
  });
})();
