import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/great-vibes/latin-400.css';
import '@fontsource/allura/latin-400.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './styles.css';
import './fullscreen.css';
import './event-details.css';
import './location.css';
import { pages as allPages, wedding } from './content.js';
import { brideSite, siteConfig } from './config/index.js';
import { submitRsvp, validateRsvp } from './rsvp.js';
import { installScrollNavigation } from './scroll-navigation.js';
import { createPageTransitions } from './page-transitions.js';

const pages = (siteConfig ? !siteConfig.showInvitationPage : new URLSearchParams(location.search).get('invite') === 'lelaki')
  ? allPages.filter(page => page.id !== 'invitation')
  : allPages;

const arrow = (direction = 'right') => `<svg viewBox="0 0 32 16" fill="none" aria-hidden="true" class="arrow-icon ${direction}"><path d="M1 8h28M22 1l7 7-7 7"/></svg>`;
const flourish = `<svg class="flourish" viewBox="0 0 100 30" fill="none" aria-hidden="true"><path d="M8 15h26m32 0h26M50 15c-18-22-27 0-10 0-17 0-8 22 10 0 18 22 27 0 10 0 17 0 8-22-10 0Z"/><path d="M50 5v20M43 15h14"/></svg>`;
const external = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="small-icon"><path d="M5 15 15 5M5 5h10v10"/></svg>`;
const pin = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="small-icon"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="mobile-header">
    <a class="wordmark" href="#home" aria-label="Shahizwan dan Anis — Utama"><img src="/assets/monogram-transparent.png" alt="" width="292" height="157" /></a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Buka menu"><span></span><span></span></button>
  </header>
  <aside class="sidebar">
    <a class="brand" href="#home" aria-label="Shahizwan dan Anis — Utama"><img src="/assets/monogram.jpeg" alt="S&A" width="146" height="78" /></a>
    <nav id="site-nav" aria-label="Halaman jemputan">${pages.map((page,i)=>`<a href="#${page.id}" data-page="${page.id}"><span class="nav-index">0${i+1}</span>${page.label}<span class="nav-dot" aria-hidden="true"></span></a>`).join('')}</nav>
  </aside>
  <div class="page-shell">
    <header class="desktop-header"><span>WALIMATULURUS</span></header>
    <main id="main" tabindex="-1"></main>
  </div>
  <div id="page-announcement" class="sr-only" aria-live="polite"></div>`;

const main = document.querySelector('main');
const pageTransitions = createPageTransitions(main);
let activeIndex = 0;
let draft = { name: '', attendance: '', pax: '1' };
let confirmation = null;
let fitFrame = 0;
let typographyReady = false;

function fitActivePage() {
  const page = main.querySelector('.page');
  if (!page || !main.clientHeight) return;
  page.style.setProperty('--page-scale', '1');
  if (page.hasAttribute('data-page-scroll')) {
    page.style.height = `${main.clientHeight}px`;
    return;
  }
  const scale = Math.min(1, Math.max(0, (main.clientHeight - 8) / page.offsetHeight));
  page.style.setProperty('--page-scale', scale.toFixed(4));
}

function queueFitActivePage() {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitActivePage);
}
const scrollNavigation = installScrollNavigation({
  container: main,
  menuIsOpen: () => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true',
  navigate: direction => {
    const next = activeIndex + direction;
    if (next < 0 || next >= pages.length) return false;
    location.hash = pages[next].id;
    return true;
  },
});

function homePage() {
  const region = wedding.location.split(',').at(-1).trim();
  return `<section class="page home-page" aria-labelledby="page-title">
    <img class="home-flower" src="/assets/home-daisies-transparent.png" alt="" aria-hidden="true" width="1086" height="1448" />
    <h1 id="page-title" class="couple-names" tabindex="-1"><span class="groom-name">Shahizwan</span><span class="ampersand">&</span><span class="bride-name">Anis</span></h1>
    <div class="event-summary"><span class="eyebrow">${wedding.day}</span><p class="wedding-date"><time datetime="${wedding.dateISO}">${wedding.date}</time></p><p>${wedding.time}</p><span class="short-rule"></span><p class="venue-name">${region}</p></div>
  </section>`;
}

