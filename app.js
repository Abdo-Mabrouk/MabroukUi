const projectFiles = [
  ['mabroukui-6.png', 'تطبيق السيارات', 'تجربة تطبيق للبحث عن السيارات'],
  ['mabroukui-7.png', 'تطبيق تحويل الأموال', 'تجربة مالية للهواتف'],
  ['mabroukui-5.png', 'لوحة إدارة المتجر', 'تصميم منتج رقمي'],
  ['mabroukui-8.png', 'إدارة المشاريع', 'تجربة متابعة المشاريع'],
  ['mabroukui-3.png', 'نظام الموارد البشرية', 'لوحة تحكم للموظفين'],
  ['mabroukui-9.png', 'تطبيق الاتحاد السعودي للاكروس', 'تجربة رياضية'],
  ['mabroukui-10.png', 'تطبيق الملف الشخصي', 'تجربة تواصل ومشاركة'],
  ['mabroukui-11.png', 'تطبيق The 6 Talk', 'تصميم تجربة للهواتف'],
  ['mabroukui.png', 'منصتي التعليمية', 'موقع وتطبيق تعليمي'],
  ['mabroukui-1.png', 'جمعية طريق السلام', 'موقع جمعية'],
  ['mabroukui-2.png', 'ميدان التخزين', 'موقع وتطبيق خدمات'],
  ['mabroukui-4.png', 'شركة البناء الحديثة', 'موقع شركة'],
];

const projectList = document.querySelector('#projectList');
projectFiles.forEach(([file, title, category], index) => {
  const card = document.createElement('figure');
  card.className = 'project-card';
  const img = document.createElement('img');
  img.src = `assets/projects/${file}`;
  img.alt = title;
  img.loading = index < 2 ? 'eager' : 'lazy';
  img.decoding = 'async';
  const caption = document.createElement('figcaption');
  const heading = document.createElement('strong');
  heading.textContent = title;
  const detail = document.createElement('span');
  detail.textContent = category;
  caption.append(heading, detail);
  card.append(img, caption);
  projectList.append(card);
});

const portrait = document.querySelector('#portraitImage');
const frameMap = new Map();
const frameKey = (row, column) => `${row}-${column}`;
const framePath = (row, column) => `assets/frames/frame-r${row + 1}-c${column + 1}.png`;
let framePackReady = false;
let lastFrameKey = '1-2';
let pointerTarget = { x: 0.5, y: 0.5 };
let pointerCurrent = { x: 0.5, y: 0.5 };
let pointerAnimating = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const workScroll = document.querySelector('#workScroll');
const projectRuler = document.querySelector('#projectRuler');
const rulerTicks = document.querySelector('#rulerTicks');
const projectCards = [...projectList.querySelectorAll('.project-card')];
const rulerButtons = projectCards.map((card, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ruler-tick';
  button.setAttribute('aria-label', `${projectFiles[index][1]}، المشروع ${index + 1} من ${projectCards.length}`);
  button.addEventListener('click', () => {
    const viewport = workScroll.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    const nextTop = workScroll.scrollTop + cardBox.top - viewport.top + cardBox.height / 2 - viewport.height / 2;
    workScroll.scrollTo({ top: nextTop, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  rulerTicks.append(button);
  return button;
});

let rulerFrame = 0;
function updateProjectRuler() {
  rulerFrame = 0;
  if (!projectCards.length) return;
  const viewport = workScroll.getBoundingClientRect();
  const center = viewport.top + viewport.height / 2;
  let activeIndex = 0;
  let nearest = Infinity;
  projectCards.forEach((card, index) => {
    const box = card.getBoundingClientRect();
    const distance = Math.abs(box.top + box.height / 2 - center);
    if (distance < nearest) { nearest = distance; activeIndex = index; }
  });
  rulerButtons.forEach((button, index) => {
    const active = index === activeIndex;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  const scrollRange = Math.max(1, workScroll.scrollHeight - workScroll.clientHeight);
  const progress = Math.min(1, Math.max(0, workScroll.scrollTop / scrollRange));
  const rulerRange = Math.max(0, projectRuler.clientHeight - 32);
  projectRuler.style.setProperty('--progress-px', `${progress * rulerRange}px`);
  projectRuler.style.setProperty('--position-px', `${16 + progress * rulerRange}px`);
}
function queueRulerUpdate() {
  if (!rulerFrame) rulerFrame = requestAnimationFrame(updateProjectRuler);
}
workScroll.addEventListener('scroll', queueRulerUpdate, { passive: true });
window.addEventListener('resize', queueRulerUpdate);
queueRulerUpdate();

Promise.all(Array.from({ length: 15 }, (_, index) => {
  const row = Math.floor(index / 5);
  const column = index % 5;
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve([frameKey(row, column), image]);
    image.onerror = () => resolve(null);
    image.src = framePath(row, column);
  });
})).then(results => {
  if (results.every(Boolean)) {
    results.forEach(([key, image]) => frameMap.set(key, image));
    framePackReady = true;
    updatePortrait();
  } else {
    portrait.src = 'assets/portrait-base.png';
    portrait.alt = 'بورتريه أحمد مبروك';
  }
});

function updatePortrait() {
  if (!framePackReady) return;
  const row = Math.min(2, Math.floor(pointerCurrent.y * 3));
  const column = Math.min(4, Math.floor(pointerCurrent.x * 5));
  const key = frameKey(row, column);
  if (key === lastFrameKey) return;
  portrait.src = frameMap.get(key).src;
  lastFrameKey = key;
}

function animatePortrait() {
  const amount = reducedMotion ? 1 : 0.18;
  pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * amount;
  pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * amount;
  updatePortrait();
  if (Math.abs(pointerTarget.x - pointerCurrent.x) + Math.abs(pointerTarget.y - pointerCurrent.y) > 0.002) {
    requestAnimationFrame(animatePortrait);
  } else {
    pointerCurrent = { ...pointerTarget };
    updatePortrait();
    pointerAnimating = false;
  }
}

function queuePortrait() {
  if (!pointerAnimating) {
    pointerAnimating = true;
    requestAnimationFrame(animatePortrait);
  }
}

window.addEventListener('pointermove', event => {
  pointerTarget.x = Math.min(1, Math.max(0, event.clientX / innerWidth));
  pointerTarget.y = Math.min(1, Math.max(0, event.clientY / innerHeight));
  queuePortrait();
}, { passive: true });
window.addEventListener('blur', () => {
  pointerTarget = { x: 0.5, y: 0.5 };
  queuePortrait();
});
document.querySelector('#portraitBox').addEventListener('keydown', event => {
  const steps = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.34], ArrowDown: [0, 0.34] };
  if (!steps[event.key]) return;
  event.preventDefault();
  pointerTarget.x = Math.min(1, Math.max(0, pointerTarget.x + steps[event.key][0]));
  pointerTarget.y = Math.min(1, Math.max(0, pointerTarget.y + steps[event.key][1]));
  queuePortrait();
});

const tabs = document.querySelectorAll('.nav-tab');
const panels = {
  work: document.querySelector('#workPanel'),
  experience: document.querySelector('#experiencePanel'),
  about: document.querySelector('#aboutPanel'),
};
function showTab(name) {
  tabs.forEach(tab => {
    const selected = tab.dataset.tab === name;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  Object.entries(panels).forEach(([key, panel]) => {
    panel.hidden = key !== name;
    panel.classList.toggle('is-visible', key === name);
  });
}
tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.tab)));

const themeButton = document.querySelector('#themeButton');
themeButton.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
  themeButton.querySelector('span').innerHTML = dark ? '<img src="assets/icons/sun-03.svg" width="20" height="20" alt="">' : '<img src="assets/icons/moon-02.svg" width="20" height="20" alt="">';
});

