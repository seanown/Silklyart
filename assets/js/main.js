// SILKLY ART — static showcase, minimal JS
// 1) mobile nav toggle  2) artist submission -> pre-filled email (mailto)

function silklyNav(){ document.getElementById('nav').classList.toggle('open'); }

// Artist submission form -> pre-filled email to curator inbox.
// Primary path: open the user's mail client. Fallback: always render an
// on-page draft so the form never appears to "do nothing" on devices
// without a default mail client (e.g. a browser with no mail app linked).
var PROPOSAL_TEXTS = {
  err: '請填寫姓名、電郵與作品構想三欄，其餘可後補。',
  en: {
    title: '✓ Your proposal draft is ready',
    to: 'It will be sent to',
    openBtn: 'Open email to seanown@gmail.com',
    alt: 'If your mail app did not open, tap the button above — or copy the draft below and paste it into any email addressed to seanown@gmail.com.',
    copyBtn: 'Copy draft',
    copied: 'Copied ✓'
  },
  hant: {
    title: '✓ 郵件草稿已準備好',
    to: '將寄送到',
    openBtn: '開啟郵件發給 seanown@gmail.com',
    alt: '若郵件 App 沒有自動跳出，請點上方按鈕——或複製下方草稿，貼到任意郵件寄給 seanown@gmail.com。',
    copyBtn: '複製草稿',
    copied: '已複製 ✓'
  },
  hans: {
    title: '✓ 邮件草稿已准备好',
    to: '将寄送到',
    openBtn: '开启邮件发给 seanown@gmail.com',
    alt: '若邮件 App 没有自动跳出，请点上方按钮——或复制下方草稿，贴到任意邮件寄给 seanown@gmail.com。',
    copyBtn: '复制草稿',
    copied: '已复制 ✓'
  }
};

function proposalTexts(){
  var lang = (document.documentElement.lang || 'en');
  if(lang === 'zh-Hant') return PROPOSAL_TEXTS.hant;
  if(lang === 'zh-Hans') return PROPOSAL_TEXTS.hans;
  return PROPOSAL_TEXTS.en;
}

function submitArtist(e){
  e.preventDefault();
  var f = e.target;
  var name = (f.name.value || '').trim();
  var email = (f.email.value || '').trim();
  var region = (f.region.value || '').trim();
  var series = (f.series.value || '').trim();
  var brief = (f.brief.value || '').trim();
  if(!name || !email || !brief){
    alert(PROPOSAL_TEXTS.err);
    return;
  }
  var subject = '[SILKLY ART 藝術家投稿] ' + name + (series ? ' · ' + series : '');
  var body = '藝術家姓名：' + name + '\n'
           + '聯絡電郵：' + email + '\n'
           + '所在地／地區：' + (region || '（未填）') + '\n'
           + '希望投件系列：' + (series || '（未指定）') + '\n'
           + '作品構想／簡述：\n' + brief + '\n\n'
           + '—— 本信件由 SILKLY ART 展示站投稿表產生 ——';
  var mailtoURL = 'mailto:seanown@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  // Primary: try to open the mail client automatically.
  window.location.href = mailtoURL;
  // Fallback: always render an on-page draft so the user is never left
  // with "nothing happens" when no default mail client is configured.
  showProposalResult(mailtoURL, body);
}

function showProposalResult(mailtoURL, body){
  var box = document.getElementById('proposal-result');
  if(!box){
    box = document.createElement('div');
    box.id = 'proposal-result';
    box.className = 'proposal-result';
    var form = document.getElementById('artist-form');
    form.parentNode.insertBefore(box, form.nextSibling);
  }
  var t = proposalTexts();
  box.innerHTML =
    '<div class="pr-card">' +
      '<h3>' + t.title + '</h3>' +
      '<p class="pr-to">' + t.to + ' <strong>seanown@gmail.com</strong></p>' +
      '<a class="btn btn-solid" href="' + mailtoURL + '">' + t.openBtn + '</a>' +
      '<p class="pr-alt">' + t.alt + '</p>' +
      '<pre class="pr-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" id="pr-copy">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="pr-copied" hidden>' + t.copied + '</span>' +
    '</div>';
  var copyBtn = document.getElementById('pr-copy');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      copyText(body);
      var c = document.getElementById('pr-copied');
      if(c){ c.hidden = false; }
    });
  }
  box.scrollIntoView({behavior:'smooth', block:'center'});
}

function copyText(txt){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).catch(function(){ fallbackCopy(txt); });
  } else {
    fallbackCopy(txt);
  }
}
function fallbackCopy(txt){
  var ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch(err){}
  document.body.removeChild(ta);
}
function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