function invitationPage() {
  const invitation = siteConfig?.invitation ?? brideSite.invitation;
  const hostsMarkup = Array.isArray(invitation.hosts)
    ? `<span>${invitation.hosts[0]}</span><span class="invitation-host-divider">&amp;</span><span>${invitation.hosts[1]}</span>`
    : invitation.hosts;
  const hostsClass = Array.isArray(invitation.hosts) ? ' invitation-hosts-stack' : '';
  const firstNameClass = `invitation-couple-name invitation-name-${invitation.firstNameRole}`;
  const secondNameClass = `invitation-couple-name invitation-name-${invitation.secondNameRole}`;
  const renderName = (name, role) => role === 'bride' && name.startsWith('A')
    ? `<span class="invitation-bride-initial">A</span>${name.slice(1)}`
    : name;
  return `<section class="page invitation-page" aria-labelledby="page-title">
    <p class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
    <h1 id="page-title" class="sr-only" tabindex="-1">Jemputan</h1>
    <div class="invitation-copy">
      <p>Dengan penuh kesyukuran dan rasa hormat</p>
      <p class="invitation-hosts${hostsClass}">${hostsMarkup}</p>
      <p>menjemput</p>
      <p class="invitation-address">Tan Sri / Puan Sri / Dato’ / Datin / Tuan / Puan / Encik / Cik</p>
      <p>${invitation.event}</p>
      <p class="invitation-couple"><span class="${firstNameClass}">${renderName(invitation.firstName, invitation.firstNameRole)}</span><span class="invitation-name-divider">&amp;</span><span class="${secondNameClass}">${renderName(invitation.secondName, invitation.secondNameRole)}</span></p>
    </div>
  </section>`;
}

