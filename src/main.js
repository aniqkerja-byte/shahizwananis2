import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/great-vibes/latin-400.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './styles.css';
import './fullscreen.css';
import './dresscode.css';
import { pages, wedding } from './content.js';
import { submitRsvp, validateRsvp } from './rsvp.js';
import { installScrollNavigation } from './scroll-navigation.js';
import { dresscodeBoard, bindDresscode } from './dresscode.js';

const arrow = (direction = 'right') => `<svg viewBox="0 0 32 16" fill="none" aria-hidden="true" class="arrow-icon ${direction}"><path d="M1 8h28M22 1l7 7-7 7"/></svg>`;
const flourish = `<svg class="flourish" viewBox="0 0 100 30" fill="none" aria-hidden="true"><path d="M8 15h26m32 0h26M50 15c-18-22-27 0-10 0-17 0-8 22 10 0 18 22 27 0 10 0 17 0 8-22-10 0Z"/><path d="M50 5v20M43 15h14"/></svg>`;
const fan = `<svg class="fan" viewBox="0 0 300 160" fill="none" aria-hidden="true"><path d="M20 144a130 130 0 0 1 260 0H20Z"/><path d="M29 144a121 121 0 0 1 242 0M38 144a112 112 0 0 1 224 0"/>${Array.from({length:17},(_,i)=>{const a=Math.PI+i*Math.PI/16; return `<path d="M150 144L${150+121*Math.cos(a)} ${144+121*Math.sin(a)}"/>`;}).join('')}<path d="M142 144a8 8 0 0 1 16 0M20 148h260M150 150v7"/><path d="M32 108q-28-14-11-28 14 5 14 18M68 45q-13-30 8-30 12 12 4 25M222 43q17-28 31-13-2 16-22 24M271 102q29-20 20 7-9 7-18 4"/></svg>`;
const external = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="small-icon"><path d="M5 15 15 5M5 5h10v10"/></svg>`;
const pin = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="small-icon"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="mobile-header">
    <a class="wordmark" href="#home" aria-label="Shahizwan dan Anis — Utama">S<span>&</span>A</a>
    <span class="mobile-date">09 . 01 . 2027</span>
    <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Buka menu"><span></span><span></span></button>
  </header>
  <aside class="sidebar">
    <a class="brand" href="#home" aria-label="Shahizwan dan Anis — Utama"><img src="/assets/monogram.jpeg" alt="S&A" width="146" height="78" /></a>
    <nav id="site-nav" aria-label="Halaman jemputan">${pages.map((page,i)=>`<a href="#${page.id}" data-page="${page.id}"><span class="nav-index">0${i+1}</span>${page.label}<span class="nav-dot" aria-hidden="true"></span></a>`).join('')}</nav>
    <div class="sidebar-bottom"><span class="little-heart" aria-hidden="true">♡</span><span>DENGAN KASIH,<br>SHAHIZWAN & ANIS</span></div>
  </aside>
  <div class="page-shell">
    <header class="desktop-header"><span>MAJLIS PERKAHWINAN SHAHIZWAN & ANIS</span><span>09 . 01 . 2027</span></header>
    <main id="main" tabindex="-1"></main>
    <footer class="page-footer">
      <button class="page-prev" aria-label="Halaman sebelumnya">${arrow('left')}<span>Sebelumnya</span></button>
      <div class="progress-area"><div class="page-progress"><span class="page-number"></span><span class="progress-line"><span></span></span><span class="page-total">05</span></div><span class="scroll-hint"></span></div>
      <button class="page-next"><span></span>${arrow()}</button>
    </footer>
  </div>
  <div id="page-announcement" class="sr-only" aria-live="polite"></div>`;

const main = document.querySelector('main');
let activeIndex = 0;
let draft = { name: '', attendance: '', pax: '1' };
let confirmation = null;
let cleanupPage = () => {};
const scrollNavigation = installScrollNavigation({
  container: main,
  menuIsOpen: () => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true' || Boolean(main.querySelector('.outfit-board.is-dragging')),
  navigate: direction => {
    const next = activeIndex + direction;
    if (next < 0 || next >= pages.length) return false;
    location.hash = pages[next].id;
    return true;
  },
});

