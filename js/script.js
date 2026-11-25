/* ==========================================================================
   EraaSoft – Data Engineering Diploma landing page
   Vanilla JS. No dependencies.
   ========================================================================== */

/* --------------------------------------------------------------------------
   BACKEND CONFIGURATION  <-- the backend developer edits only this block
   --------------------------------------------------------------------------
   endpoint : Full URL of the registration API. Leave empty until the backend
              is ready. While empty, the form validates but does NOT pretend
              to submit; it shows a "not available yet" notice instead.
   method   : HTTP method expected by the API.
   format   : "json" -> sends application/json { fullName, email, phone, lang }
              "formdata" -> sends multipart/form-data with the same keys.
   headers  : Extra headers (e.g. CSRF token, API key header) if required.
   timeoutMs: Request timeout.
   -------------------------------------------------------------------------- */
const REGISTRATION_CONFIG = {
  endpoint: '',
  method: 'POST',
  format: 'json',
  headers: {},
  timeoutMs: 15000,
};

/* ==========================================================================
   LOCALIZATION (English / Arabic)
   - English text lives in index.html and is read from the DOM at startup.
   - Arabic text lives in js/i18n-ar.js (window.I18N_AR), same keys.
   - data-i18n="key"                 -> element innerHTML
   - data-i18n-attr="attr:key;attr2:key2" -> element attributes
   - The choice is saved in localStorage and can be forced with ?lang=ar / ?lang=en.
   ========================================================================== */
const LANG_STORAGE_KEY = 'eraasoft-lang';
const SUPPORTED_LANGS = ['en', 'ar'];
const RTL_LANGS = ['ar'];

/* English strings that are not in the HTML (messages built by JS) */
const EN_MESSAGES = {
  'msg.required.fullName': 'Please enter your full name.',
  'msg.required.email': 'Please enter your email address.',
  'msg.required.phone': 'Please enter your phone number.',
  'msg.fullNameShort': 'Please enter your full name (at least 3 characters).',
  'msg.emailInvalid': 'Please enter a valid email address, e.g. name@example.com.',
  'msg.phoneInvalid': 'Please enter a valid phone number (8 to 15 digits; +, spaces and dashes are allowed).',
  'msg.notConfigured': 'Online registration is not open yet. Please check back soon.',
  'msg.success': 'Thank you. Your registration has been received, and the EraaSoft team will contact you soon.',
  'msg.networkError': 'We could not reach the server. Please check your connection and try again.',
  'msg.timeout': 'The request took too long. Please try again.',
  'msg.serverError': 'Something went wrong on our side. Please try again in a moment.',
  'cta.submitting': 'Submitting…',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
};

const i18n = {
  lang: 'en',
  dict: { en: { ...EN_MESSAGES }, ar: window.I18N_AR || {} },
  listeners: [],
};

/** Translate a key into the current language (falls back to English, then to the key). */
function t(key) {
  return i18n.dict[i18n.lang][key] ?? i18n.dict.en[key] ?? key;
}

function getInitialLang() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED_LANGS.includes(fromUrl)) return fromUrl;
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch { /* storage can be blocked; fall back to English */ }
  return 'en';
}

function initI18n() {
  // Capture the English source text from the HTML once.
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!(key in i18n.dict.en)) i18n.dict.en[key] = el.tagName === 'TITLE' ? el.textContent : el.innerHTML.trim();
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    parseAttrMap(el).forEach(([attr, key]) => {
      if (!(key in i18n.dict.en)) i18n.dict.en[key] = el.getAttribute(attr) || '';
    });
  });

  const toggle = document.getElementById('lang-toggle');
  toggle?.addEventListener('click', () => setLanguage(i18n.lang === 'ar' ? 'en' : 'ar'));

  setLanguage(getInitialLang(), { persist: false });
  document.documentElement.classList.remove('i18n-pending');
}

function parseAttrMap(el) {
  return el.dataset.i18nAttr.split(';').map((pair) => pair.split(':').map((s) => s.trim())).filter((p) => p.length === 2);
}

function setLanguage(lang, { persist = true } = {}) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';
  i18n.lang = lang;

  const root = document.documentElement;
  root.lang = lang;
  root.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (el.tagName === 'TITLE') el.textContent = value;
    else el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    parseAttrMap(el).forEach(([attr, key]) => el.setAttribute(attr, t(key)));
  });

  // The switch shows the language you would switch TO.
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    const target = lang === 'ar' ? 'en' : 'ar';
    toggle.textContent = target === 'ar' ? 'العربية' : 'English';
    toggle.lang = target;
    toggle.setAttribute('aria-label', target === 'ar' ? 'التبديل إلى العربية' : 'Switch to English');
  }

  if (persist) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* ignore */ }
  }

  i18n.listeners.forEach((fn) => fn(lang));
}