function eventDetailsPage() {
  const details = wedding.eventDetails;
  const timelineIcons = [
    '<circle cx="8" cy="6" r="2"/><circle cx="16" cy="7" r="2"/><path d="M3 19v-6c0-4 10-4 10 0v6M14 11c3-1 7 1 7 4v4M6 19v-4m4 4v-4m7 4v-4"/>',
    '<circle cx="8" cy="13" r="5"/><circle cx="16" cy="13" r="5"/><path d="m14 4 2-2 2 2-2 3Z"/>',
    '<circle cx="13" cy="12" r="7"/><path d="M2 3v5c0 2 4 2 4 0V3M4 3v18M21 3v18M21 3c-3 2-3 7 0 8"/>',
  ];
  return `<section class="page event-details-page" data-page-scroll tabindex="0" aria-labelledby="page-title">
    <div class="event-details-content">
      <h1 id="page-title" class="event-section-title" tabindex="-1">Dress Code</h1>
      <div class="event-dress-code"><p>${details.dressCode}</p><p>${details.dressCodeNote}</p></div>
      <div class="event-details-columns">
        <section class="event-schedule" aria-labelledby="schedule-title"><h2 id="schedule-title" class="event-section-title">Atur Cara Majlis</h2>
          <dl class="event-timeline">${details.schedule.map((item, index) => `<div class="event-schedule-entry"><dt><span class="event-timeline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${timelineIcons[index]}</svg></span>${item.time}</dt><dd>${item.title}${item.description ? `<p class="event-schedule-description">${item.description}</p>` : ''}</dd></div>`).join('')}</dl>
        </section>
        <section class="event-menu" aria-labelledby="menu-title"><div class="event-menu-heading"><img class="event-menu-flower" src="/assets/home-daisies-transparent.png" alt="" aria-hidden="true" width="1086" height="1448" /><h2 id="menu-title" class="event-section-title">Hidangan</h2></div><ul class="event-menu-items">${details.menu.map(item => `<li>${item}</li>`).join('')}</ul></section>
      </div>
    </div>
  </section>`;
}

function locationPage() {
  const inviteSide = siteConfig?.inviteSide ?? new URLSearchParams(location.search).get('invite') ?? 'perempuan';
  const contacts = inviteSide === 'perempuan'
    ? wedding.contacts.filter(contact => contact.side === 'Pihak perempuan')
    : inviteSide === 'lelaki'
      ? wedding.contacts.filter(contact => contact.side === 'Pihak lelaki')
      : wedding.contacts;
  return `<section class="page location-page" data-page-scroll tabindex="0" aria-labelledby="page-title">
    <div class="location-content">
      <div class="section-heading"><p class="eyebrow">Lokasi majlis</p><h1 id="page-title" class="sr-only" tabindex="-1">Lokasi majlis</h1></div>
      <img class="venue-lineart" src="/assets/dewan-perdana-lineart.svg" alt="Lakaran garisan fasad Dewan Perdana Tampin" width="760" height="305" />
      <div class="location-details"><h2>${wedding.venue}</h2><p>${wedding.location}</p><p class="location-time">${wedding.date}<span>·</span>${wedding.time}</p><a class="button" href="${wedding.mapsUrl}" target="_blank" rel="noopener noreferrer">${pin}Buka Google Maps${external}</a><p class="map-caption">Carian lokasi: Dewan Perdana, Tampin</p></div>
      <div class="contacts"><h2 class="assistance-heading">${wedding.assistanceHeading}</h2><div class="contact-grid" data-count="${contacts.length}">${contacts.map(c=>`<a class="contact" href="https://wa.me/${c.international}?text=${encodeURIComponent('Assalamualaikum, saya ingin bertanya tentang majlis Shahizwan & Anis pada 9 Januari 2027.')}" target="_blank" rel="noopener noreferrer"><span class="contact-name">${c.name} ${external}</span><span class="contact-number">${c.phone} · WhatsApp</span></a>`).join('')}</div></div>
      <aside class="parking-note" aria-label="Tempat Letak Kenderaan"><strong>Tempat Letak Kenderaan:</strong> ${wedding.parkingNote}</aside>
    </div>
  </section>`;

}

function rsvpPage() {
  if (confirmation) return confirmationPage();
  return `<section class="page rsvp-page" aria-labelledby="page-title"><div class="section-heading"><h1 id="page-title" tabindex="-1">RSVP</h1></div>
    <form id="rsvp-form" novalidate><div class="form-field"><label for="guest-name">Nama penuh</label><input id="guest-name" name="name" autocomplete="name" maxlength="120" required placeholder="Nama anda" aria-describedby="name-error" /><p id="name-error" class="field-error"></p></div>
    <fieldset class="attendance-field"><legend>Kehadiran</legend><div class="attendance-options"><label><input type="radio" name="attendance" value="yes" required aria-describedby="attendance-error" /><span><span class="radio-dot"></span>Saya akan hadir</span></label><label><input type="radio" name="attendance" value="no" required aria-describedby="attendance-error" /><span><span class="radio-dot"></span>Maaf, tidak dapat hadir</span></label></div><p id="attendance-error" class="field-error"></p></fieldset>
    <div class="form-field pax-field"><label for="guest-pax">Bilangan tetamu <span>Termasuk diri anda</span></label><div class="pax-input"><button type="button" class="pax-minus" aria-label="Kurangkan bilangan tetamu">−</button><input id="guest-pax" name="pax" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" required aria-describedby="pax-error" /><button type="button" class="pax-plus" aria-label="Tambah bilangan tetamu">+</button></div><p id="pax-error" class="field-error"></p></div>
    <button type="submit" class="button submit-button">Hantar RSVP ${arrow()}</button></form></section>`;
}

function confirmationPage() {
  return `<section class="page rsvp-page confirmation-page" aria-labelledby="page-title">${flourish}<p class="eyebrow">${confirmation.attendance === 'yes' ? 'Dengan penuh gembira' : 'Dengan penuh kasih'}</p><h1 id="page-title" tabindex="-1">${confirmation.attendance === 'yes' ? 'Selangkah lebih dekat<br>ke <em>hari bahagia kami.</em>' : 'Anda tetap bersama kami<br><em>dalam doa.</em>'}</h1><p class="confirmation-copy">${confirmation.attendance === 'yes' ? 'Terima kasih kerana sudi meraikan kami.' : 'Terima kasih atas doa dan ingatan anda.'}</p><div class="demo-confirmation"><span class="eyebrow">Pengesahan pratonton</span><p>Ini simulasi RSVP sahaja.<br>Respons anda belum disimpan atau dihantar kepada penganjur.</p></div><button class="text-link edit-rsvp">Kembali ke borang ${arrow('left')}</button><a class="text-link" href="#note">Pesanan kecil untuk anda ${arrow()}</a></section>`;
}

function notePage() {
  const photos = ['shah1','anis3baru','shah2','anis2','shah3baru','anis1'];
  const mobilePortrait = photo => photo === 'anis3baru'
    ? '<source media="(max-width: 767px)" srcset="/assets/croped/anis3baru-clean.png" />'
    : '';
  return `<section class="page note-page" aria-labelledby="page-title"><h1 id="page-title" class="sr-only" tabindex="-1">Pesanan</h1><div class="scrapbook"><article class="letter">${wedding.closing.map(p=>`<p>${p}</p>`).join('')}<p class="letter-signoff">🤍 Shahizwan & Anis Jamilah</p></article><div class="memory-photos">${photos.map((photo,i)=>`<figure class="memory memory-${i+1} memory-${photo}"><picture>${mobilePortrait(photo)}<img src="/assets/croped/${photo}-trim.png" alt="Kenangan zaman kecil ${photo.startsWith('shah') ? 'Shahizwan' : 'Anis'}, foto ${i%3+1}" loading="lazy"/></picture></figure>`).join('')}</div></div></section>`;
}

const templates = { home: homePage, invitation: invitationPage, dresscode: eventDetailsPage, location: locationPage, rsvp: rsvpPage, note: notePage };
function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.querySelector('.menu-toggle').setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  document.querySelector('.sidebar').classList.toggle('is-open', open);
}

function renderPage({ focus = false, immediate = false } = {}) {
  if (!typographyReady) return;
  if (immediate) {
    pageTransitions.finish();
    commitPage({ focus });
    return;
  }
  const nextIndex = Math.max(0, pages.findIndex(p => p.id === location.hash.slice(1)));
  void pageTransitions.run(() => commitPage({ focus }), {
    direction: nextIndex < activeIndex ? -1 : 1,
    initial: !main.querySelector('.page'),
  });
}

function commitPage({ focus = false } = {}) {
  const hash = location.hash.slice(1);
  activeIndex = Math.max(0, pages.findIndex(p=>p.id===hash));
  if (hash && !pages.some(p=>p.id===hash)) history.replaceState(null, '', '#home');
  const page = pages[activeIndex];
  document.title = `${page.label} · Shahizwan & Anis`;
  document.querySelectorAll('[data-page]').forEach(link=>{
    if (link.dataset.page === page.id) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  main.innerHTML = templates[page.id]();
  if (page.id === 'location') {
    const illustration = main.querySelector('.venue-lineart');
    illustration.src = '/assets/dewan_sketch-transparent.png';
    illustration.width = 1526;
    illustration.height = 439;
  }
  main.dataset.page = page.id;
  setMenu(false);
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) scrollNavigation.reset();
  if (page.id === 'rsvp') bindRsvp();
  main.querySelectorAll('img').forEach(image => image.addEventListener('load', queueFitActivePage, { once: true }));
  fitActivePage();
  queueFitActivePage();
  document.fonts.ready.then(queueFitActivePage);
  if (focus) document.querySelector('#page-title').focus({preventScroll:true});
  document.querySelector('#page-announcement').textContent = `${page.label}, halaman ${activeIndex+1} daripada ${pages.length}`;
}

function bindRsvp() {
  const form = document.querySelector('#rsvp-form');
  if (!form) {
    document.querySelector('.edit-rsvp').addEventListener('click',()=>{confirmation=null;renderPage({focus:true,immediate:true});});
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
    if(result.ok){confirmation=result;renderPage({focus:true,immediate:true});}
    else button.disabled=false;
  });
}

document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
document.querySelector('.menu-toggle').addEventListener('click',()=>setMenu(document.querySelector('.menu-toggle').getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') {setMenu(false);return;}
  if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.target.closest('input,textarea,select,button,[contenteditable="true"]')) return;
  if(event.key==='ArrowRight' && activeIndex<pages.length-1) {event.preventDefault();location.hash=pages[activeIndex+1].id;}
  if(event.key==='ArrowLeft' && activeIndex>0) {event.preventDefault();location.hash=pages[activeIndex-1].id;}
});
window.addEventListener('hashchange',()=>renderPage({focus:true}));
window.addEventListener('resize', queueFitActivePage);
// Render only after local typefaces settle, so the first reveal never swaps fonts.
const initialFonts = [
  '400 16px "Great Vibes"',
  '400 16px "Allura"',
  '400 16px "Cormorant Garamond"',
  '500 16px "Cormorant Garamond"',
  'italic 400 16px "Cormorant Garamond"',
  '400 16px "DM Sans"',
  '500 16px "DM Sans"',
];
Promise.allSettled(initialFonts.map(font => document.fonts.load(font))).then(() => {
  typographyReady = true;
  renderPage();
});
