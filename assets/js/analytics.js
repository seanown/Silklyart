/* silklyart.com — Google Analytics 4
 * 與 ownsean.com、seanown.org 各自獨立 GA4 資料流。
 *
 * 當前姿勢：A-放行（預設 analytics_storage = granted，數據不中斷）
 * 待絲綢站同意橫幅 UI 完成後，把下方 DEFAULT_GRANTED 改 false，
 * 即切換為 Consent Mode v2 嚴格模式（預設 denied）。
 */
(function () {
  'use strict';

  var GA_ID = 'G-THDYD5KJ4P';          // silklyart.com 專用，獨立於其他站
  var DEFAULT_GRANTED = true;          // ← 橫幅 UI 完成後改 false

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent 預設（Basic consent mode）
  gtag('consent', 'default', {
    analytics_storage: DEFAULT_GRANTED ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  // 載入 gtag.js
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  // 同意更新機制（供未來橫幅 UI 呼叫）
  window.updateConsent = function (choice) {
    var v = choice === 'accept' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: v,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };
})();