/** Register a callback that runs after every language change. */
function onLanguageChange(fn) { i18n.listeners.push(fn); }

/* ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initLoadState();
  initHeader();
  initMobileMenu();
  initActiveNav();
  initReveal();
  initCounters();
  initOptionalImages();
  initMobileCta();
  initRegistrationForm();
  setYear();
});

/* ---------- Page load (hero entrance) ---------- */
function initLoadState() {
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')));
}

/* ---------- Header shadow on scroll ---------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'a11y.closeMenu' : 'a11y.openMenu'));
    menu.classList.toggle('is-open', open);
  };

  setOpen(false);
  onLanguageChange(() => setOpen(toggle.getAttribute('aria-expanded') === 'true'));
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

/* ---------- Highlight current section in desktop nav ---------- */
function initActiveNav() {
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.remove('is-active'));
      map.get(entry.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  map.forEach((_, id) => { const s = document.getElementById(id); if (s) observer.observe(s); });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Small stagger for siblings that enter together (cards in a grid).
  const groups = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const index = groups.get(parent) || 0;
    el.style.setProperty('--stagger', `${Math.min(index % 6, 5) * 70}ms`);
    groups.set(parent, index + 1);
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => observer.observe(el));
}

/* ---------- Count-up numbers in the overview ---------- */
function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // final values are already in the HTML

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });

  nums.forEach((n) => observer.observe(n));
}

/* ---------- Optional images (tool logos, project visuals, capstone diagram) ----------
   Elements carry an empty data-logo / data-img attribute by default, so nothing is
   requested and no broken image can appear. Fill in a path and the image replaces the
   built-in fallback once it has loaded successfully. */
function initOptionalImages() {
  document.querySelectorAll('[data-logo]').forEach((el) => {
    const src = el.dataset.logo.trim();
    if (!src) return;
    loadImage(src, el.nextElementSibling?.textContent.trim() || '', (img) => {
      el.textContent = '';
      el.appendChild(img);
      el.classList.add('has-logo');
    });
  });

  document.querySelectorAll('[data-img]').forEach((el) => {
    const src = el.dataset.img.trim();
    if (!src) return;
    loadImage(src, el.dataset.alt || '', (img) => {
      el.prepend(img);
      el.classList.add('has-img');
    });
  });
}

function loadImage(src, alt, onLoad) {
  const img = new Image();
  img.alt = alt;
  img.decoding = 'async';
  img.loading = 'lazy';
  img.onload = () => onLoad(img);
  img.onerror = () => console.warn(`[assets] Could not load image: ${src}`);
  img.src = src;
}

