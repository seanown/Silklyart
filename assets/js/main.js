// SILKLY ART — static showcase, minimal JS
// 1) mobile nav toggle  2) artist submission -> pre-filled email (mailto)

function silklyNav(){ document.getElementById('nav').classList.toggle('open'); }

// Artist submission form -> opens email client pre-filled to curator inbox.
// Swap this for Netlify Forms / Formspree once the site is deployed.
function submitArtist(e){
  e.preventDefault();
  var f = e.target;
  var name = (f.name.value || '').trim();
  var email = (f.email.value || '').trim();
  var region = (f.region.value || '').trim();
  var series = (f.series.value || '').trim();
  var brief = (f.brief.value || '').trim();
  if(!name || !email || !brief){
    alert('請填寫姓名、電郵與作品構想三欄，其餘可後補。');
    return;
  }
  var subject = encodeURIComponent('[SILKLY ART 藝術家投稿] ' + name + (series? ' · ' + series : ''));
  var body = encodeURIComponent(
    '藝術家姓名：' + name + '\n' +
    '聯絡電郵：' + email + '\n' +
    '所在地／地區：' + (region || '（未填）') + '\n' +
    '希望投件系列：' + (series || '（未指定）') + '\n' +
    '作品構想／簡述：\n' + brief + '\n\n' +
    '—— 本信件由 SILKLY ART 展示站投稿表產生 ——'
  );
  window.location.href = 'mailto:seanown@gmail.com?subject=' + subject + '&body=' + body;
}
