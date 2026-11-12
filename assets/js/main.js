(function () {
'use strict';
var doc = document;
var body = doc.body;
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var header = doc.querySelector('[data-header]');
var progress = doc.querySelector('[data-scroll-progress]');
var toTopBtn = doc.querySelector('[data-to-top]');
var toTopVisible = false;
var docHeight = 0;
var lastMeasure = 0;
function measureDoc() {
docHeight = doc.documentElement.scrollHeight;
lastMeasure = Date.now();
}
var measureQueued = false;
function scheduleMeasure() {
if (measureQueued) return;
measureQueued = true;
var run = function () {
measureQueued = false;
measureDoc();
};
if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1500 });
else window.setTimeout(run, 260);
}
window.addEventListener('resize', scheduleMeasure);
window.addEventListener('orientationchange', scheduleMeasure);
function applyScroll() {
var y = window.scrollY || window.pageYOffset;
if (header) header.classList.toggle('is-scrolled', y > 8);
if (progress) {
if (!docHeight && y > 0) measureDoc();
else if (docHeight && Date.now() - lastMeasure > 1000) measureDoc();
var h = docHeight - window.innerHeight;
var ratio = h > 0 ? Math.min(1, y / h) : 0;
progress.style.transform = 'scaleX(' + ratio + ')';
}
if (toTopBtn) {
var show = y > 720;
if (show !== toTopVisible) {
toTopVisible = show;
if (show) {
toTopBtn.hidden = false;
window.requestAnimationFrame(function () {
toTopBtn.classList.add('is-visible');
});
} else {
toTopBtn.classList.remove('is-visible');
window.setTimeout(function () {
if (!toTopVisible) toTopBtn.hidden = true;
}, 320);
}
}
}
}
var scrollQueued = false;
function onScroll() {
if (scrollQueued) return;
scrollQueued = true;
window.requestAnimationFrame(function () {
scrollQueued = false;
applyScroll();
});
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTopBtn) {
toTopBtn.addEventListener('click', function () {
window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
}
var navItems = Array.prototype.slice.call(doc.querySelectorAll('[data-nav-item]'));
var navBackdrop = doc.querySelector('[data-nav-backdrop]');
var closeTimer = null;
var canHover = window.matchMedia('(hover: hover)').matches;
function syncBackdrop() {
if (!navBackdrop) return;
navBackdrop.classList.toggle('is-on', navItems.some(function (item) {
return item.classList.contains('is-open');
}));
}
function fitMenus() {
if (window.innerWidth <= 1080) return;
navItems.forEach(function (item) {
if (!item.classList.contains('is-open')) return;
var menu = item.querySelector('[data-menu]');
var shell = menu && menu.querySelector('.mega__shell');
if (!shell) return;
var top = menu.getBoundingClientRect().top;
var available = Math.max(260, window.innerHeight - top - 14);
shell.style.maxHeight = available + 'px';
shell.classList.toggle('is-scrollable', shell.scrollHeight > shell.clientHeight + 2);
});
}
var fitTimer = null;
function scheduleFit() {
window.clearTimeout(fitTimer);
fitTimer = window.setTimeout(fitMenus, 80);
}
window.addEventListener('resize', scheduleFit);
window.addEventListener('scroll', function () {
if (window.innerWidth > 1080 && navBackdrop && navBackdrop.classList.contains('is-on')) scheduleFit();
}, { passive: true });
function setExpanded(item, on) {
var link = item.querySelector('.nav__link');
if (link) link.setAttribute('aria-expanded', on ? 'true' : 'false');
}
function closeAll(except) {
navItems.forEach(function (item) {
if (item === except) return;
item.classList.remove('is-open');
setExpanded(item, false);
var menu = item.querySelector('[data-menu]');
if (menu) menu.setAttribute('aria-hidden', 'true');
});
syncBackdrop();
}
navItems.forEach(function (item) {
var menu = item.querySelector('[data-menu]');
var link = item.querySelector('.nav__link');
if (!menu) return;
function open() {
window.clearTimeout(closeTimer);
closeAll(item);
item.classList.add('is-open');
setExpanded(item, true);
menu.setAttribute('aria-hidden', 'false');
syncBackdrop();
fitMenus();
}
function close() {
closeTimer = window.setTimeout(function () {
item.classList.remove('is-open');
setExpanded(item, false);
menu.setAttribute('aria-hidden', 'true');
syncBackdrop();
}, 120);
}
item.addEventListener('mouseenter', open);
item.addEventListener('mouseleave', close);
item.addEventListener('focusin', open);
item.addEventListener('focusout', function (e) {
if (!item.contains(e.relatedTarget)) close();
});
if (link) {
link.addEventListener('click', function (e) {
if (!canHover && menu.getAttribute('aria-hidden') === 'true') {
e.preventDefault();
open();
}
});
link.addEventListener('keydown', function (e) {
if (e.key === 'ArrowDown') {
e.preventDefault();
open();
var first = menu.querySelector('a, button');
if (first) first.focus();
}
});
}
item.addEventListener('keydown', function (e) {
if (e.key === 'Escape') {
item.classList.remove('is-open');
setExpanded(item, false);
menu.setAttribute('aria-hidden', 'true');
syncBackdrop();
if (link) link.focus();
}
});
});
doc.addEventListener('keydown', function (e) {
if (e.key === 'Escape') closeAll();
});
if (navBackdrop) navBackdrop.addEventListener('click', function () { closeAll(); });
doc.addEventListener('click', function (e) {
if (!e.target.closest('[data-nav-item]')) closeAll();
});
var mobileMenu = doc.querySelector('[data-mobile-menu]');
var menuOpenBtn = doc.querySelector('[data-menu-open]');
var menuCloseBtn = doc.querySelector('[data-menu-close]');
function openMobile() {
if (!mobileMenu) return;
mobileMenu.classList.add('is-open');
mobileMenu.setAttribute('aria-hidden', 'false');
body.classList.add('is-locked');
if (menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'true');
var first = mobileMenu.querySelector('a, button');
if (first) first.focus();
}
function closeMobile() {
if (!mobileMenu) return;
mobileMenu.classList.remove('is-open');
mobileMenu.setAttribute('aria-hidden', 'true');
body.classList.remove('is-locked');
if (menuOpenBtn) {
menuOpenBtn.setAttribute('aria-expanded', 'false');
menuOpenBtn.focus();
}
}
if (menuOpenBtn) menuOpenBtn.addEventListener('click', openMobile);
if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobile);
if (mobileMenu) {
mobileMenu.querySelectorAll('a').forEach(function (a) {
a.addEventListener('click', closeMobile);
});
var mobileGroups = Array.prototype.slice.call(mobileMenu.querySelectorAll('.mobile-nav__group'));
mobileGroups.forEach(function (group) {
group.addEventListener('toggle', function () {
if (!group.open) return;
mobileGroups.forEach(function (other) {
if (other !== group) other.open = false;
});
});
});
}
var overlay = doc.querySelector('[data-search-overlay]');
var searchOpenBtn = doc.querySelector('[data-search-open]');
var searchCloseBtn = doc.querySelector('[data-search-close]');
var searchInput = doc.querySelector('[data-search-input]');
var resultsBox = doc.querySelector('[data-search-results]');
var searchClearBtn = doc.querySelector('[data-search-clear]');
var searchStatusEl = doc.querySelector('[data-search-status]');
var searchFilterBar = doc.querySelector('[data-search-filters]');
var base = body.getAttribute('data-base') || '';
var SEARCH_RECENT_KEY = 'ghc:recent-searches';
var SEARCH_LIMIT = 18;
var SEARCH_FILTERS = [
{ key: 'all', label: 'Tutti' },
{ key: 'servizi', label: 'Servizi' },
{ key: 'strutture', label: 'Strutture' },
{ key: 'zone', label: 'Zone e città' },
{ key: 'gruppo', label: 'Gruppo' },
{ key: 'investor', label: 'Investor' },
{ key: 'sostenibilita', label: 'Sostenibilità' },
{ key: 'altro', label: 'Altro' }
];
var SEARCH_FILTER_LABEL = {};
SEARCH_FILTERS.forEach(function (f) {
SEARCH_FILTER_LABEL[f.key] = f.label;
});
var SEARCH_POPULAR = ['Cardiologia', 'Aurelia Hospital', 'Roma', 'Bilancio', 'Lavora con noi', 'Sostenibilità'];
var SEARCH_QUICK = [
{ path: 'orientamento/index.html', title: 'Orientamento guidato', text: 'Trova la struttura giusta per zona e bisogno', icon: 'map' },
{ path: 'servizi/index.html', title: 'Servizi e specialità', text: '75 specialità in 10 aree cliniche', icon: 'stethoscope' },
{ path: 'strutture/index.html', title: 'Strutture e contatti', text: '39 strutture in 8 regioni, con recapiti diretti', icon: 'building' },
{ path: 'contatti.html', title: 'Contatti e sedi', text: 'Centralino, richieste e informazioni utili', icon: 'mail' }
];
var SEARCH_SVG = {
arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
building: '<path d="M4 21V6l8-3v18M12 21h8V9l-8-3M7 9v.01M7 13v.01M7 17v.01M16 11v.01M16 15v.01M16 19v.01"/>',
mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
pin: '<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3.2 3.2 0 0 1 0 6M17 14.5a6 6 0 0 1 4 5.5"/>',
chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
leaf: '<path d="M20 4C10 4 4 9 4 16c0 2 .7 3.5 2 4 7 0 14-4 14-16Z"/><path d="M4 20c2-6 6-9 12-11"/>',
clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'
};
var SEARCH_CAT_ICON = {
servizi: 'stethoscope',
strutture: 'building',
zone: 'pin',
gruppo: 'users',
investor: 'chart',
sostenibilita: 'leaf',
altro: 'file'
};
var searchFilterButtons = searchFilterBar ? Array.prototype.slice.call(searchFilterBar.querySelectorAll('[data-search-filter]')) : [];
var searchIndex = null;
var searchIndexState = 'idle';
var searchIndexQueue = [];
var searchIndexFailed = false;
var searchActive = -1;
var searchFilter = 'all';
var searchMatches = [];
var searchLastFocus = null;
var searchTimer = 0;
var searchPending = false;
function normalise(s) {
return (s || '')
.toLowerCase()
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '');
}
function searchEsc(s) {
return String(s == null ? '' : s)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;');
}
function searchEscapeRe(s) {
return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function searchSvg(name, size) {
var path = SEARCH_SVG[name] || SEARCH_SVG.info;
return (
'<svg class="icon" width="' +
size +
'" height="' +
size +
'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
path +
'</svg>'
);
}
function searchCategory(section) {
switch (section) {
case 'Servizi':
return 'servizi';
case 'Strutture':
case 'Cliniche private':
return 'strutture';
case 'Zone e città':
return 'zone';
case 'Il Gruppo':
case 'Governance':
return 'gruppo';
case 'Investor Relations':
return 'investor';
case 'Sostenibilità':
return 'sostenibilita';
default:
return 'altro';
}
}
function searchEmptyCounts() {
return { all: 0, servizi: 0, strutture: 0, zone: 0, gruppo: 0, investor: 0, sostenibilita: 0, altro: 0 };
}
function searchPrepare() {
searchIndex.forEach(function (item) {
item._title = normalise(item.title);
item._desc = normalise(item.description || '');
item._section = normalise(item.section || '');
item._keys = normalise(item.keywords || '');
item._cat = searchCategory(item.section);
});
}
function searchTotalCounts() {
var counts = searchEmptyCounts();
if (!searchIndex) return counts;
counts.all = searchIndex.length;
searchIndex.forEach(function (item) {
counts[item._cat] = (counts[item._cat] || 0) + 1;
});
return counts;
}
function searchUpdateCounts(counts) {
searchFilterButtons.forEach(function (btn) {
var key = btn.getAttribute('data-search-filter');
var slot = btn.querySelector('[data-filter-count]');
var n = counts ? counts[key] || 0 : null;
if (slot) slot.textContent = n === null ? '' : String(n);
btn.setAttribute('data-empty', counts && n === 0 && key !== 'all' ? 'true' : 'false');
});
searchUpdateFilterHints();
}
function searchUpdateFilterHints() {
if (!searchFilterBar || !searchFilterBar.parentElement) return;
var max = searchFilterBar.scrollWidth - searchFilterBar.clientWidth;
var left = searchFilterBar.scrollLeft;
searchFilterBar.parentElement.classList.toggle('has-more-left', max > 4 && left > 4);
searchFilterBar.parentElement.classList.toggle('has-more-right', max > 4 && left < max - 4);
}
function searchStatus(text) {
if (searchStatusEl) searchStatusEl.textContent = text;
}
function ensureIndex(cb) {
if (searchIndex) {
if (cb) cb();
return;
}
if (cb) searchIndexQueue.push(cb);
if (searchIndexState === 'loading' || searchIndexState === 'ready') return;
searchIndexState = 'loading';
var script = doc.createElement('script');
var mainScript = doc.querySelector('script[src*="assets/js/main.js"]');
var assetQuery = mainScript && mainScript.src.indexOf('?') > -1 ? '?' + mainScript.src.split('?')[1] : '';
script.src = base + 'assets/js/search-index.js' + assetQuery;
script.async = true;
var done = function () {
var data = window.GHC_SEARCH;
searchIndex = Array.isArray(data) ? data : [];
searchIndexFailed = !searchIndex.length;
searchIndexState = 'ready';
if (!searchIndexFailed) searchPrepare();
var queue = searchIndexQueue.splice(0);
queue.forEach(function (fn) {
fn();
});
if (overlay && overlay.classList.contains('is-open') && (!searchInput || !searchInput.value.trim()) && searchFilter === 'all') {
if (searchIndexFailed) {
searchUpdateCounts(null);
searchStatus('Indice non disponibile');
} else {
var counts = searchTotalCounts();
searchUpdateCounts(counts);
searchStatus(counts.all + ' pagine indicizzate');
}
}
};
script.onload = done;
script.onerror = done;
doc.head.appendChild(script);
}
function searchReadRecent() {
try {
var raw = window.localStorage.getItem(SEARCH_RECENT_KEY);
var list = raw ? JSON.parse(raw) : [];
if (!Array.isArray(list)) return [];
return list
.filter(function (x) {
return typeof x === 'string' && x.length > 1;
})
.slice(0, 6);
} catch (err) {
return [];
}
}
function searchWriteRecent(list) {
try {
window.localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(list));
} catch (err) {
}
}
function searchRemember(q) {
var value = String(q || '').trim();
if (value.length < 2) return;
var list = searchReadRecent().filter(function (x) {
return normalise(x) !== normalise(value);
});
list.unshift(value);
searchWriteRecent(list.slice(0, 6));
}
function searchChipHTML(label, withIcon) {
return (
'<button type="button" data-search-chip="' +
searchEsc(label) +
'">' +
(withIcon ? searchSvg('clock', 13) : '') +
searchEsc(label) +
'</button>'
);
}
function searchRecentsHTML() {
var list = searchReadRecent();
if (!list.length) return '';
return (
'<div class="search-hints search-recent" data-search-recent>' +
'<div class="search-hints__head"><p class="search-hints__label">Ricerche recenti</p>' +
'<button class="search-recent__clear" type="button" data-search-recent-clear>Cancella</button></div>' +
'<div class="search-hints__chips">' +
list
.map(function (q) {
return searchChipHTML(q, true);
})
.join('') +
'</div></div>'
);
}
function searchIdleHTML() {
var quick = SEARCH_QUICK.map(function (q) {
return (
'<a class="search-quick" href="' +
searchEsc(base + q.path) +
'">' +
'<span class="search-quick__icon" aria-hidden="true">' +
searchSvg(q.icon, 18) +
'</span>' +
'<span class="search-quick__text"><strong>' +
q.title +
'</strong><span>' +
q.text +
'</span></span>' +
'<span class="search-quick__arrow" aria-hidden="true">' +
searchSvg('arrow', 15) +
'</span></a>'
);
}).join('');
return (
'<div class="search-hub" data-search-hub>' +
searchRecentsHTML() +
'<p class="search-hints__label">Scorciatoie</p>' +
'<div class="search-hub__grid">' +
quick +
'</div>' +
'<div class="search-hints"><p class="search-hints__label">Ricerche frequenti</p><div class="search-hints__chips">' +
SEARCH_POPULAR.map(function (q) {
return searchChipHTML(q, false);
}).join('') +
'</div></div></div>'
);
}
function searchSkeletonHTML() {
var row =
'<div class="search-skeleton__row"><span class="search-skeleton__icon"></span>' +
'<span class="search-skeleton__lines"><span class="search-skeleton__line search-skeleton__line--mid"></span>' +
'<span class="search-skeleton__line search-skeleton__line--short"></span></span></div>';
return (
'<div class="search-skeleton" aria-hidden="true">' +
row +
row +
row +
'</div><p class="sr-only">Caricamento dell’indice di ricerca…</p>'
);
}
function searchHighlight(text, terms) {
var value = String(text == null ? '' : text);
if (!terms || !terms.length) return searchEsc(value);
var parts = terms
.filter(function (t) {
return t && t.length > 1;
})
.map(searchEscapeRe);
if (!parts.length) return searchEsc(value);
parts.sort(function (a, b) {
return b.length - a.length;
});
var re;
try {
re = new RegExp('(' + parts.join('|') + ')', 'gi');
} catch (err) {
return searchEsc(value);
}
return value
.split(re)
.map(function (part, i) {
return i % 2 === 1 ? '<mark>' + searchEsc(part) + '</mark>' : searchEsc(part);
})
.join('');
}
function searchMatch(hay, word) {
if (!hay) return 0;
var tokens = hay.split(/[^a-z0-9]+/);
var best = 0;
var stem = word.length > 4 ? word.replace(/[aeio]$/, '') : '';
for (var i = 0; i < tokens.length; i++) {
var token = tokens[i];
if (!token) continue;
if (token === word) return 3;
if (word.length >= 5 && token.indexOf(word) === 0) best = Math.max(best, 2);
if (stem.length > 3 && (token === stem || token.indexOf(stem) === 0)) best = Math.max(best, 1);
}
return best;
}
function searchScore(item, words, qn) {
var score = 0;
for (var i = 0; i < words.length; i++) {
var w = words[i];
var titleHit = searchMatch(item._title, w);
var keyHit = searchMatch(item._keys, w);
var sectionHit = searchMatch(item._section, w);
var descHit = searchMatch(item._desc, w);
if (!titleHit && !keyHit && !sectionHit && !descHit) return 0;
if (titleHit === 3) score += 32;
else if (titleHit === 2) score += 24;
else if (titleHit === 1) score += 18;
else if (keyHit) score += 9;
else if (sectionHit) score += 7;
else if (descHit) score += 4;
if (titleHit && (keyHit || descHit)) score += 2;
}
if (item._title === qn) score += 110;
else if (item._title.indexOf(qn) === 0) score += 48;
else if (item._title.indexOf(qn) !== -1) score += 20;
if (item._keys.indexOf(qn) !== -1) score += 12;
if (item._desc.indexOf(qn) !== -1) score += 6;
score += Math.max(0, 14 - item._title.length / 8);
if (item.path && item.path.split('/').length <= 2) score += 10;
return score;
}
function searchCountsFor(list) {
var counts = searchEmptyCounts();
counts.all = list.length;
list.forEach(function (item) {
counts[item._cat] = (counts[item._cat] || 0) + 1;
});
return counts;
}
function searchCompute(q) {
var qn = normalise(q).trim();
var words = qn.split(/\s+/).filter(Boolean);
var scored = [];
searchIndex.forEach(function (item) {
var score = searchScore(item, words, qn);
if (score > 0) scored.push({ item: item, score: score });
});
scored.sort(function (a, b) {
if (b.score !== a.score) return b.score - a.score;
return a.item.title.length - b.item.title.length;
});
var list = scored.map(function (entry) {
return entry.item;
});
return { list: list, counts: searchCountsFor(list) };
}
function searchNoResultsHTML(q, info) {
if (info && info.filtered) {
return (
'<div class="search-state">' +
'<span class="search-state__icon" aria-hidden="true">' +
searchSvg('filter', 24) +
'</span>' +
'<p class="search-state__title">Nessun risultato in ' +
searchEsc(SEARCH_FILTER_LABEL[info.filter] || 'questa sezione') +
'</p>' +
'<p class="search-state__text">La ricerca per «' +
searchEsc(q) +
'» ha <strong>' +
info.total +
'</strong> ' +
(info.total === 1 ? 'risultato' : 'risultati') +
' in altre sezioni.</p>' +
'<div class="search-state__actions"><button class="search-state__reset" type="button" data-search-reset-filter>Mostra tutti i risultati</button></div></div>'
);
}
return (
'<div class="search-state">' +
'<span class="search-state__icon" aria-hidden="true">' +
searchSvg('search', 24) +
'</span>' +
'<p class="search-state__title">Nessun risultato per «' +
searchEsc(q) +
'»</p>' +
'<p class="search-state__text">Controlla l’ortografia oppure prova con una specialità, una città o il nome di una struttura.</p>' +
'<div class="search-state__chips">' +
SEARCH_POPULAR.slice(0, 4)
.map(function (label) {
return searchChipHTML(label, false);
})
.join('') +
'</div>' +
'<div class="search-state__actions"><a class="search-state__link" href="' +
searchEsc(base + 'orientamento/index.html') +
'">Apri l’orientamento guidato ' +
searchSvg('arrow', 15) +
'</a></div></div>'
);
}
function searchResultHTML(item, i, terms) {
var icon = SEARCH_CAT_ICON[item._cat] || 'file';
return (
'<a class="search-result" id="search-opt-' +
i +
'" href="' +
searchEsc(base + item.path) +
'" data-search-result role="option" aria-selected="false" tabindex="-1">' +
'<span class="search-result__icon" aria-hidden="true">' +
searchSvg(icon, 18) +
'</span>' +
'<span class="search-result__body"><span class="search-result__top">' +
'<span class="search-result__title">' +
searchHighlight(item.title, terms) +
'</span>' +
(item.section ? '<span class="search-result__section">' + searchEsc(item.section) + '</span>' : '') +
'</span>' +
(item.description ? '<span class="search-result__desc">' + searchHighlight(item.description, terms) + '</span>' : '') +
'</span>' +
'<span class="search-result__go" aria-hidden="true">' +
searchSvg('arrow', 16) +
'</span></a>'
);
}
function searchSetActive(index, scroll) {
searchActive = index;
var rows = resultsBox ? resultsBox.querySelectorAll('[data-search-result]') : [];
for (var i = 0; i < rows.length; i++) {
var on = i === index;
rows[i].classList.toggle('is-active', on);
rows[i].setAttribute('aria-selected', on ? 'true' : 'false');
if (on && scroll && rows[i].scrollIntoView) rows[i].scrollIntoView({ block: 'nearest' });
}
if (!searchInput) return;
if (index >= 0 && rows[index]) searchInput.setAttribute('aria-activedescendant', rows[index].id);
else searchInput.removeAttribute('aria-activedescendant');
}
function searchRender(query) {
if (!resultsBox || !searchInput) return;
searchPending = false;
var q = String(query || '').trim();
var filterAtRender = searchFilter;
if (searchClearBtn) searchClearBtn.hidden = !q;
if (!q && searchFilter === 'all') {
searchMatches = [];
searchSetActive(-1, false);
resultsBox.innerHTML = searchIdleHTML();
resultsBox.removeAttribute('aria-busy');
searchInput.setAttribute('aria-expanded', 'false');
if (searchIndex && !searchIndexFailed) {
var all = searchTotalCounts();
searchUpdateCounts(all);
searchStatus(all.all + ' pagine indicizzate');
} else if (searchIndexFailed) {
searchUpdateCounts(null);
searchStatus('Indice non disponibile');
} else {
searchUpdateCounts(null);
searchStatus('Ricerca in tutto il sito');
ensureIndex();
}
return;
}
if (!searchIndex) {
searchMatches = [];
searchSetActive(-1, false);
resultsBox.innerHTML = searchSkeletonHTML();
resultsBox.setAttribute('aria-busy', 'true');
searchInput.setAttribute('aria-expanded', 'false');
searchStatus('Caricamento dell’indice…');
ensureIndex(function () {
if (
overlay &&
overlay.classList.contains('is-open') &&
searchInput.value.trim() === q &&
searchFilter === filterAtRender
) {
searchRender(searchInput.value);
}
});
return;
}
if (searchIndexFailed) {
searchMatches = [];
searchSetActive(-1, false);
resultsBox.removeAttribute('aria-busy');
resultsBox.innerHTML =
'<div class="search-state">' +
'<span class="search-state__icon" aria-hidden="true">' +
searchSvg('info', 24) +
'</span>' +
'<p class="search-state__title">Ricerca non disponibile</p>' +
'<p class="search-state__text">In questo momento non riusciamo a caricare l’indice. Puoi consultare la mappa completa del sito.</p>' +
'<div class="search-state__actions"><a class="search-state__link" href="' +
searchEsc(base + 'sitemap.html') +
'">Apri la mappa del sito ' +
searchSvg('arrow', 15) +
'</a></div></div>';
searchInput.setAttribute('aria-expanded', 'false');
searchStatus('Indice non disponibile');
searchUpdateCounts(null);
return;
}
var computed;
var list;
var terms = String(q)
.split(/\s+/)
.filter(function (w) {
return w.length > 1;
});
if (!q) {
list = searchIndex
.filter(function (item) {
return item._cat === searchFilter;
})
.slice()
.sort(function (a, b) {
return a.title.localeCompare(b.title, 'it');
});
computed = { list: list, counts: searchTotalCounts() };
} else {
computed = searchCompute(q);
list = computed.list;
if (searchFilter !== 'all') {
list = list.filter(function (item) {
return item._cat === searchFilter;
});
}
}
if (!list.length) {
searchMatches = [];
searchSetActive(-1, false);
resultsBox.removeAttribute('aria-busy');
searchInput.setAttribute('aria-expanded', 'false');
var hasOther = !!q && computed.list.length > 0;
resultsBox.innerHTML = searchNoResultsHTML(q, hasOther ? { filtered: true, filter: searchFilter, total: computed.list.length } : null);
searchUpdateCounts(q ? computed.counts : searchTotalCounts());
searchStatus(
q
? '0 risultati' +
(searchFilter === 'all' ? '' : ' in ' + (SEARCH_FILTER_LABEL[searchFilter] || 'questa sezione')) +
' per «' +
q +
'»'
: 'Nessuna pagina in ' + (SEARCH_FILTER_LABEL[searchFilter] || 'questa sezione')
);
return;
}
var total = list.length;
var visible = list.slice(0, SEARCH_LIMIT);
searchMatches = visible;
resultsBox.removeAttribute('aria-busy');
resultsBox.innerHTML =
'<div class="search-result-list" role="listbox" aria-label="Risultati della ricerca">' +
visible
.map(function (item, i) {
return searchResultHTML(item, i, terms);
})
.join('') +
'</div>' +
(total > visible.length
? '<p class="search-more"><span>Mostrati <strong>' +
visible.length +
'</strong> di <strong>' +
total +
'</strong> risultati.</span><span>Affina la ricerca per vedere gli altri.</span></p>'
: '');
searchSetActive(visible.length ? 0 : -1, false);
searchInput.setAttribute('aria-expanded', 'true');
searchUpdateCounts(q ? computed.counts : searchTotalCounts());
if (q) {
searchStatus(
total +
(total === 1 ? ' risultato' : ' risultati') +
(searchFilter === 'all' ? ' per «' + q + '»' : ' in ' + (SEARCH_FILTER_LABEL[searchFilter] || 'questa sezione'))
);
} else {
searchStatus(total + (total === 1 ? ' pagina' : ' pagine') + ' in ' + (SEARCH_FILTER_LABEL[searchFilter] || 'questa sezione'));
}
}
function searchSetFilter(key) {
searchFilter = key;
searchSyncFilters();
searchRender(searchInput ? searchInput.value : '');
if (searchInput) searchInput.focus();
}
function searchSyncFilters() {
searchFilterButtons.forEach(function (btn) {
btn.setAttribute('aria-pressed', btn.getAttribute('data-search-filter') === searchFilter ? 'true' : 'false');
});
}
function searchSetQuery(value, resetFilter) {
if (!searchInput) return;
if (resetFilter && searchFilter !== 'all') {
searchFilter = 'all';
searchSyncFilters();
}
searchInput.value = value;
if (searchClearBtn) searchClearBtn.hidden = !value;
searchPending = false;
window.clearTimeout(searchTimer);
searchRender(value);
searchInput.focus();
}
function searchReset() {
searchFilter = 'all';
searchSyncFilters();
searchSetQuery('');
}
function searchNavigate(index) {
var rows = resultsBox ? resultsBox.querySelectorAll('[data-search-result]') : [];
var row = rows[index];
if (!row) return;
searchRemember(searchInput ? searchInput.value : '');
window.location.href = row.getAttribute('href');
}
function openSearch() {
if (!overlay) return;
if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMobile();
searchLastFocus = doc.activeElement;
overlay.classList.add('is-open');
overlay.setAttribute('aria-hidden', 'false');
body.classList.add('is-locked');
ensureIndex();
searchRender(searchInput ? searchInput.value : '');
window.setTimeout(function () {
searchUpdateFilterHints();
if (!searchInput) return;
searchInput.focus({ preventScroll: true });
if (doc.activeElement !== searchInput) {
window.setTimeout(function () {
searchInput.focus({ preventScroll: true });
}, 300);
}
if (searchInput.value) searchInput.select();
}, 60);
}
function closeSearch(restoreFocus) {
if (!overlay) return;
overlay.classList.remove('is-open');
overlay.setAttribute('aria-hidden', 'true');
body.classList.remove('is-locked');
window.clearTimeout(searchTimer);
searchPending = false;
searchSetActive(-1, false);
if (restoreFocus === false) return;
var target = searchLastFocus && searchLastFocus !== body && searchLastFocus.focus && doc.contains(searchLastFocus) ? searchLastFocus : searchOpenBtn;
if (target) target.focus();
}
if (searchInput) {
searchInput.addEventListener('input', function () {
if (searchClearBtn) searchClearBtn.hidden = !searchInput.value;
searchPending = true;
window.clearTimeout(searchTimer);
searchTimer = window.setTimeout(function () {
searchPending = false;
searchRender(searchInput.value);
}, 80);
});
searchInput.addEventListener('keydown', function (e) {
if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
if (searchPending) {
searchPending = false;
window.clearTimeout(searchTimer);
searchRender(searchInput.value);
}
var navRows = resultsBox ? resultsBox.querySelectorAll('[data-search-result]') : [];
if (!navRows.length) return;
e.preventDefault();
if (e.key === 'ArrowDown') {
searchSetActive(searchActive < navRows.length - 1 ? searchActive + 1 : 0, true);
} else {
searchSetActive(searchActive > 0 ? searchActive - 1 : navRows.length - 1, true);
}
return;
}
if (e.key === 'Enter') {
if (searchPending) {
searchPending = false;
window.clearTimeout(searchTimer);
searchRender(searchInput.value);
}
var rows = resultsBox ? resultsBox.querySelectorAll('[data-search-result]') : [];
if (!rows.length) return;
e.preventDefault();
searchNavigate(searchActive >= 0 ? searchActive : 0);
}
});
}
if (searchClearBtn) {
searchClearBtn.addEventListener('click', function () {
searchReset();
});
}
searchFilterButtons.forEach(function (btn, i) {
btn.addEventListener('click', function () {
searchSetFilter(btn.getAttribute('data-search-filter'));
});
btn.addEventListener('keydown', function (e) {
if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
e.preventDefault();
var next = e.key === 'ArrowRight' ? (i + 1) % searchFilterButtons.length : (i - 1 + searchFilterButtons.length) % searchFilterButtons.length;
if (searchFilterButtons[next]) searchFilterButtons[next].focus();
});
});
if (searchFilterBar) {
searchFilterBar.addEventListener('scroll', searchUpdateFilterHints, { passive: true });
}
window.addEventListener('resize', function () {
if (overlay && overlay.classList.contains('is-open')) searchUpdateFilterHints();
}, { passive: true });
if (resultsBox) {
resultsBox.addEventListener('click', function (e) {
var target = e.target;
var result = target.closest ? target.closest('[data-search-result]') : null;
if (result) {
searchRemember(searchInput ? searchInput.value : '');
return;
}
var chip = target.closest ? target.closest('[data-search-chip]') : null;
if (chip) {
e.preventDefault();
searchSetQuery(chip.getAttribute('data-search-chip') || '', true);
return;
}
var clearRecent = target.closest ? target.closest('[data-search-recent-clear]') : null;
if (clearRecent) {
e.preventDefault();
searchWriteRecent([]);
searchRender(searchInput ? searchInput.value : '');
return;
}
var resetFilter = target.closest ? target.closest('[data-search-reset-filter]') : null;
if (resetFilter) {
e.preventDefault();
searchSetFilter('all');
}
});
resultsBox.addEventListener('mousemove', function (e) {
var row = e.target.closest ? e.target.closest('[data-search-result]') : null;
if (!row || !resultsBox.contains(row)) return;
var rows = resultsBox.querySelectorAll('[data-search-result]');
for (var i = 0; i < rows.length; i++) {
if (rows[i] === row) {
if (i !== searchActive) searchSetActive(i, false);
return;
}
}
});
}
var searchOpenBtns = doc.querySelectorAll('[data-search-open]');
Array.prototype.forEach.call(searchOpenBtns, function (btn) {
btn.addEventListener('click', openSearch);
btn.addEventListener('pointerenter', function () {
ensureIndex();
}, { passive: true });
btn.addEventListener('focus', function () {
ensureIndex();
});
});
if (body.classList.contains('search-page')) {
var initialQuery = '';
try {
initialQuery = new URLSearchParams(window.location.search).get('q') || '';
} catch (err) {
initialQuery = '';
}
window.setTimeout(function () {
openSearch();
if (initialQuery) searchSetQuery(initialQuery, true);
}, 140);
}
if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
if (overlay) {
overlay.addEventListener('click', function (e) {
if (e.target === overlay) closeSearch();
});
}
doc.addEventListener('keydown', function (e) {
if (e.key === 'Escape') {
if (overlay && overlay.classList.contains('is-open')) closeSearch();
else if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMobile();
return;
}
if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
e.preventDefault();
if (overlay && overlay.classList.contains('is-open')) closeSearch();
else openSearch();
return;
}
if (e.key === 'Tab') {
if (overlay && overlay.classList.contains('is-open')) trapFocus(overlay, e);
else if (mobileMenu && mobileMenu.classList.contains('is-open')) trapFocus(mobileMenu, e);
}
});
function trapFocus(container, e) {
var focusable = Array.prototype.slice.call(
container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
).filter(function (el) {
return el.offsetParent !== null;
});
if (!focusable.length) return;
var first = focusable[0];
var last = focusable[focusable.length - 1];
if (e.shiftKey && doc.activeElement === first) {
e.preventDefault();
last.focus();
} else if (!e.shiftKey && doc.activeElement === last) {
e.preventDefault();
first.focus();
}
}
var filterRoot = doc.querySelector('[data-fac-filter]');
if (filterRoot) {
var chips = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-type]'));
var regionSelect = filterRoot.querySelector('[data-filter-region]');
var searchFilter = filterRoot.querySelector('[data-filter-search]');
var cards = Array.prototype.slice.call(doc.querySelectorAll('[data-facility-card]'));
var countEl = doc.querySelector('[data-fac-count]');
var emptyEl = doc.querySelector('[data-fac-empty]');
var resetEls = Array.prototype.slice.call(doc.querySelectorAll('[data-filter-reset]'));
var badgeEl = doc.querySelector('[data-filter-badge]');
var activeEl = doc.querySelector('[data-filter-active]');
var panelEl = doc.querySelector('[data-filter-panel]');
var toggleEl = doc.querySelector('[data-filter-toggle]');
var validTypes = chips.map(function (c) {
return c.getAttribute('data-filter-type');
});
var validRegions = regionSelect
? Array.prototype.slice.call(regionSelect.options).map(function (o) {
return o.value;
})
: ['all'];
var state = { type: 'all', region: 'all', q: '' };
var params = new URLSearchParams(window.location.search);
if (params.get('tipo') && validTypes.indexOf(params.get('tipo')) !== -1) state.type = params.get('tipo');
if (params.get('regione') && validRegions.indexOf(params.get('regione')) !== -1) state.region = params.get('regione');
if (params.get('q')) state.q = normalise(params.get('q'));
if (searchFilter && params.get('q')) searchFilter.value = params.get('q');
function regionLabel() {
if (!regionSelect || state.region === 'all') return '';
var opt = regionSelect.options[regionSelect.selectedIndex];
return opt ? opt.textContent : state.region;
}
function typeLabel() {
var chip = chips.filter(function (c) {
return c.getAttribute('data-filter-type') === state.type;
})[0];
return chip ? chip.textContent.trim() : state.type;
}
function renderActive() {
if (!activeEl) return;
var items = [];
if (state.type !== 'all') items.push({ key: 'type', label: typeLabel() });
if (state.region !== 'all') items.push({ key: 'region', label: regionLabel() });
if (!items.length) {
activeEl.hidden = true;
activeEl.innerHTML = '';
return;
}
activeEl.hidden = false;
activeEl.innerHTML =
'<span class="filter-active__label">Filtri attivi</span>' +
items
.map(function (it) {
return (
'<button class="filter-active__chip" type="button" data-clear="' +
it.key +
'">' +
it.label +
'<svg class="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>' +
'</button>'
);
})
.join('') +
'<button class="filter-active__clear" type="button" data-clear="all">Azzera</button>';
}
function apply() {
var visible = 0;
cards.forEach(function (card) {
var types = (card.getAttribute('data-type') || '').split(' ');
var region = card.getAttribute('data-region');
var text = normalise(card.textContent);
var ok =
(state.type === 'all' || types.indexOf(state.type) !== -1) &&
(state.region === 'all' || region === state.region) &&
(!state.q || text.indexOf(state.q) !== -1);
card.hidden = !ok;
if (ok) visible++;
});
if (countEl) {
var countText = visible === cards.length ? String(cards.length) : visible + ' di ' + cards.length;
countEl.textContent = countText;
var countWrap = countEl.closest('.filter-count');
if (countWrap) countWrap.setAttribute('aria-label', countText + ' strutture');
}
chips.forEach(function (c) {
var active = c.getAttribute('data-filter-type') === state.type;
c.classList.toggle('is-active', active);
c.setAttribute('aria-pressed', active ? 'true' : 'false');
});
if (regionSelect) regionSelect.value = state.region;
if (emptyEl) emptyEl.hidden = visible !== 0;
var activeCount = (state.type !== 'all' ? 1 : 0) + (state.region !== 'all' ? 1 : 0);
if (badgeEl) {
badgeEl.hidden = activeCount === 0;
badgeEl.textContent = activeCount;
}
resetEls.forEach(function (btn) {
if (btn.closest('.filter-bar__top')) btn.hidden = activeCount === 0;
});
renderActive();
var qs = [];
if (state.type !== 'all') qs.push('tipo=' + encodeURIComponent(state.type));
if (state.region !== 'all') qs.push('regione=' + encodeURIComponent(state.region));
if (state.q) qs.push('q=' + encodeURIComponent(searchFilter ? searchFilter.value : state.q));
var url = window.location.pathname + (qs.length ? '?' + qs.join('&') : '');
try {
window.history.replaceState(null, '', url);
} catch (err) {
}
}
function closePanel() {
if (!panelEl || !toggleEl) return;
panelEl.classList.remove('is-open');
toggleEl.setAttribute('aria-expanded', 'false');
}
chips.forEach(function (chip) {
chip.addEventListener('click', function () {
state.type = chip.getAttribute('data-filter-type');
apply();
if (window.matchMedia('(max-width: 720px)').matches) closePanel();
});
});
if (regionSelect) {
regionSelect.addEventListener('change', function () {
state.region = regionSelect.value;
apply();
if (window.matchMedia('(max-width: 720px)').matches) closePanel();
});
}
if (searchFilter) {
searchFilter.addEventListener('input', function () {
state.q = normalise(searchFilter.value);
apply();
});
}
if (toggleEl && panelEl) {
toggleEl.addEventListener('click', function () {
var open = panelEl.classList.toggle('is-open');
toggleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
});
}
if (activeEl) {
activeEl.addEventListener('click', function (e) {
var btn = e.target.closest('[data-clear]');
if (!btn) return;
var key = btn.getAttribute('data-clear');
if (key === 'all' || key === 'type') state.type = 'all';
if (key === 'all' || key === 'region') state.region = 'all';
if (key === 'all') {
state.q = '';
if (searchFilter) searchFilter.value = '';
}
apply();
});
}
resetEls.forEach(function (btn) {
btn.addEventListener('click', function () {
state.type = 'all';
state.region = 'all';
state.q = '';
if (searchFilter) searchFilter.value = '';
apply();
closePanel();
});
});
apply();
}
var archiveRoot = doc.querySelector('[data-archive]');
if (archiveRoot) {
var aSearch = archiveRoot.querySelector('[data-archive-search]');
var aArea = archiveRoot.querySelector('[data-archive-area]');
var aYear = archiveRoot.querySelector('[data-archive-year-select]');
var aRows = Array.prototype.slice.call(archiveRoot.querySelectorAll('[data-archive-row]'));
var aYearBlocks = Array.prototype.slice.call(archiveRoot.querySelectorAll('[data-archive-year]'));
var aCount = archiveRoot.querySelector('[data-archive-count]');
var aEmpty = archiveRoot.querySelector('[data-archive-empty]');
var aResets = Array.prototype.slice.call(doc.querySelectorAll('[data-archive-reset]'));
var aTotal = aRows.length;
var aState = { area: 'all', year: 'all', q: '' };
var aParams = new URLSearchParams(window.location.search);
if (aArea && aParams.get('area')) {
var wantedArea = aParams.get('area');
Array.prototype.forEach.call(aArea.options, function (opt) {
if (opt.value === wantedArea) aState.area = wantedArea;
});
}
if (aYear && aParams.get('anno')) {
var wantedYear = aParams.get('anno');
Array.prototype.forEach.call(aYear.options, function (opt) {
if (opt.value === wantedYear) aState.year = wantedYear;
});
}
if (aParams.get('q')) aState.q = normalise(aParams.get('q'));
if (aArea) aArea.value = aState.area;
if (aYear) aYear.value = aState.year;
if (aSearch && aParams.get('q')) aSearch.value = aParams.get('q');
function applyArchive() {
if (aArea) aState.area = aArea.value;
if (aYear) aState.year = aYear.value;
if (aSearch) aState.q = normalise(aSearch.value);
var visible = 0;
aRows.forEach(function (row) {
var area = row.getAttribute('data-area');
var year = row.getAttribute('data-year');
var text = normalise(row.textContent);
var ok =
(aState.area === 'all' || area === aState.area) &&
(aState.year === 'all' || year === aState.year) &&
(!aState.q || text.indexOf(aState.q) !== -1);
row.hidden = !ok;
if (ok) visible += 1;
});
aYearBlocks.forEach(function (block) {
var shown = block.querySelectorAll('[data-archive-row]:not([hidden])').length;
block.hidden = shown === 0;
var blockCount = block.querySelector('[data-archive-year-count]');
if (blockCount) {
var baseCount = block.querySelectorAll('[data-archive-row]').length;
blockCount.textContent =
shown === baseCount
? baseCount + (baseCount === 1 ? ' documento' : ' documenti')
: shown + ' di ' + baseCount;
}
});
if (aCount) {
aCount.textContent =
visible === aTotal ? aTotal + ' documenti' : visible + ' di ' + aTotal + ' documenti';
}
if (aEmpty) aEmpty.hidden = visible !== 0;
var active = aState.area !== 'all' || aState.year !== 'all' || aState.q !== '';
aResets.forEach(function (btn) {
btn.hidden = !active;
});
var qs = [];
if (aState.area !== 'all') qs.push('area=' + encodeURIComponent(aState.area));
if (aState.year !== 'all') qs.push('anno=' + encodeURIComponent(aState.year));
if (aState.q) qs.push('q=' + encodeURIComponent(aSearch ? aSearch.value : aState.q));
try {
window.history.replaceState(
null,
'',
window.location.pathname + (qs.length ? '?' + qs.join('&') : '')
);
} catch (err) {
}
}
if (aSearch) {
aSearch.addEventListener('input', applyArchive);
}
if (aArea) aArea.addEventListener('change', applyArchive);
if (aYear) aYear.addEventListener('change', applyArchive);
aResets.forEach(function (btn) {
btn.addEventListener('click', function () {
aState = { area: 'all', year: 'all', q: '' };
if (aArea) aArea.value = 'all';
if (aYear) aYear.value = 'all';
if (aSearch) {
aSearch.value = '';
aSearch.focus();
}
applyArchive();
});
});
doc.querySelectorAll('[data-archive-preset]').forEach(function (link) {
link.addEventListener('click', function (event) {
if (!aArea) return;
event.preventDefault();
aArea.value = link.getAttribute('data-archive-preset');
applyArchive();
var target = doc.getElementById('documenti');
if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
});
});
applyArchive();
}
doc.querySelectorAll('[data-finder]').forEach(function (form) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var typeField = form.querySelector('[name="tipo"]');
var regionField = form.querySelector('[name="regione"]');
var params = [];
if (typeField && typeField.value && typeField.value !== 'all') params.push('tipo=' + encodeURIComponent(typeField.value));
if (regionField && regionField.value && regionField.value !== 'all') params.push('regione=' + encodeURIComponent(regionField.value));
window.location.href = base + 'strutture/index.html' + (params.length ? '?' + params.join('&') : '');
});
});
var orientForm = doc.querySelector('[data-orient-form]');
if (orientForm) {
var oRegion = orientForm.querySelector('[data-orient-region]');
var oCity = orientForm.querySelector('[data-orient-city]');
var oArea = orientForm.querySelector('[data-orient-area]');
var oService = orientForm.querySelector('[data-orient-service]');
var oType = orientForm.querySelector('[data-orient-type]');
var oRows = Array.prototype.slice.call(doc.querySelectorAll('[data-orient-row]'));
var oGroups = Array.prototype.slice.call(doc.querySelectorAll('[data-orient-group]'));
var oCount = doc.querySelector('[data-orient-count]');
var oSummary = doc.querySelector('[data-orient-summary]');
var oHint = doc.querySelector('[data-orient-hint]');
var oEmpty = doc.querySelector('[data-orient-empty]');
var oEmptyText = doc.querySelector('[data-orient-empty-text]');
var oCityLink = doc.querySelector('[data-orient-city-link]');
var oSuggest = doc.querySelector('[data-orient-suggest]');
var oSuggestList = doc.querySelector('[data-orient-suggest-list]');
var oResetEls = Array.prototype.slice.call(doc.querySelectorAll('[data-orient-reset]'));
var oResults = doc.querySelector('[data-orient-results]');
var oTotal = oRows.length;
var oState = { region: 'all', city: 'all', area: 'all', service: 'all', type: 'all' };
function oOption(select, value) {
if (!select) return null;
var found = null;
Array.prototype.forEach.call(select.options, function (opt) {
if (opt.value === value) found = opt;
});
return found;
}
function oHasOption(select, value) {
return !!oOption(select, value);
}
var oParams = new URLSearchParams(window.location.search);
if (oHasOption(oRegion, oParams.get('regione'))) oState.region = oParams.get('regione');
if (oHasOption(oCity, oParams.get('citta'))) oState.city = oParams.get('citta');
if (oHasOption(oArea, oParams.get('area'))) oState.area = oParams.get('area');
if (oHasOption(oService, oParams.get('servizio'))) oState.service = oParams.get('servizio');
if (oHasOption(oType, oParams.get('tipo'))) oState.type = oParams.get('tipo');
if (oState.city !== 'all') {
var initCity = oOption(oCity, oState.city);
if (initCity) oState.region = initCity.getAttribute('data-region') || oState.region;
}
if (oState.service !== 'all') {
var initService = oOption(oService, oState.service);
if (initService) oState.area = initService.getAttribute('data-area') || oState.area;
}
if (oRegion) oRegion.value = oState.region;
if (oCity) oCity.value = oState.city;
if (oArea) oArea.value = oState.area;
if (oService) oService.value = oState.service;
if (oType) oType.value = oState.type;
function syncCityOptions() {
if (!oCity) return;
Array.prototype.forEach.call(oCity.querySelectorAll('option[data-region]'), function (opt) {
var show = oState.region === 'all' || opt.getAttribute('data-region') === oState.region;
opt.hidden = !show;
opt.disabled = !show;
});
Array.prototype.forEach.call(oCity.querySelectorAll('optgroup'), function (group) {
var any = Array.prototype.some.call(group.querySelectorAll('option'), function (opt) {
return !opt.disabled;
});
group.hidden = !any;
group.disabled = !any;
});
if (oState.city !== 'all') {
var current = oOption(oCity, oState.city);
if (!current || current.disabled) oState.city = 'all';
}
oCity.value = oState.city;
}
function oCityData(slug) {
var opt = oOption(oCity, slug);
if (!opt) return null;
return {
slug: slug,
name: opt.getAttribute('data-name') || opt.textContent.replace(/\s*\(.*\)$/, ''),
province: opt.getAttribute('data-province') || '',
region: opt.getAttribute('data-region') || '',
regionName: opt.getAttribute('data-region-name') || opt.getAttribute('data-region') || '',
};
}
function oSuggestions() {
if (!oSuggest || !oSuggestList) return;
if (oState.service === 'all') {
oSuggest.hidden = true;
oSuggestList.innerHTML = '';
return;
}
var slugs = [];
oRows.forEach(function (rowEl) {
var services = (rowEl.getAttribute('data-services') || '').split(' ');
if (services.indexOf(oState.service) === -1) return;
var citySlug = rowEl.getAttribute('data-city');
if (citySlug && slugs.indexOf(citySlug) === -1 && citySlug !== oState.city) slugs.push(citySlug);
});
var list = slugs
.map(function (slug) {
return oCityData(slug);
})
.filter(Boolean)
.sort(function (a, b) {
var ra = oState.region !== 'all' && a.region === oState.region ? 0 : 1;
var rb = oState.region !== 'all' && b.region === oState.region ? 0 : 1;
return ra - rb || a.name.localeCompare(b.name, 'it');
})
.slice(0, 6);
if (!list.length) {
oSuggest.hidden = true;
oSuggestList.innerHTML = '';
return;
}
oSuggest.hidden = false;
oSuggestList.innerHTML = list
.map(function (city) {
return (
'<a class="orient-suggest__item" href="' +
base +
'orientamento/index.html?servizio=' +
encodeURIComponent(oState.service) +
'&citta=' +
encodeURIComponent(city.slug) +
'">' +
'<span>' +
city.name +
'</span><small>' +
city.province +
' · ' +
city.regionName +
'</small></a>'
);
})
.join('');
}
function applyOrient() {
var cityData = oState.city !== 'all' ? oCityData(oState.city) : null;
var regionOpt = oState.region !== 'all' ? oOption(oRegion, oState.region) : null;
var serviceOpt = oState.service !== 'all' ? oOption(oService, oState.service) : null;
var areaOpt = oState.area !== 'all' ? oOption(oArea, oState.area) : null;
var visible = 0;
oRows.forEach(function (rowEl) {
var ok = true;
if (oState.region !== 'all' && rowEl.getAttribute('data-region') !== oState.region) ok = false;
if (ok && oState.city !== 'all' && rowEl.getAttribute('data-city') !== oState.city) ok = false;
if (ok && oState.type !== 'all' && (rowEl.getAttribute('data-types') || '').split(' ').indexOf(oState.type) === -1) ok = false;
if (ok && oState.service !== 'all' && (rowEl.getAttribute('data-services') || '').split(' ').indexOf(oState.service) === -1) ok = false;
if (ok && oState.service === 'all' && oState.area !== 'all' && (rowEl.getAttribute('data-areas') || '').split(' ').indexOf(oState.area) === -1) ok = false;
rowEl.hidden = !ok;
if (ok) visible += 1;
});
oGroups.forEach(function (group) {
var any = Array.prototype.some.call(group.querySelectorAll('[data-orient-row]'), function (rowEl) {
return !rowEl.hidden;
});
group.hidden = !any;
});
var active = 0;
if (oState.region !== 'all') active += 1;
if (oState.city !== 'all') active += 1;
if (oState.area !== 'all') active += 1;
if (oState.service !== 'all') active += 1;
if (oState.type !== 'all') active += 1;
if (oCount) oCount.textContent = active ? visible + ' di ' + oTotal : String(oTotal);
var summary = 'Tutte le strutture del Gruppo';
if (serviceOpt) {
summary = serviceOpt.textContent.trim();
if (cityData) summary += ' · ' + cityData.name;
else if (regionOpt) summary += ' · ' + regionOpt.textContent.trim();
} else if (areaOpt) {
summary = areaOpt.textContent.trim();
if (cityData) summary += ' · ' + cityData.name;
else if (regionOpt) summary += ' · ' + regionOpt.textContent.trim();
} else if (cityData) {
summary = 'Strutture · ' + cityData.name;
} else if (regionOpt) {
summary = 'Strutture · ' + regionOpt.textContent.trim();
}
if (oSummary) oSummary.textContent = summary;
if (oHint) {
oHint.textContent = active
? 'Ordinate per regione e città. Chiama direttamente la struttura per orari, disponibilità e prenotazioni.'
: 'Seleziona la zona e il servizio: l’elenco si aggiorna mentre scegli.';
}
if (oEmpty) oEmpty.hidden = visible !== 0;
if (oEmptyText && !visible) {
if (oState.service !== 'all' && cityData) {
oEmptyText.textContent =
'A ' +
cityData.name +
' il servizio non è disponibile. È erogato in altre città del Gruppo: guarda le proposte o chiama il centralino.';
} else if (oState.service !== 'all') {
oEmptyText.textContent =
'Nessuna struttura con questi criteri eroga ' +
serviceOpt.textContent.trim() +
'. Prova ad allargare la zona o a rimuovere il filtro sulla tipologia.';
} else if (cityData) {
oEmptyText.textContent =
'A ' +
cityData.name +
' non ci sono strutture con questa tipologia. Prova a rimuoverla oppure chiama il centralino.';
} else {
oEmptyText.textContent = 'Prova ad allargare la zona o a rimuovere uno dei filtri.';
}
}
if (oCityLink) {
oCityLink.hidden = !(cityData && !visible);
if (cityData) {
oCityLink.href = base + 'zone/' + cityData.slug + '.html';
oCityLink.textContent = 'Strutture a ' + cityData.name;
}
}
oSuggestions();
oResetEls.forEach(function (el) {
el.hidden = active === 0;
});
var qs = [];
if (oState.region !== 'all') qs.push('regione=' + encodeURIComponent(oState.region));
if (oState.city !== 'all') qs.push('citta=' + encodeURIComponent(oState.city));
if (oState.area !== 'all') qs.push('area=' + encodeURIComponent(oState.area));
if (oState.service !== 'all') qs.push('servizio=' + encodeURIComponent(oState.service));
if (oState.type !== 'all') qs.push('tipo=' + encodeURIComponent(oState.type));
var url = window.location.pathname + (qs.length ? '?' + qs.join('&') : '');
try {
window.history.replaceState(null, '', url);
} catch (err) {
}
}
if (oRegion) {
oRegion.addEventListener('change', function () {
oState.region = oRegion.value;
if (oState.city !== 'all') {
var current = oOption(oCity, oState.city);
if (!current || (oState.region !== 'all' && current.getAttribute('data-region') !== oState.region)) {
oState.city = 'all';
}
}
syncCityOptions();
applyOrient();
});
}
if (oCity) {
oCity.addEventListener('change', function () {
oState.city = oCity.value;
if (oState.city !== 'all') {
var current = oOption(oCity, oState.city);
if (current) {
oState.region = current.getAttribute('data-region') || oState.region;
if (oRegion) oRegion.value = oState.region;
}
}
syncCityOptions();
applyOrient();
});
}
if (oArea) {
oArea.addEventListener('change', function () {
oState.area = oArea.value;
if (oState.service !== 'all') {
var current = oOption(oService, oState.service);
if (oState.area !== 'all' && (!current || current.getAttribute('data-area') !== oState.area)) {
oState.service = 'all';
if (oService) oService.value = 'all';
}
}
applyOrient();
});
}
if (oService) {
oService.addEventListener('change', function () {
oState.service = oService.value;
if (oState.service !== 'all') {
var current = oOption(oService, oState.service);
if (current) {
oState.area = current.getAttribute('data-area') || oState.area;
if (oArea) oArea.value = oState.area;
}
}
applyOrient();
});
}
if (oType) {
oType.addEventListener('change', function () {
oState.type = oType.value;
applyOrient();
});
}
orientForm.addEventListener('submit', function (e) {
e.preventDefault();
applyOrient();
if (oResults) {
oResults.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
});
oResetEls.forEach(function (el) {
el.addEventListener('click', function () {
oState.region = 'all';
oState.city = 'all';
oState.area = 'all';
oState.service = 'all';
oState.type = 'all';
if (oRegion) oRegion.value = 'all';
if (oArea) oArea.value = 'all';
if (oService) oService.value = 'all';
if (oType) oType.value = 'all';
syncCityOptions();
applyOrient();
});
});
syncCityOptions();
applyOrient();
}
doc.querySelectorAll('[data-console]').forEach(function (consoleEl) {
var tabsBox = consoleEl.querySelector('[data-console-tabs]');
if (!tabsBox) return;
var tabs = Array.prototype.slice.call(tabsBox.querySelectorAll('[data-console-tab]'));
var panels = Array.prototype.slice.call(consoleEl.querySelectorAll('[data-console-panel]'));
if (!tabs.length || !panels.length) return;
function activate(key, focusTab) {
tabs.forEach(function (t) {
var on = t.getAttribute('data-console-tab') === key;
t.setAttribute('aria-selected', on ? 'true' : 'false');
t.tabIndex = on ? 0 : -1;
if (on && focusTab) t.focus();
});
panels.forEach(function (panel) {
var on = panel.getAttribute('data-console-panel') === key;
panel.hidden = !on;
panel.classList.toggle('is-active', on);
});
}
tabsBox.hidden = false;
consoleEl.classList.add('is-ready');
activate(tabs[0].getAttribute('data-console-tab'), false);
tabs.forEach(function (tab, i) {
tab.addEventListener('click', function () {
activate(tab.getAttribute('data-console-tab'), false);
});
tab.addEventListener('keydown', function (e) {
var next = i;
if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
else if (e.key === 'Home') next = 0;
else if (e.key === 'End') next = tabs.length - 1;
else return;
e.preventDefault();
activate(tabs[next].getAttribute('data-console-tab'), true);
});
});
});
var rail = doc.querySelector('[data-section-rail]');
if (rail && 'IntersectionObserver' in window) {
var railLinks = Array.prototype.slice.call(rail.querySelectorAll('[data-rail]'));
var railSections = railLinks
.map(function (link) { return doc.getElementById(link.getAttribute('data-rail')); })
.filter(Boolean);
if (railLinks.length && railSections.length) {
var setRail = function (id) {
railLinks.forEach(function (link) {
var on = link.getAttribute('data-rail') === id;
link.classList.toggle('is-active', on);
if (on) link.setAttribute('aria-current', 'location');
else link.removeAttribute('aria-current');
});
};
setRail(railSections[0].id);
var railObserver = new IntersectionObserver(
function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) setRail(entry.target.id);
});
},
{ rootMargin: '-36% 0px -54% 0px', threshold: 0 }
);
railSections.forEach(function (s) { railObserver.observe(s); });
window.addEventListener('scroll', function () {
var atBottom = window.innerHeight + (window.scrollY || window.pageYOffset) >= doc.documentElement.scrollHeight - 48;
if (atBottom) setRail(railLinks[railLinks.length - 1].getAttribute('data-rail'));
}, { passive: true });
}
}
var counters = Array.prototype.slice.call(doc.querySelectorAll('[data-count]'));
function animateCounter(el) {
if (el.dataset.done) return;
el.dataset.done = '1';
var target = parseInt(el.getAttribute('data-count'), 10);
var prefix = el.getAttribute('data-prefix') || '';
var suffix = el.getAttribute('data-suffix') || '';
if (reduceMotion || isNaN(target)) {
el.textContent = prefix + target.toLocaleString('it-IT') + suffix;
return;
}
var start = performance.now();
var duration = 1400;
function frame(now) {
var p = Math.min(1, (now - start) / duration);
var eased = 1 - Math.pow(1 - p, 3);
el.textContent = prefix + Math.round(target * eased).toLocaleString('it-IT') + suffix;
if (p < 1) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
}
var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduceMotion) {
var glowTargets = doc.querySelectorAll(
'.fac-card, .news-card, .pillar, .doc, .job, .region-cell, .city-card, .svc-card, .value-card, .contact-card, .esg-card, .link-card, .stat, .path-card'
);
Array.prototype.forEach.call(glowTargets, function (el) {
if (!el || el.querySelector(':scope > .ui-glow')) return;
el.classList.add('ui-glow-host');
var glow = doc.createElement('span');
glow.className = 'ui-glow';
glow.setAttribute('aria-hidden', 'true');
el.appendChild(glow);
el.addEventListener(
'pointermove',
function (e) {
var rect = el.getBoundingClientRect();
el.style.setProperty('--mx', e.clientX - rect.left + 'px');
el.style.setProperty('--my', e.clientY - rect.top + 'px');
},
{ passive: true }
);
});
}
var revealSelectors = [
'.section-head',
'.fac-card',
'.news-card',
'.pillar',
'.person',
'.doc',
'.split__media',
'.split__content',
'.intro-home > *',
'.tl-item',
'.fin',
'.region-cell',
'.quote',
'.job',
'.callout',
'.cta-band__content',
'.cta-band__media',
'.stat',
'.svc-card',
'.city-card',
'.value-card',
'.contact-card',
'.esg-card',
'.link-card',
'.facility-fact',
'.accordion',
'.photo-tile',
];
if (!reduceMotion && 'IntersectionObserver' in window) {
var revealEls = [];
revealSelectors.forEach(function (sel) {
doc.querySelectorAll(sel).forEach(function (el) {
if (el.hasAttribute('data-reveal')) return;
el.setAttribute('data-reveal', '');
revealEls.push(el);
});
});
var io = new IntersectionObserver(
function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.classList.add('is-in');
io.unobserve(entry.target);
entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
}
});
},
{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
);
revealEls.forEach(function (el) {
io.observe(el);
});
}
if ('IntersectionObserver' in window) {
var cio = new IntersectionObserver(
function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
animateCounter(entry.target);
cio.unobserve(entry.target);
}
});
},
{ threshold: 0.4 }
);
counters.forEach(function (c) {
if (!c.closest('[data-reveal]')) cio.observe(c);
});
}
(function initJourney() {
var root = doc.querySelector('[data-journey]');
if (!root) return;
var STORAGE_KEY = 'ghc-journey-v1';
var stepEls = Array.prototype.slice.call(doc.querySelectorAll('[data-journey-step]'));
if (!stepEls.length) return;
var stepIds = [];
var stepById = {};
var stepTitleById = {};
var stepsByChapter = {};
var badgeIds = [];
var badgeLabelById = {};
var regionKeys = [];
stepEls.forEach(function (el) {
var id = el.getAttribute('data-journey-step-id');
if (!id) return;
var chapter = el.getAttribute('data-journey-chapter') || '';
if (!stepsByChapter[chapter]) stepsByChapter[chapter] = [];
if (stepsByChapter[chapter].indexOf(id) === -1) stepsByChapter[chapter].push(id);
if (stepById[id]) return;
stepById[id] = el;
stepIds.push(id);
var title = el.querySelector('.jr-step__body strong');
stepTitleById[id] = title ? title.textContent : id;
});
doc.querySelectorAll('[data-journey-badge]').forEach(function (el) {
var id = el.getAttribute('data-journey-badge');
if (!id || badgeIds.indexOf(id) !== -1) return;
badgeIds.push(id);
var label = el.querySelector('.jr-badge__body strong');
badgeLabelById[id] = label ? label.textContent : id;
});
doc.querySelectorAll('[data-journey-region-key]').forEach(function (el) {
var key = el.getAttribute('data-journey-region-key');
if (key && regionKeys.indexOf(key) === -1) regionKeys.push(key);
});
var currentPath = body.getAttribute('data-journey-page') || '';
var currentRegion = body.getAttribute('data-journey-region') || '';
var dock = doc.querySelector('.journey-dock');
var journeySectionEl = doc.getElementById('percorso');
var sectionRail = doc.querySelector('[data-section-rail]');
var panel = doc.querySelector('[data-journey-panel]');
var toast = doc.querySelector('[data-journey-toast]');
var toastTitle = doc.querySelector('[data-journey-toast-title]');
var toastText = doc.querySelector('[data-journey-toast-text]');
var toastTimer = 0;
var suppressCurrent = false;
var LEVELS = [
{ min: 0, label: 'Orientamento', note: 'Ogni percorso comincia da una domanda.' },
{ min: 1, label: 'Esplorazione', note: 'Stai conoscendo le persone e i luoghi del Gruppo.' },
{ min: 4, label: 'Approfondimento', note: 'La rete di cura e i servizi prendono forma.' },
{ min: 7, label: 'Territorio', note: 'Il Gruppo, regione per regione.' },
{ min: 10, label: 'Padronanza', note: 'Manca poco per completare il percorso.' },
{ min: 12, label: 'Percorso completo', note: 'Hai conosciuto il Gruppo in tutte le sue dimensioni.' },
];
function levelFor(done) {
var current = LEVELS[0];
LEVELS.forEach(function (level) {
if (done >= level.min) current = level;
});
return current;
}
function cleanList(value, allowed) {
if (!Array.isArray(value)) return [];
var out = [];
value.forEach(function (item) {
if (typeof item === 'string' && allowed.indexOf(item) !== -1 && out.indexOf(item) === -1) out.push(item);
});
return out;
}
function readState() {
var empty = { steps: [], regions: [], places: [] };
try {
var raw = window.localStorage.getItem(STORAGE_KEY);
if (!raw) return empty;
var parsed = JSON.parse(raw);
if (!parsed || typeof parsed !== 'object') return empty;
return {
steps: cleanList(parsed.steps, stepIds),
regions: cleanList(parsed.regions, regionKeys),
places: Array.isArray(parsed.places)
? parsed.places.filter(function (item) {
return typeof item === 'string' && item.length > 0 && item.length < 120;
})
: [],
};
} catch (err) {
return empty;
}
}
function writeState(state) {
try {
window.localStorage.setItem(
STORAGE_KEY,
JSON.stringify({
steps: state.steps,
regions: state.regions,
places: state.places,
updated: new Date().toISOString(),
})
);
} catch (err) {
}
}
function addUnique(list, value) {
if (!value || list.indexOf(value) !== -1) return false;
list.push(value);
return true;
}
function stepMatches(el, path) {
var prefix = el.getAttribute('data-journey-prefix');
if (prefix) return path.indexOf(prefix) === 0;
var exact = el.getAttribute('data-journey-match');
return !!exact && path === exact;
}
function getBadges(state) {
var unlocked = [];
if (state.steps.length >= 1) unlocked.push('primo-passo');
Object.keys(stepsByChapter).forEach(function (chapter) {
var ids = stepsByChapter[chapter];
if (!chapter || !ids.length) return;
var complete = ids.every(function (id) {
return state.steps.indexOf(id) !== -1;
});
if (complete) unlocked.push(chapter);
});
if (regionKeys.length && state.regions.length >= regionKeys.length) unlocked.push('passaporto');
if (state.places.length >= 4) unlocked.push('luoghi');
var allDone = stepIds.every(function (id) {
return state.steps.indexOf(id) !== -1;
});
if (allDone) unlocked.push('percorso');
return unlocked.filter(function (id) {
return badgeIds.indexOf(id) !== -1;
});
}
var state = readState();
var beforeBadges = getBadges(state);
var newSteps = [];
var newBadges = [];
if (!suppressCurrent) {
stepEls.forEach(function (el) {
if (!stepMatches(el, currentPath)) return;
var id = el.getAttribute('data-journey-step-id');
if (addUnique(state.steps, id) && newSteps.indexOf(id) === -1) newSteps.push(id);
});
}
addUnique(state.regions, currentRegion);
var placeMatch = currentPath.match(/^strutture\/([^/]+)\.html$/);
if (placeMatch && placeMatch[1] !== 'index') addUnique(state.places, placeMatch[1]);
writeState(state);
newBadges = getBadges(state).filter(function (id) {
return beforeBadges.indexOf(id) === -1;
});
function refresh() {
var doneCount = stepIds.filter(function (id) {
return state.steps.indexOf(id) !== -1;
}).length;
var total = stepIds.length;
var pct = total ? Math.round((doneCount / total) * 100) : 0;
var level = levelFor(doneCount);
doc.querySelectorAll('[data-journey-percent]').forEach(function (el) {
el.textContent = pct + '%';
});
doc.querySelectorAll('[data-journey-count]').forEach(function (el) {
el.textContent = doneCount + ' di ' + total;
});
doc.querySelectorAll('[data-journey-dock-percent]').forEach(function (el) {
el.textContent = pct + '%';
});
doc.querySelectorAll('[data-journey-dock-count]').forEach(function (el) {
el.textContent = doneCount + ' di ' + total + ' tappe';
});
doc.querySelectorAll('[data-journey-ring]').forEach(function (el) {
el.setAttribute('aria-valuenow', String(doneCount));
el.setAttribute('aria-valuetext', doneCount + ' di ' + total + ' tappe completate');
});
doc.querySelectorAll('[data-journey-ring-circle]').forEach(function (el) {
el.style.strokeDashoffset = String(100 - pct);
});
doc.querySelectorAll('[data-journey-level]').forEach(function (el) {
el.textContent = level.label;
});
doc.querySelectorAll('[data-journey-level-note]').forEach(function (el) {
el.textContent = level.note;
});
stepEls.forEach(function (el) {
var id = el.getAttribute('data-journey-step-id');
var done = state.steps.indexOf(id) !== -1;
var current = stepMatches(el, currentPath);
el.classList.toggle('is-done', done);
el.classList.toggle('is-current', current);
var stateEl = el.querySelector('[data-journey-state]');
if (stateEl) {
stateEl.textContent = done ? (current ? 'Sei qui' : 'Completata') : current ? 'Sei qui' : 'Da esplorare';
}
var link = el.querySelector('a');
if (link) {
if (current) link.setAttribute('aria-current', 'page');
else link.removeAttribute('aria-current');
}
});
Object.keys(stepsByChapter).forEach(function (chapter) {
var ids = stepsByChapter[chapter];
if (!chapter || !ids.length) return;
var chapterDone = ids.filter(function (id) {
return state.steps.indexOf(id) !== -1;
}).length;
doc.querySelectorAll('[data-journey-chapter-count="' + chapter + '"]').forEach(function (el) {
el.textContent = chapterDone + '/' + ids.length;
});
doc.querySelectorAll('[data-journey-chapter-block="' + chapter + '"]').forEach(function (el) {
el.classList.toggle('is-complete', chapterDone === ids.length);
});
});
var base = body.getAttribute('data-base') || '';
var nextId = stepIds.filter(function (id) {
return state.steps.indexOf(id) === -1;
})[0];
doc.querySelectorAll('[data-journey-next]').forEach(function (link) {
var labelEl = link.querySelector('[data-journey-next-label]');
var titleEl = link.querySelector('[data-journey-next-title]');
var metaEl = link.querySelector('[data-journey-next-meta]');
if (labelEl) {
labelEl.textContent =
doneCount === 0
? 'Inizia da qui'
: nextId
? 'Riprendi da qui'
: 'Tutte le tappe completate';
}
if (nextId) {
var stepEl = stepById[nextId];
var stepLink = stepEl ? stepEl.querySelector('a') : null;
var stepTitle = stepEl ? stepEl.querySelector('.jr-step__body strong') : null;
var stepNote = stepEl ? stepEl.querySelector('.jr-step__body span') : null;
if (stepLink) link.setAttribute('href', stepLink.getAttribute('href'));
if (titleEl) titleEl.textContent = stepTitle ? stepTitle.textContent : stepTitleById[nextId] || '';
if (metaEl) metaEl.textContent = stepNote ? stepNote.textContent : '';
} else {
link.setAttribute('href', base + 'index.html#percorso');
if (titleEl) titleEl.textContent = 'Rivedi la mappa del percorso';
if (metaEl) metaEl.textContent = 'Puoi rileggere le dodici tappe in qualsiasi momento.';
}
});
doc.querySelectorAll('[data-journey-complete]').forEach(function (el) {
el.hidden = !(total && doneCount === total);
});
var unlocked = getBadges(state);
doc.querySelectorAll('[data-journey-badge]').forEach(function (el) {
var id = el.getAttribute('data-journey-badge');
var on = unlocked.indexOf(id) !== -1;
el.classList.toggle('is-unlocked', on);
var totalForBadge = Number(el.getAttribute('data-journey-badge-total') || 0);
var progress = 0;
if (id === 'luoghi') progress = state.places.length;
else if (id === 'passaporto') progress = state.regions.length;
else if (id === 'percorso') progress = doneCount;
else if (stepsByChapter[id]) {
progress = stepsByChapter[id].filter(function (stepId) {
return state.steps.indexOf(stepId) !== -1;
}).length;
}
var stateEl = el.querySelector('[data-journey-badge-state]');
if (stateEl) {
if (on) stateEl.textContent = 'Sbloccato';
else if (totalForBadge > 0) {
stateEl.textContent = 'Da sbloccare · ' + Math.min(progress, totalForBadge) + '/' + totalForBadge;
} else {
stateEl.textContent = 'Da sbloccare';
}
}
});
doc.querySelectorAll('[data-journey-badge-count]').forEach(function (el) {
el.textContent = unlocked.length + ' di ' + badgeIds.length;
});
doc.querySelectorAll('[data-journey-region-key]').forEach(function (el) {
var key = el.getAttribute('data-journey-region-key');
var on = state.regions.indexOf(key) !== -1;
el.classList.toggle('is-stamped', on);
var stateEl = el.querySelector('[data-journey-region-state]');
if (stateEl) stateEl.textContent = on ? 'Visitata' : 'Da visitare';
var link = el.querySelector('a');
var nameEl = el.querySelector('.jr-region__body strong');
if (link && nameEl) {
link.setAttribute('aria-label', nameEl.textContent + (on ? ' — regione visitata' : ' — regione da visitare'));
}
});
doc.querySelectorAll('[data-journey-region-count]').forEach(function (el) {
el.textContent = state.regions.length + ' di ' + regionKeys.length;
});
}
function showToast(stepTitles, badgeLabels, override) {
if (!toast || !toastTitle || !toastText) return;
if (override) {
toastTitle.textContent = override.title;
toastText.textContent = override.text || '';
} else {
var lines = [];
if (stepTitles.length) {
lines.push(stepTitles.length === 1 ? 'Tappa completata: ' + stepTitles[0] : stepTitles.length + ' nuove tappe completate');
}
if (badgeLabels.length) {
lines.push(badgeLabels.length === 1 ? 'Traguardo sbloccato: ' + badgeLabels[0] : badgeLabels.length + ' nuovi traguardi sbloccati');
}
toastTitle.textContent = lines[0] || 'Percorso aggiornato';
toastText.textContent = lines.slice(1).join(' · ');
}
toast.hidden = false;
window.clearTimeout(toastTimer);
toastTimer = window.setTimeout(function () {
toast.hidden = true;
}, 7000);
}
function setExpanded(value) {
doc.querySelectorAll('[data-journey-open]').forEach(function (btn) {
if (btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', value ? 'true' : 'false');
});
}
function openPanel() {
if (!panel) return;
if (typeof panel.showModal === 'function') {
if (!panel.open) panel.showModal();
} else {
panel.setAttribute('open', '');
}
setExpanded(true);
if (toast) toast.hidden = true;
}
function closePanel() {
if (!panel) return;
if (typeof panel.close === 'function' && panel.open) panel.close();
else panel.removeAttribute('open');
setExpanded(false);
}
if (panel) {
doc.querySelectorAll('[data-journey-open]').forEach(function (btn) {
btn.addEventListener('click', openPanel);
});
doc.querySelectorAll('[data-journey-close]').forEach(function (btn) {
btn.addEventListener('click', closePanel);
});
panel.addEventListener('close', function () {
setExpanded(false);
});
panel.addEventListener('click', function (event) {
if (event.target === panel) closePanel();
});
}
var resetBtn = doc.querySelector('[data-journey-reset]');
var resetConfirm = doc.querySelector('[data-journey-reset-confirm]');
if (resetBtn && resetConfirm) {
resetBtn.addEventListener('click', function () {
resetConfirm.hidden = false;
resetBtn.hidden = true;
var yes = resetConfirm.querySelector('[data-journey-reset-confirm-btn]');
if (yes) yes.focus();
});
var cancel = resetConfirm.querySelector('[data-journey-reset-cancel]');
if (cancel) {
cancel.addEventListener('click', function () {
resetConfirm.hidden = true;
resetBtn.hidden = false;
resetBtn.focus();
});
}
var confirm = resetConfirm.querySelector('[data-journey-reset-confirm-btn]');
if (confirm) {
confirm.addEventListener('click', function () {
state = { steps: [], regions: [], places: [] };
suppressCurrent = true;
writeState(state);
refresh();
resetConfirm.hidden = true;
resetBtn.hidden = false;
resetBtn.focus();
showToast([], [], {
title: 'Percorso azzerato',
text: 'I progressi sono stati cancellati da questo dispositivo.',
});
});
}
}
refresh();
if (dock && journeySectionEl && 'IntersectionObserver' in window) {
var journeyObserver = new IntersectionObserver(
function (entries) {
entries.forEach(function (entry) {
dock.classList.toggle('is-suppressed', entry.isIntersecting);
if (sectionRail) sectionRail.classList.toggle('is-on-dark', entry.isIntersecting);
});
},
{ threshold: 0.18 }
);
journeyObserver.observe(journeySectionEl);
}
if (newSteps.length || newBadges.length) {
showToast(
newSteps.map(function (id) {
return stepTitleById[id] || id;
}),
newBadges.map(function (id) {
return badgeLabelById[id] || id;
})
);
}
})();
doc.querySelectorAll('[data-demo-form]').forEach(function (form) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var success = form.querySelector('[data-form-success]');
if (success) {
success.classList.add('is-visible');
success.setAttribute('role', 'status');
success.focus();
}
form.querySelectorAll('input, textarea, select, button').forEach(function (el) {
if (el.tagName !== 'BUTTON') el.value = '';
});
});
});
var svcFilter = doc.querySelector('[data-svc-filter]');
if (svcFilter) {
var svcInput = svcFilter.querySelector('[data-svc-input]');
var svcCount = svcFilter.querySelector('[data-svc-count]');
var svcEmpty = svcFilter.querySelector('[data-svc-empty]');
var svcSections = Array.prototype.slice.call(doc.querySelectorAll('[data-svc-section]'));
var svcCards = Array.prototype.slice.call(doc.querySelectorAll('[data-svc-card]'));
var svcTotal = svcCards.length;
function svcNormalise(value) {
return (value || '')
.toLowerCase()
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '');
}
function applySvcFilter() {
var q = svcNormalise(svcInput ? svcInput.value : '').trim();
var shown = 0;
svcSections.forEach(function (section) {
var visible = 0;
section.querySelectorAll('[data-svc-family]').forEach(function (family) {
var familyVisible = 0;
family.querySelectorAll('[data-svc-card]').forEach(function (card) {
var hay = svcNormalise(
(card.getAttribute('data-name') || '') + ' ' + (card.textContent || '')
);
var match = !q || hay.indexOf(q) !== -1;
card.classList.toggle('is-hidden', !match);
if (match) {
familyVisible += 1;
visible += 1;
shown += 1;
}
});
family.classList.toggle('is-hidden', q !== '' && familyVisible === 0);
});
section.classList.toggle('is-hidden', q !== '' && visible === 0);
});
if (svcCount) {
svcCount.textContent = q ? shown + ' di ' + svcTotal + ' servizi' : svcTotal + ' servizi';
}
if (svcEmpty) svcEmpty.hidden = !(q !== '' && shown === 0);
}
if (svcInput) svcInput.addEventListener('input', applySvcFilter);
doc.querySelectorAll('.svc-cat-nav a').forEach(function (link) {
link.addEventListener('click', function () {
if (svcInput && svcInput.value) {
svcInput.value = '';
applySvcFilter();
}
});
});
}
var sideLinks = doc.querySelectorAll('.side-nav a');
if (sideLinks.length) {
var path = window.location.pathname.split('/').pop();
sideLinks.forEach(function (a) {
var href = a.getAttribute('href') || '';
if (href.split('/').pop() === path) a.classList.add('is-active');
});
}
doc.querySelectorAll('.side-nav').forEach(function (nav) {
var active = nav.querySelector('a.is-active');
if (active && nav.scrollWidth > nav.clientWidth + 4) {
var delta = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
nav.scrollLeft = Math.max(0, nav.scrollLeft + delta - 4);
}
});
})();