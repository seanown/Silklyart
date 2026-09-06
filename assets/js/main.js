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
    copyBtn: 'Copy draft',
    copied: 'Copied ✓'
  },
  hant: {
    title: '✓ 郵件草稿已準備好',
    to: '將寄送到',
    openBtn: '開啟郵件發給 seanown@gmail.com',
    copyBtn: '複製草稿',
    copied: '已複製 ✓'
  },
  hans: {
    title: '✓ 邮件草稿已准备好',
    to: '将寄送到',
    openBtn: '开启邮件发给 seanown@gmail.com',
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
      '<p class="prm-to">' + t.to + ' <strong>seanown@gmail.com</strong></p>' +
      '<a class="prm-cta" href="' + mailtoURL + '">' + t.openBtn + '</a>' +
      '<details class="prm-details"><summary>' + (document.documentElement.lang === 'en' ? 'Show draft text' : '顯示草稿內容') + '</summary>' +
      '<pre class="prm-body">' + escapeHtml(body) + '</pre>' +
      '<button class="btn btn-ghost" type="button" onclick="copyProposalDraft()">' + t.copyBtn + '</button>' +
      '<span class="pr-copied" id="prm-copied" hidden>' + t.copied + '</span>' +
      '</details>' +
      '<p class="prm-foot">' + (document.documentElement.lang === 'en' ? 'You can also save this page or close this popup and email seanown@gmail.com directly.' : '你也可以關閉此視窗，直接寄信到 seanown@gmail.com') + '</p>' +
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
      '<p class="pr-to">' + t.to + ' <strong>seanown@gmail.com</strong></p>' +
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
