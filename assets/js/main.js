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
    openBtn: 'Open email app',
    copyBtn: 'Copy draft',
    copied: 'Copied ✓'
  },
  hant: {
    title: '✓ 郵件草稿已準備好',
    openBtn: '開啟郵件 App',
    copyBtn: '複製草稿',
    copied: '已複製 ✓'
  },
  hans: {
    title: '✓ 邮件草稿已准备好',
    openBtn: '开启邮件 App',
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
    return false;
  }
  var subject = '[SILKLY ART 藝術家投稿] ' + name + (series ? ' · ' + series : '');
  var body = '藝術家姓名：' + name + '\n'
           + '聯絡電郵：' + email + '\n'
           + '所在地／地區：' + (region || '（未填）') + '\n'
           + '希望投件系列：' + (series || '（未指定）') + '\n'
           + '作品構想／簡述：\n' + brief + '\n\n'
           + '—— 本信件由 SILKLY ART 展示站投稿表產生 ——';
  var mailtoURL = 'mailto:seanown@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  // Three feedback layers so the user can NEVER miss seeing the draft:
  //  1) a centered modal popup that blocks until they click "Done"
  //  2) a toast at the top of the viewport (auto-dismiss after 6s)
  //  3) the persistent in-page draft card below the form (always visible)
  showProposalModal(mailtoURL, body);
  showProposalToast();
  showProposalResult(mailtoURL, body);
  return false;
}

// Modal — full-screen overlay + centered card. Unmissable.
function showProposalModal(mailtoURL, body){
  closeProposalModal(); // remove any old one first
  var t = proposalTexts();
  var ov = document.createElement('div');
  ov.id = 'proposal-modal';
  ov.className = 'proposal-modal';
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-modal','true');
  ov.innerHTML =
    '<div class="prm-card">' +
      '<button class="prm-close" type="button" aria-label="Close" onclick="closeProposalModal()">×</button>' +
      '<div class="prm-badge">✓</div>' +
      '<h3 class="prm-title">' + t.title + '</h3>' +
      '<a class="prm-cta" href="' + mailtoURL + '">' + t.openBtn + '</a>' +
      '<details class="prm-details"><summary>' + (document.documentElement.lang === 'en' ? 'Show draft text' : '顯示草稿內容') + '</summary>' +
      '<pre class="prm-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" onclick="copyProposalDraft()">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="prm-copied" hidden>' + t.copied + '</span>' +
      '</details>' +
      '<p class="prm-foot">' + (document.documentElement.lang === 'en' ? 'Or close this popup and use the email app on your phone or computer.' : '或關閉此視窗，改用你手機或電腦上的郵件 App。') + '</p>' +
    '</div>';
  document.body.appendChild(ov);
  // also bind the in-card copy button
  setTimeout(function(){
    var btns = ov.querySelectorAll('button');
    btns.forEach(function(b){ if(b.textContent === t.copyBtn || b.textContent === t.copied) {} });
  }, 0);
}
function closeProposalModal(){
  var old = document.getElementById('proposal-modal');
  if(old){ old.parentNode.removeChild(old); }
}
// top-of-viewport toast
function showProposalToast(){
  closeProposalToast();
  var t = proposalTexts();
  var el = document.createElement('div');
  el.id = 'proposal-toast';
  el.className = 'proposal-toast';
  el.innerHTML = t.title;
  document.body.appendChild(el);
  setTimeout(function(){ el.classList.add('show'); }, 30);
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){
      if(el.parentNode){ el.parentNode.removeChild(el); }
    }, 400);
  }, 6000);
}
function closeProposalToast(){
  var old = document.getElementById('proposal-toast');
  if(old){ if(old.parentNode){ old.parentNode.removeChild(old); } }
}
// copy draft (used from modal + inline card)
window.copyProposalDraft = function(){
  var node = document.querySelector('#proposal-modal .prm-body') || document.querySelector('#proposal-result .pr-body');
  if(!node) return;
  copyText(node.textContent);
  document.querySelectorAll('#prm-copied, #pr-copied').forEach(function(s){ s.hidden = false; });
};