function homePage() {
  return `<section class="page home-page" aria-labelledby="page-title">
    <div class="home-intro">${flourish}<p class="eyebrow">Bersama keluarga kami</p><p class="invitation-line">Dengan penuh kesyukuran, kami menjemput anda ke majlis perkahwinan</p></div>
    <h1 id="page-title" class="couple-names" tabindex="-1"><span class="groom-name">Shahizwan</span><span class="ampersand">&</span><span class="bride-name">Anis</span></h1>
    <div class="full-names"><span>${wedding.groom}</span><span class="name-divider">&</span><span>${wedding.bride}</span></div>
    <div class="event-summary"><span class="eyebrow">${wedding.day}</span><p class="wedding-date"><time datetime="${wedding.dateISO}">${wedding.date}</time></p><p>${wedding.time}</p><span class="short-rule"></span><p class="venue-name">${wedding.venue}</p><p class="venue-region">${wedding.location}</p></div>
    <div class="parents"><div><span class="eyebrow">Putera kepada</span><p>${wedding.parents.groom[0]}<br><span>&</span> ${wedding.parents.groom[1]}</p></div><div><span class="eyebrow">Puteri kepada</span><p>${wedding.parents.bride[0]}<br><span>&</span> ${wedding.parents.bride[1]}</p></div></div>
    <a class="text-link home-rsvp" href="#rsvp">Kami menanti kehadiran anda <span aria-hidden="true">↗</span></a>
  </section>`;
}

function dresscodePage() {
  const colors = [{name:'Biru gelap',hex:'#16223C'},{name:'Hijau lembut',hex:'#9B9F87'},{name:'Hijau zaitun',hex:'#666B4B'},{name:'Perang kelabu',hex:'#9B8A75'},{name:'Perang koko',hex:'#624A3D'},{name:'Kelabu arang',hex:'#414141'}];
  return `<section class="page dresscode-page" aria-labelledby="page-title"><div class="section-heading"><p class="eyebrow">Inspirasi gaya</p><h1 id="page-title" tabindex="-1">Berpakaian indah,<br><em>raikan dengan selesa.</em></h1><p>Tradisional / Santai kemas</p></div>
    ${dresscodeBoard()}
    <div class="palette"><p class="eyebrow">Pilihan warna inspirasi</p><ul aria-label="Inspirasi warna pakaian">${colors.map(c=>`<li><span class="swatch" style="--swatch:${c.hex}" aria-hidden="true"></span><span>${c.name}</span></li>`).join('')}</ul></div>
    <p class="dresscode-note">Apa sahaja warna pilihan anda, <strong>kecuali putih dan perak.</strong><br><span>Palet ini sekadar inspirasi — pakailah yang membuat anda selesa.</span></p>
  </section>`;
}

function locationPage() {
  return `<section class="page location-page" aria-labelledby="page-title"><div class="section-heading"><p class="eyebrow">Lokasi majlis</p><h1 id="page-title" tabindex="-1">Jumpa anda <em>di sini.</em></h1></div>${fan}<div class="location-details"><span class="eyebrow">Majlis resepsi</span><h2>${wedding.venue}</h2><p>${wedding.location}</p><p class="location-time">${wedding.date}<span>·</span>${wedding.time}</p><a class="button" href="${wedding.mapsUrl}" target="_blank" rel="noopener noreferrer">${pin}Buka Google Maps${external}</a><p class="map-caption">Carian lokasi: Dewan Perdana, Tampin</p></div><div class="contacts"><p class="eyebrow">Perlukan bantuan ke lokasi majlis?</p><div class="contact-grid">${wedding.contacts.map(c=>`<a class="contact" href="https://wa.me/${c.international}?text=${encodeURIComponent('Assalamualaikum, saya ingin bertanya tentang majlis Shahizwan & Anis pada 9 Januari 2027.')}" target="_blank" rel="noopener noreferrer"><span class="eyebrow">${c.side}</span><span class="contact-name">${c.name} ${external}</span><span class="contact-number">${c.phone} · WhatsApp</span></a>`).join('')}</div></div></section>`;
}

