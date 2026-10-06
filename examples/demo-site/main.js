// Kiln & Bean: navigation, theme toggle, today's hours, contact form.
// Contact submission is a backend dependency (see docs/api-contract.md). When CONTACT_ENDPOINT is
// null the labelled mock in mocks/contact.js is used and the UI says so.
import { mockSendMessage } from './mocks/contact.js';

const CONTACT_ENDPOINT = null; // e.g. '/api/contact' once the backend exists

// --- navigation (mobile)
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  const setOpen = (open) => { toggle.setAttribute('aria-expanded', String(open)); nav.dataset.open = String(open); };
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
}

// --- theme toggle: light, dark, persisted; "system" when the key is absent
const themeButton = document.querySelector('.theme-toggle');
const themeColor = document.getElementById('theme-color');
function applyTheme(dark) {
  const apply = () => document.documentElement.classList.toggle('dark', dark);
  // theme cross-fade (recipe 9): view transition where supported, instant otherwise or under reduced motion
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.classList.contains('dark') !== dark) document.startViewTransition(apply); else apply();
  if (themeButton) { themeButton.setAttribute('aria-pressed', String(dark)); themeButton.textContent = dark ? 'Light mode' : 'Dark mode'; }
  if (themeColor) themeColor.setAttribute('content', dark ? '#1c1613' : '#f4ecdf');
}
applyTheme(document.documentElement.classList.contains('dark'));
if (themeButton) {
  themeButton.addEventListener('click', () => {
    const dark = !document.documentElement.classList.contains('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) { /* storage unavailable: still toggle for this page */ }
    applyTheme(dark);
  });
}

// --- today's hours and the year
const day = new Date().getDay();
const weekend = day === 0 || day === 6;
const todayHours = document.querySelector('[data-today-hours]');
if (todayHours) todayHours.textContent = weekend ? '08:30–16:00' : '07:30–17:00';
const row = document.querySelector(weekend ? 'tr[data-days="6-0"]' : 'tr[data-days="1-5"]');
if (row) row.dataset.today = 'true';
const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

// --- contact form
const form = document.querySelector('.contact-form');
if (form) {
  const status = form.querySelector('.form__status');
  const submit = form.querySelector('button[type="submit"]');
  const banner = document.querySelector('[data-mock-banner]');
  if (!CONTACT_ENDPOINT && banner) banner.hidden = false;

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please tell us your name.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email address we can reply to, like name@example.com.'),
    message: (v) => (v.trim().length >= 10 ? '' : 'Give us a sentence or two so we can help.'),
  };
  const fieldOf = (name) => form.elements[name].closest('.field');
  function validate(name) {
    const input = form.elements[name];
    const error = rules[name](input.value);
    const field = fieldOf(name);
    field.querySelector('.field__error').textContent = error;
    if (error) { field.dataset.invalid = 'true'; input.setAttribute('aria-invalid', 'true'); }
    else { delete field.dataset.invalid; input.removeAttribute('aria-invalid'); }
    return !error;
  }
  for (const name of Object.keys(rules)) {
    form.elements[name].addEventListener('blur', () => { if (form.dataset.tried) validate(name); });
    form.elements[name].addEventListener('input', () => { if (fieldOf(name).dataset.invalid) validate(name); });
  }

  async function send(payload) {
    if (!CONTACT_ENDPOINT) return mockSendMessage(payload);
    const res = await fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.message || `Request failed (${res.status})`); }
    return res.json();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.dataset.tried = 'true';
    const results = Object.keys(rules).map(validate);
    if (results.includes(false)) {
      status.dataset.state = 'error';
      status.textContent = 'Please fix the highlighted fields.';
      form.querySelector('[aria-invalid]').focus();
      return;
    }
    submit.disabled = true;
    status.dataset.state = 'pending';
    status.textContent = 'Sending…';
    try {
      await send({ name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), message: form.elements.message.value.trim() });
      status.dataset.state = 'success';
      status.textContent = 'Thanks, we have your message and will reply within a working day.';
      form.reset();
      delete form.dataset.tried;
    } catch (err) {
      status.dataset.state = 'error';
      status.textContent = `We could not send that (${err.message}). Please try again or ring us.`;
    } finally {
      submit.disabled = false;
    }
  });
}

// --- reveal once on scroll: fallback for browsers without scroll-driven animations (recipe 3)
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