function showProposalResult(mailtoURL, body){
  var box = document.getElementById('proposal-result');
  if(!box){
    box = document.createElement('div');
    box.id = 'proposal-result';
    box.className = 'proposal-result';
    var form = document.getElementById('artist-form');
    if(form && form.parentNode){
      // Insert BEFORE the form so the draft is always at the top of the
      // "Submission" section, never below the fold.
      form.parentNode.insertBefore(box, form);
    } else {
      document.body.appendChild(box);
    }
  }
  var t = proposalTexts();
  box.innerHTML =
    '<div class="pr-card">' +
      '<h3>' + t.title + '</h3>' +
      '<a class="btn btn-solid" href="' + mailtoURL + '">' + t.openBtn + '</a>' +
      '<pre class="pr-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" onclick="copyProposalDraft()">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="pr-copied" hidden>' + t.copied + '</span>' +
    '</div>';
  // Scroll the page so the draft card top is at the viewport top — guaranteed visible
  var rect = box.getBoundingClientRect();
  if(rect.top < 10 || rect.top > window.innerHeight - 100){
    box.scrollIntoView({behavior:'smooth', block:'start'});
  }
  // animate highlight pulse so the eye is drawn to it
  box.classList.remove('pr-pulse');
  void box.offsetWidth;
  box.classList.add('pr-pulse');
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

// ---- Register Interest: series-aware, captures visitor contact ----
// Each "Register Interest" button on works.html carries its own data-series.
// Clicking opens a dedicated modal (not the generic contact fallback) that
// asks for the visitor's name + email so the curatorial team can notify them
// when that specific series goes live. Curator address stays hidden in the
// mailto link only — never shown as text (anti-spam / anti-CEO-fraud rule).
var RI_TEXTS = {
  en: {
    title: 'Register Interest',
    subj: '[SILKLY ART Register Interest] ',
    series: 'Series',
    intro: "Leave your details and we’ll notify you the moment this series goes live. Prices follow the silk-weaving quote, so no number yet — just first access.",
    namePh: 'Your name (optional)',
    emailPh: 'Your email — so we can notify you',
    cta: 'Register Interest',
    err: 'Please enter your email so we can reach you when the series launches.',
    doneTitle: '✓ Interest registered',
    doneBody: function(series, name, email){
      return 'Series of interest: ' + series + '\n' +
             'Name: ' + (name || '(not given)') + '\n' +
             'Email: ' + (email || '(not given)') + '\n\n' +
             'Please notify me when this series is released.\n\n—— SILKLY ART showcase ——';
    },
    openBtn: 'Open email app',
    copyBtn: 'Copy draft',
    copied: 'Copied ✓',
    foot: 'Or close this and use the email app on your phone or computer.'
  },
  hant: {
    title: '登記意向',
    subj: '[SILKLY ART 登記意向] ',
    series: '系列',
    intro: '留下你的資料，這個系列一上線我們就會通知你。價格要等絲綢織造報價確認，所以現在還沒有數字——只有優先知情權。',
    namePh: '你的姓名（選填）',
    emailPh: '你的電郵——方便我們通知你',
    cta: '登記意向',
    err: '請填寫你的電郵，方便我們在系列發行時通知你。',
    doneTitle: '✓ 意向已登記',
    doneBody: function(series, name, email){
      return '感興趣系列：' + series + '\n' +
             '姓名：' + (name || '（未填）') + '\n' +
             '電郵：' + (email || '（未填）') + '\n\n' +
             '這個系列發行時請通知我。\n\n—— SILKLY ART 展示站 ——';
    },
    openBtn: '開啟郵件 App',
    copyBtn: '複製草稿',
    copied: '已複製 ✓',
    foot: '或關閉此視窗，改用你手機或電腦上的郵件 App。'
  },
  hans: {
    title: '登记意向',
    subj: '[SILKLY ART 登记意向] ',
    series: '系列',
    intro: '留下你的资料，这个系列一上线我们就会通知你。价格要等丝绸织造报价确认，所以现在还没有数字——只有优先知情权。',
    namePh: '你的姓名（选填）',
    emailPh: '你的邮箱——方便我们通知你',
    cta: '登记意向',
    err: '请填写你的邮箱，方便我们在系列发行时通知你。',
    doneTitle: '✓ 意向已登记',
    doneBody: function(series, name, email){
      return '感兴趣系列：' + series + '\n' +
             '姓名：' + (name || '（未填）') + '\n' +
             '邮箱：' + (email || '（未填）') + '\n\n' +
             '这个系列发行时请通知我。\n\n—— SILKLY ART 展示站 ——';
    },
    openBtn: '开启邮件 App',
    copyBtn: '复制草稿',
    copied: '已复制 ✓',
    foot: '或关闭此窗口，改用你手机或电脑上的邮件 App。'
  }
};
function riTexts(){
  var lang = (document.documentElement.lang || 'en');
  if(lang === 'zh-Hant') return RI_TEXTS.hant;
  if(lang === 'zh-Hans') return RI_TEXTS.hans;
  return RI_TEXTS.en;
}
function initRegisterInterest(){
  document.querySelectorAll('button.ri-btn').forEach(function(btn){
    if(btn.dataset.riWired) return;
    btn.dataset.riWired = '1';
    btn.addEventListener('click', function(){
      showRegisterModal(btn.getAttribute('data-series') || '');
    });
  });
}
function showRegisterModal(series){
  closeRegisterModal();
  var t = riTexts();
  var ov = document.createElement('div');
  ov.id = 'register-modal';
  ov.className = 'proposal-modal register-modal';
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-modal','true');
  ov.innerHTML =
    '<div class="prm-card">' +
      '<button class="prm-close" type="button" aria-label="Close" onclick="closeRegisterModal()">×</button>' +
      '<div class="prm-badge">✦</div>' +
      '<h3 class="prm-title">' + t.title + '</h3>' +
      '<p class="prm-to"><strong>' + t.series + '：</strong>' + escapeHtml(series) + '</p>' +
      '<p class="prm-to" style="margin-top:-8px">' + escapeHtml(t.intro) + '</p>' +
      '<div class="field" style="margin-top:16px"><label for="ri-name">' + t.namePh + '</label><input id="ri-name" type="text" autocomplete="name"></div>' +
      '<div class="field" style="margin-top:12px"><label for="ri-email">' + t.emailPh + '</label><input id="ri-email" type="email" autocomplete="email"></div>' +
      '<p class="ri-err" id="ri-err" hidden>' + t.err + '</p>' +
      '<button class="prm-cta" type="button" id="ri-submit" style="margin-top:18px">' + t.cta + '</button>' +
    '</div>';
  document.body.appendChild(ov);
  document.getElementById('ri-submit').addEventListener('click', function(){
    var name = (document.getElementById('ri-name').value || '').trim();
    var email = (document.getElementById('ri-email').value || '').trim();
    if(!email){
      var err = document.getElementById('ri-err');
      err.hidden = false;
      document.getElementById('ri-email').focus();
      return;
    }
    var subject = t.subj + series;
    var body = t.doneBody(series, name, email);
    var mailtoURL = 'mailto:seanown@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    closeRegisterModal();
    showRegisterDone(mailtoURL, body, series);
    showRegisterToast();
    showRegisterResult(mailtoURL, body, series);
  });
}
function closeRegisterModal(){
  var old = document.getElementById('register-modal');
  if(old && old.parentNode) old.parentNode.removeChild(old);
}
function showRegisterDone(mailtoURL, body, series){
  closeRegisterDone();
  var t = riTexts();
  var ov = document.createElement('div');
  ov.id = 'register-done-modal';
  ov.className = 'proposal-modal register-done-modal';
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-modal','true');
  ov.innerHTML =
    '<div class="prm-card">' +
      '<button class="prm-close" type="button" aria-label="Close" onclick="closeRegisterDone()">×</button>' +
      '<div class="prm-badge">✓</div>' +
      '<h3 class="prm-title">' + t.doneTitle + '</h3>' +
      '<p class="prm-to"><strong>' + t.series + '：</strong>' + escapeHtml(series) + '</p>' +
      '<a class="prm-cta" href="' + escapeHtml(mailtoURL) + '">' + t.openBtn + '</a>' +
      '<details class="prm-details"><summary>' + (document.documentElement.lang === 'en' ? 'Show draft text' : '顯示草稿內容') + '</summary>' +
      '<pre class="prm-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" onclick="copyRegisterDraft()">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="ri-done-copied" hidden>' + t.copied + '</span>' +
      '</details>' +
      '<p class="prm-foot">' + t.foot + '</p>' +
    '</div>';
  document.body.appendChild(ov);
}
function closeRegisterDone(){
  var old = document.getElementById('register-done-modal');
  if(old && old.parentNode) old.parentNode.removeChild(old);
}
function showRegisterToast(){
  closeRegisterToast();
  var t = riTexts();
  var el = document.createElement('div');
  el.id = 'register-toast';
  el.className = 'proposal-toast';
  el.innerHTML = t.doneTitle;
  document.body.appendChild(el);
  setTimeout(function(){ el.classList.add('show'); }, 30);
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 400);
  }, 6000);
}
function closeRegisterToast(){
  var old = document.getElementById('register-toast');
  if(old && old.parentNode) old.parentNode.removeChild(old);
}
window.copyRegisterDraft = function(){
  var node = document.querySelector('#register-done-modal .prm-body') || document.querySelector('#ri-result .pr-body');
  if(!node) return;
  copyText(node.textContent);
  document.querySelectorAll('#ri-done-copied, #ri-copied').forEach(function(s){ s.hidden = false; });
};
function showRegisterResult(mailtoURL, body, series){
  var box = document.getElementById('ri-result');
  if(!box){
    box = document.createElement('div');
    box.id = 'ri-result';
    box.className = 'proposal-result';
    var anchor = document.querySelector('.editions');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
    else document.body.appendChild(box);
  }
  var t = riTexts();
  box.innerHTML =
    '<div class="pr-card">' +
      '<h3>' + t.doneTitle + '</h3>' +
      '<p class="prm-to" style="margin:0 0 12px"><strong>' + t.series + '：</strong>' + escapeHtml(series) + '</p>' +
      '<a class="btn btn-solid" href="' + escapeHtml(mailtoURL) + '">' + t.openBtn + '</a>' +
      '<pre class="pr-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" onclick="copyRegisterDraft()">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="ri-copied" hidden>' + t.copied + '</span>' +
    '</div>';
  var rect = box.getBoundingClientRect();
  if(rect.top < 10 || rect.top > window.innerHeight - 100) box.scrollIntoView({behavior:'smooth', block:'start'});
  box.classList.remove('pr-pulse'); void box.offsetWidth; box.classList.add('pr-pulse');
}