let english = false;
const translations = {
  ar: { about: 'عنــي', experience: 'الخبرات', work: 'معرض الأعمال', available: 'متاح للعمل', name: 'أحمد مبروك', role: 'مصمم واجهة المستخدم', lede: 'متخصص في تصميم المنتجات الرقمية المعقدة وواسعة النطاق. أركز على بناء أنظمة متكاملة وقابلة للتوسع، وتنظيم المنتجات كثيفة البيانات، مع تحقيق التوازن بين احتياجات المستخدم وأهداف المنتج وقابلية التنفيذ.', years: 'سنوات خبرة', projects: 'مشروع', sectors: 'قطاع', message: 'إرسال رسالة', cv: 'تنزيل السيرة الذاتية' },
  en: { about: 'About', experience: 'Experience', work: 'Portfolio', available: 'Available for work', name: 'Ahmed Mabrouk', role: 'UI/UX Designer', lede: 'I design complex digital products at scale. My focus is on clear, scalable systems that balance user needs, product goals, and practical implementation.', years: 'Years', projects: 'Projects', sectors: 'Sectors', message: 'Send a message', cv: 'Download CV' },
};
document.querySelector('#languageButton').addEventListener('click', event => {
  english = !english;
  const t = translations[english ? 'en' : 'ar'];
  tabs.forEach(tab => { tab.textContent = t[tab.dataset.tab]; });
  document.querySelector('#availabilityText').textContent = t.available;
  document.querySelector('#profileName').textContent = t.name;
  document.querySelector('#profileRole').textContent = t.role;
  document.querySelector('#profileLede').textContent = t.lede;
  document.querySelector('#yearsLabel').textContent = t.years;
  document.querySelector('#projectsLabel').textContent = t.projects;
  document.querySelector('#sectorsLabel').textContent = t.sectors;
  document.querySelector('#messageLink').textContent = t.message;
  document.querySelector('#cvButton').innerHTML = `${t.cv} <img src="assets/icons/download-02.svg" width="16" height="16" alt="" aria-hidden="true">`;
  event.currentTarget.textContent = english ? 'العربية' : 'English';
  event.currentTarget.setAttribute('aria-label', english ? 'التحويل إلى العربية' : 'Switch to English');
  document.documentElement.lang = english ? 'en' : 'ar';
  document.querySelector('.profile-content').dir = english ? 'ltr' : 'rtl';
});