function rsvpPage() {
  if (confirmation) return confirmationPage();
  return `<section class="page rsvp-page" aria-labelledby="page-title"><div class="section-heading">${flourish}<p class="eyebrow">Tempat untuk anda</p><h1 id="page-title" tabindex="-1">Sudi <em>hadir bersama kami?</em></h1><p>Kehadiran anda sangat bermakna buat kami.</p></div>
    <form id="rsvp-form" novalidate><div class="form-field"><label for="guest-name">Nama penuh</label><input id="guest-name" name="name" autocomplete="name" maxlength="120" required placeholder="Nama anda" aria-describedby="name-error" /><p id="name-error" class="field-error"></p></div>
    <fieldset class="attendance-field"><legend>Kehadiran</legend><div class="attendance-options"><label><input type="radio" name="attendance" value="yes" required aria-describedby="attendance-error" /><span><span class="radio-dot"></span>Ya, saya akan hadir<span class="option-subtitle">Dengan sukacitanya</span></span></label><label><input type="radio" name="attendance" value="no" required aria-describedby="attendance-error" /><span><span class="radio-dot"></span>Maaf, tidak dapat hadir<span class="option-subtitle">Dengan penuh rasa kesal</span></span></label></div><p id="attendance-error" class="field-error"></p></fieldset>
    <div class="form-field pax-field"><label for="guest-pax">Bilangan tetamu <span>Termasuk diri anda</span></label><div class="pax-input"><button type="button" class="pax-minus" aria-label="Kurangkan bilangan tetamu">−</button><input id="guest-pax" name="pax" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" required aria-describedby="pax-error" /><button type="button" class="pax-plus" aria-label="Tambah bilangan tetamu">+</button></div><p id="pax-error" class="field-error"></p></div>
    <button type="submit" class="button submit-button">Hantar RSVP ${arrow()}</button><p class="demo-notice"><span class="demo-dot" aria-hidden="true"></span>Pratonton sahaja. Respons tidak disimpan atau dihantar.</p></form><p class="rsvp-signoff">Kami tidak sabar untuk bertemu anda. <span aria-hidden="true">♡</span></p></section>`;
}

function confirmationPage() {
  return `<section class="page rsvp-page confirmation-page" aria-labelledby="page-title">${flourish}<p class="eyebrow">${confirmation.attendance === 'yes' ? 'Dengan penuh gembira' : 'Dengan penuh kasih'}</p><h1 id="page-title" tabindex="-1">${confirmation.attendance === 'yes' ? 'Selangkah lebih dekat<br>ke <em>hari bahagia kami.</em>' : 'Anda tetap bersama kami<br><em>dalam doa.</em>'}</h1><p class="confirmation-copy">${confirmation.attendance === 'yes' ? 'Terima kasih kerana sudi meraikan kami.' : 'Terima kasih atas doa dan ingatan anda.'}</p><div class="demo-confirmation"><span class="eyebrow">Pengesahan pratonton</span><p>Ini simulasi RSVP sahaja.<br>Respons anda belum disimpan atau dihantar kepada penganjur.</p></div><button class="text-link edit-rsvp">Kembali ke borang ${arrow('left')}</button><a class="text-link" href="#note">Pesanan kecil untuk anda ${arrow()}</a></section>`;
}

function notePage() {
  const photos = ['shah-1.jpg','shah-2.jpg','shah-3.jpg','anis-1.jpg','anis-2.jpg','anis-3.jpg'];
  return `<section class="page note-page" aria-labelledby="page-title"><div class="section-heading"><p class="eyebrow">Daripada kami</p><h1 id="page-title" tabindex="-1">Semuanya bermula<br>dengan <em>takdir.</em></h1></div><div class="scrapbook"><article class="letter"><span class="paper-tape" aria-hidden="true"></span>${flourish}<p class="letter-greeting">Buat insan tersayang,</p>${wedding.closing.map(p=>`<p>${p}</p>`).join('')}<p class="letter-signoff">🤍 Shahizwan & Anis</p><img class="signature" src="/assets/monogram.jpeg" alt="Tandatangan S&A" width="146" height="78" /></article><div class="memory-photos">${photos.map((photo,i)=>`<figure class="memory memory-${i+1}"><img src="/assets/${photo}" alt="Kenangan zaman kecil ${i < 3 ? 'Shahizwan' : 'Anis'}, foto ${i%3+1}" loading="lazy"/><figcaption>${i===0?'suatu ketika dahulu':i===3?'permulaan kecil':i===2||i===5?'dan inilah kami':'ketika kecil'}</figcaption></figure>`).join('')}</div></div><p class="note-bottom">Dua kisah kecil. Satu takdir yang indah.</p></section>`;
}

const templates = [homePage, dresscodePage, locationPage, rsvpPage, notePage];
function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.querySelector('.menu-toggle').setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  document.querySelector('.sidebar').classList.toggle('is-open', open);
}