/* ---------- Mobile sticky CTA ---------- */
function initMobileCta() {
  const bar = document.getElementById('mobile-cta');
  const hero = document.querySelector('.hero');
  const register = document.getElementById('register');
  if (!bar || !hero || !register || !('IntersectionObserver' in window)) return;

  let heroVisible = true;
  let registerVisible = false;
  const update = () => bar.classList.toggle('is-visible', !heroVisible && !registerVisible);

  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { registerVisible = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(register);
}

/* ==========================================================================
   REGISTRATION FORM
   1) Validation  – pure functions, no DOM. Return message KEYS (translated at render time).
   2) UI helpers  – show / clear errors and status (re-rendered on language change).
   3) Submission  – submitRegistration(): the single place that talks to the API.
   ========================================================================== */

/* 1) Validation ----------------------------------------------------------- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^\+?[\d\s\-().]+$/;

/** Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to 0-9. */
function normalizeDigits(value) {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

const validators = {
  fullName(value) {
    const v = value.trim();
    if (!v) return 'msg.required.fullName';
    if (v.length < 3) return 'msg.fullNameShort';
    return '';
  },
  email(value) {
    const v = value.trim();
    if (!v) return 'msg.required.email';
    if (!EMAIL_PATTERN.test(v)) return 'msg.emailInvalid';
    return '';
  },
  phone(value) {
    const v = normalizeDigits(value.trim());
    if (!v) return 'msg.required.phone';
    const digits = v.replace(/\D/g, '');
    if (!PHONE_ALLOWED.test(v) || digits.length < 8 || digits.length > 15) return 'msg.phoneInvalid';
    return '';
  },
};

/** Returns { valid, errors } where errors maps field name -> message key. */
function validateRegistration(data) {
  const errors = {};
  Object.keys(validators).forEach((key) => {
    const messageKey = validators[key](data[key] ?? '');
    if (messageKey) errors[key] = messageKey;
  });
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Collects a clean payload from the form. */
function getRegistrationData(form) {
  const fd = new FormData(form);
  return {
    fullName: String(fd.get('fullName') || '').trim().replace(/\s+/g, ' '),
    email: String(fd.get('email') || '').trim().toLowerCase(),
    phone: normalizeDigits(String(fd.get('phone') || '').trim()),
    lang: i18n.lang, // page language at submission time
  };
}

/* 3) Submission ----------------------------------------------------------- */
/**
 * Sends the registration to the backend.
 * Resolves with { ok: true, message } only when the server responds with 2xx.
 * Rejects with an Error whose `code` is one of: NOT_CONFIGURED, TIMEOUT, NETWORK, SERVER.
 */
async function submitRegistration(data) {
  const { endpoint, method, format, headers, timeoutMs } = REGISTRATION_CONFIG;

  if (!endpoint) {
    console.warn('[registration] REGISTRATION_CONFIG.endpoint is empty. Set it in js/script.js to enable submissions.');
    throw Object.assign(new Error('Endpoint not configured'), { code: 'NOT_CONFIGURED' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let body;
  const requestHeaders = { Accept: 'application/json', 'Accept-Language': data.lang, ...headers };
  if (format === 'formdata') {
    body = new FormData();
    Object.entries(data).forEach(([k, v]) => body.append(k, v));
  } else {
    body = JSON.stringify(data);
    requestHeaders['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(endpoint, { method, headers: requestHeaders, body, signal: controller.signal });
  } catch (err) {
    const code = err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK';
    throw Object.assign(new Error(err.message), { code });
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try { payload = await response.json(); } catch { /* non-JSON body is fine */ }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.code = 'SERVER';
    error.status = response.status;
    error.serverMessage = payload?.message || '';
    error.fieldErrors = payload?.errors || null; // optional { fullName, email, phone } from the API
    throw error;
  }

  return { ok: true, message: payload?.message || '' };
}

/* 2) UI wiring ------------------------------------------------------------ */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  const button = document.getElementById('register-submit');
  const status = document.getElementById('form-status');
  let submitAttempted = false;
  let loading = false;
  // Current error per field: { key } for our messages or { raw } for server text.
  const fieldErrors = {};
  let statusState = null; // { type, key } or { type, raw }

  const renderFieldError = (name) => {
    const input = form.elements[name];
    const field = input?.closest('.field');
    const errorEl = document.getElementById(`${name}-error`);
    if (!field || !errorEl) return;
    const err = fieldErrors[name];
    field.classList.toggle('is-invalid', Boolean(err));
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) errorEl.textContent = err.raw ?? t(err.key);
  };

  const setFieldError = (name, err) => {
    if (err) fieldErrors[name] = err; else delete fieldErrors[name];
    renderFieldError(name);
  };

  const renderStatus = () => {
    if (!statusState) { status.hidden = true; status.textContent = ''; return; }
    status.className = `form-status is-${statusState.type}`;
    status.textContent = statusState.raw ?? t(statusState.key);
    status.hidden = false;
  };
  const showStatus = (state) => { statusState = state; renderStatus(); };
  const hideStatus = () => showStatus(null);

  const renderButton = () => {
    button.querySelector('.btn-label').textContent = t(loading ? 'cta.submitting' : 'cta.register');
  };
  const setLoading = (value) => {
    loading = value;
    button.classList.toggle('is-loading', value);
    button.disabled = value;
    button.setAttribute('aria-busy', String(value));
    renderButton();
  };

  // Re-render visible messages when the language changes.
  onLanguageChange(() => {
    Object.keys(validators).forEach(renderFieldError);
    renderStatus();
    renderButton();
  });

  // After the first submit attempt, re-check a field as the user corrects it.
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!submitAttempted || !validators[name]) return;
    const key = validators[name](e.target.value);
    setFieldError(name, key ? { key } : null);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitAttempted = true;
    hideStatus();

    const data = getRegistrationData(form);
    const { valid, errors } = validateRegistration(data);
    Object.keys(validators).forEach((name) => setFieldError(name, errors[name] ? { key: errors[name] } : null));

    if (!valid) {
      const firstInvalid = Object.keys(validators).find((n) => errors[n]);
      form.elements[firstInvalid]?.focus();
      return; // entered values are kept as they are
    }

    setLoading(true);
    try {
      const result = await submitRegistration(data);
      showStatus(result.message ? { type: 'success', raw: result.message } : { type: 'success', key: 'msg.success' });
      form.reset();
      submitAttempted = false;
    } catch (err) {
      if (err.code === 'NOT_CONFIGURED') {
        showStatus({ type: 'info', key: 'msg.notConfigured' });
      } else if (err.code === 'TIMEOUT') {
        showStatus({ type: 'error', key: 'msg.timeout' });
      } else if (err.code === 'NETWORK') {
        showStatus({ type: 'error', key: 'msg.networkError' });
      } else {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([name, msg]) => validators[name] && setFieldError(name, { raw: String(msg) }));
        }
        showStatus(err.serverMessage ? { type: 'error', raw: err.serverMessage } : { type: 'error', key: 'msg.serverError' });
      }
    } finally {
      setLoading(false);
    }
  });
}

/* ---------- Footer year ---------- */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}