// ---- Contact links: guarantee a visible result even with no mail client ----
// A plain <a href="mailto:"> silently does nothing on a device without a
// default mail app — exactly the "I clicked and nothing happened" report
// from the real-device test. So every mailto link on the site now:
//   1) tries to open the mail client natively (best UX for most users)
//   2) watches for the window losing focus (mail app opened) within 1s
//   3) if nothing opened, shows a modal with the address + copy + manual link
var CONTACT_TEXTS = {
  en:  { title:'Reach the Curatorial Team', sub:'Press the button below — your email app will open with our address already filled in. Send your message and we’ll reply.', open:'Open email app', foot:'If your email app doesn’t open, try the mail app on your phone or computer.' },
  hant:{ title:'聯絡策展團隊', sub:'請按下下方按鈕，你的郵件 App 會自動開啟並預填好收件地址。寫好內容寄出，我們會回信。', open:'開啟郵件 App', foot:'若郵件 App 沒自動開啟，請改用手機或電腦上的郵件 App 寄信。' },
  hans:{ title:'联络策展团队', sub:'请按下下方按钮，你的邮件 App 会自动开启并预填好收件地址。写好内容寄出，我们会回信。', open:'开启邮件 App', foot:'若邮件 App 没自动开启，请改用手机或电脑上的邮件 App 写信。' }
};
function contactTexts(){
  var lang = (document.documentElement.lang || 'en');
  if(lang === 'zh-Hant') return CONTACT_TEXTS.hant;
  if(lang === 'zh-Hans') return CONTACT_TEXTS.hans;
  return CONTACT_TEXTS.en;
}
function initContactLinks(){
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
    if(a.dataset.contactWired) return;
    // Leave modal-internal CTAs alone — proposal/contact/register modals all
    // have their own CTA that opens the mail app natively and live inside
    // .proposal-modal (the shared overlay class).
    if(a.closest('.proposal-modal')) return;
    a.dataset.contactWired = '1';
    a.addEventListener('click', function(e){
      e.preventDefault();
      var href = a.getAttribute('href');
      openContactWithFallback(href);
    });
  });
}
function openContactWithFallback(href){
  var opened = false;
  function markOpened(){
    opened = true;
    window.removeEventListener('blur', markOpened);
    document.removeEventListener('visibilitychange', onVis);
  }
  function onVis(){ if(document.hidden) markOpened(); }
  window.addEventListener('blur', markOpened, { once:true });
  document.addEventListener('visibilitychange', onVis, { once:true });
  // Attempt the native mail-client open. On a device with no handler this is
  // a silent no-op — which is exactly why the timer below is the real safety net.
  window.location.href = href;
  setTimeout(function(){
    if(!opened) showContactModal(href);
  }, 1000);
}
function showContactModal(href){
  closeContactModal();
  var t = contactTexts();
  var ov = document.createElement('div');
  ov.id = 'contact-modal';
  ov.className = 'proposal-modal contact-modal';
  ov.setAttribute('role','dialog');
  ov.setAttribute('aria-modal','true');
  ov.innerHTML =
    '<div class="prm-card">' +
      '<button class="prm-close" type="button" aria-label="Close" onclick="closeContactModal()">×</button>' +
      '<div class="prm-badge">@</div>' +
      '<h3 class="prm-title">' + t.title + '</h3>' +
      '<p class="prm-to">' + t.sub + '</p>' +
      '<a class="prm-cta" href="' + escapeHtml(href) + '">' + t.open + '</a>' +
      '<p class="prm-foot">' + t.foot + '</p>' +
    '</div>';
  document.body.appendChild(ov);
}
function closeContactModal(){
  var old = document.getElementById('contact-modal');
  if(old && old.parentNode) old.parentNode.removeChild(old);
}
// Wire up as soon as the script runs (it loads at the end of <body>).
initContactLinks();
initRegisterInterest();