function renderPage({ focus = false } = {}) {
  cleanupPage();
  cleanupPage = () => {};
  const hash = location.hash.slice(1);
  const previousIndex = activeIndex;
  activeIndex = Math.max(0, pages.findIndex(p=>p.id===hash));
  if (hash && !pages.some(p=>p.id===hash)) history.replaceState(null, '', '#home');
  const page = pages[activeIndex];
  document.title = `${page.label} · Shahizwan & Anis`;
  document.querySelectorAll('[data-page]').forEach(link=>{
    if (link.dataset.page === page.id) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  main.style.setProperty('--page-enter-offset', activeIndex < previousIndex ? '-30px' : '30px');
  main.innerHTML = templates[activeIndex]();
  main.dataset.page = page.id;
  document.querySelector('.page-number').textContent = `0${activeIndex+1}`;
  document.querySelector('.progress-line > span').style.width = `${(activeIndex+1)*20}%`;
  const gestureLabel = matchMedia('(pointer: coarse)').matches ? 'Leret' : 'Skrol';
  document.querySelector('.scroll-hint').textContent = activeIndex === 4 ? `${gestureLabel} ke atas untuk lihat semula ↑` : `${gestureLabel} untuk lihat lagi ↓`;
  document.querySelector('.page-prev').disabled = activeIndex===0;
  const next = document.querySelector('.page-next');
  next.querySelector('span').textContent = activeIndex===4 ? 'Kembali ke awal' : pages[activeIndex+1].label;
  next.setAttribute('aria-label',activeIndex===4 ? 'Kembali ke Utama' : `Halaman seterusnya: ${pages[activeIndex+1].label}`);
  setMenu(false);
  window.scrollTo({ top: 0, behavior: 'instant' });
  main.scrollTop = 0;
  if (focus) scrollNavigation.reset();
  if (page.id === 'rsvp') bindRsvp();
  if (page.id === 'dresscode') cleanupPage = bindDresscode();
  if (focus) document.querySelector('#page-title').focus({preventScroll:true});
  document.querySelector('#page-announcement').textContent = `${page.label}, halaman ${activeIndex+1} daripada 5`;
}

function bindRsvp() {
  const form = document.querySelector('#rsvp-form');
  if (!form) {
    document.querySelector('.edit-rsvp').addEventListener('click',()=>{confirmation=null;renderPage({focus:true});});
    return;
  }
  form.elements.name.value = draft.name;
  form.elements.attendance.value = draft.attendance;
  form.elements.pax.value = draft.pax;
  const updatePaxVisibility = () => {
    const declined = form.elements.attendance.value === 'no';
    document.querySelector('.pax-field').hidden = declined;
    form.elements.pax.disabled = declined;
    form.elements.pax.required = !declined;
  };
  const capture = () => {
    draft = {name:form.elements.name.value,attendance:form.elements.attendance.value,pax:form.elements.pax.value};
    updatePaxVisibility();
  };
  updatePaxVisibility();
  form.addEventListener('input', capture);
  form.addEventListener('change', capture);
  const step = amount => {const field=form.elements.pax; field.value=Math.max(1,Math.min(99,(Number(field.value)||1)+amount));capture();};
  document.querySelector('.pax-minus').addEventListener('click',()=>step(-1));
  document.querySelector('.pax-plus').addEventListener('click',()=>step(1));
  form.addEventListener('submit',async event=>{
    event.preventDefault();capture();
    const errors=validateRsvp(draft);
    for(const field of ['name','attendance','pax']) {
      document.querySelector(`#${field}-error`).textContent=errors[field]||'';
      form.querySelectorAll(`[name="${field}"]`).forEach(input=>input.setAttribute('aria-invalid',String(Boolean(errors[field]))));
    }
    if(Object.keys(errors).length){form.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();return;}
    const button=form.querySelector('[type="submit"]');
    button.disabled=true;
    const result=await submitRsvp(draft);
    if(result.ok){confirmation=result;renderPage({focus:true});}
    else button.disabled=false;
  });
}

document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
document.querySelector('.menu-toggle').addEventListener('click',()=>setMenu(document.querySelector('.menu-toggle').getAttribute('aria-expanded')!=='true'));
document.querySelector('.page-prev').addEventListener('click',()=>{if(activeIndex>0) location.hash=pages[activeIndex-1].id;});
document.querySelector('.page-next').addEventListener('click',()=>{location.hash=pages[(activeIndex+1)%pages.length].id;});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') {setMenu(false);return;}
  if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.target.closest('input,textarea,select,button,[contenteditable="true"]')) return;
  if(event.key==='ArrowRight' && activeIndex<4) {event.preventDefault();location.hash=pages[activeIndex+1].id;}
  if(event.key==='ArrowLeft' && activeIndex>0) {event.preventDefault();location.hash=pages[activeIndex-1].id;}
});
window.addEventListener('hashchange',()=>renderPage({focus:true}));
renderPage();
