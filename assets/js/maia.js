(function () {
"use strict";
if (window.__maiaGhc) return;
window.__maiaGhc = true;
var API = String(window.MAIA_API || "/api/maia").replace(/\/+$/, "");
var MAX_INPUT = 800;
var MAX_HISTORY = 8;
var STORE_TOKEN = "maia:token";
var STORE_VOICE = "maia:voice";
var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var SVG = {
spark:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9 12 3.5Z"/><path d="M19 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>',
close:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>',
send:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 12 20 4.5 15.6 20l-3.4-6.1L4.5 12Z"/></svg>',
stop:
'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
mic:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></svg>',
speaker:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 9.5h3L13 5v14l-5-4.5H5z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
speakerOff:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 9.5h3L13 5v14l-5-4.5H5z"/><path d="m16.5 9.5 5 5M21.5 9.5l-5 5"/></svg>',
info:
'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/></svg>',
};
var root = document.createElement("div");
root.className = "maia-root";
root.setAttribute("data-maia-root", "");
root.innerHTML =
'<button class="maia-fab" type="button" data-maia-open aria-expanded="false" aria-controls="maia-panel" aria-label="Apri MAIA, l’assistente digitale di Garofalo Health Care">' +
'<span class="maia-fab__icon">' + SVG.spark + "</span>" +
'<span class="maia-fab__text"><strong>MAIA</strong><span>Assistente AI</span></span>' +
"</button>" +
'<div class="maia-scrim" data-maia-scrim hidden></div>' +
'<section class="maia-panel" id="maia-panel" role="dialog" aria-modal="true" aria-labelledby="maia-title" hidden>' +
'<header class="maia-head">' +
'<div class="maia-head__id"><span class="maia-avatar" aria-hidden="true">' + SVG.spark + "</span>" +
'<div class="maia-head__copy"><h2 id="maia-title">MAIA <span class="maia-live" aria-hidden="true"></span></h2><p>Assistente digitale del Gruppo</p></div></div>' +
'<div class="maia-head__actions">' +
'<button class="maia-iconbtn maia-voicebtn" type="button" data-maia-voice aria-pressed="false" aria-label="Attiva le risposte vocali" title="Attiva le risposte vocali"><span class="maia-voicebtn__on">' + SVG.speaker + '</span><span class="maia-voicebtn__off">' + SVG.speakerOff + "</span></button>" +
'<button class="maia-iconbtn" type="button" data-maia-close aria-label="Chiudi l’assistente">' + SVG.close + "</button>" +
"</div></header>" +
'<div class="maia-log" data-maia-log role="log" aria-live="polite" aria-relevant="additions text"></div>' +
'<div class="maia-playbar" data-maia-playbar hidden><span class="maia-playbar__eq" aria-hidden="true"><i></i><i></i><i></i></span><span>Sto leggendo la risposta…</span><button type="button" data-maia-stopaudio>Ferma</button></div>' +
'<div class="maia-status" data-maia-status role="status" hidden></div>' +
'<div class="maia-rec" data-maia-rec hidden><span class="maia-rec__dot" aria-hidden="true"></span><span>Sto ascoltando</span><strong data-maia-timer>0:00</strong><button type="button" class="maia-rec__cancel" data-maia-reccancel>Annulla</button><button type="button" class="maia-rec__send" data-maia-recstop>Invia</button></div>' +
'<form class="maia-compose" data-maia-form novalidate>' +
'<button class="maia-mic" type="button" data-maia-mic aria-label="Registra un messaggio vocale" title="Parla con MAIA">' + SVG.mic + "</button>" +
'<label class="maia-sr" for="maia-input">Scrivi la tua domanda</label>' +
'<textarea id="maia-input" data-maia-input rows="1" maxlength="' + MAX_INPUT + '" placeholder="Scrivi la tua domanda…" enterkeyhint="send" autocomplete="off"></textarea>' +
'<button class="maia-send" type="submit" data-maia-send aria-label="Invia la domanda">' + SVG.send + "</button>" +
"</form>" +
'<div class="maia-foot"><span>Risposte generate con AI. <a data-maia-info href="assistente-ai.html">Come funziona</a></span><span class="maia-quota" data-maia-quota></span></div>' +
"</section>";
document.body.appendChild(root);
var $ = function (selector) {
return root.querySelector(selector);
};
var panel = $(".maia-panel");
var fab = $(".maia-fab");
var scrim = $(".maia-scrim");
var log = $("[data-maia-log]");
var form = $("[data-maia-form]");
var input = $("[data-maia-input]");
var sendBtn = $("[data-maia-send]");
var micBtn = $("[data-maia-mic]");
var voiceBtn = $("[data-maia-voice]");
var statusEl = $("[data-maia-status]");
var playbar = $("[data-maia-playbar]");
var recEl = $("[data-maia-rec]");
var timerEl = $("[data-maia-timer]");
var quotaEl = $("[data-maia-quota]");
var infoLink = $("[data-maia-info]");
if (infoLink) {
var base = (document.body && document.body.dataset && document.body.dataset.base) || "";
infoLink.setAttribute("href", base + "assistente-ai.html");
}
var state = {
open: false,
token: "",
expiresAt: 0,
health: null,
healthChecked: false,
session: null,
busy: false,
messages: [],
welcomeDone: false,
unavailable: false,
voice: false,
speaking: false,
streamController: null,
audioController: null,
audio: null,
recording: null,
sessionPromise: null,
statusTimer: null,
lastAnswer: "",
exhausted: false,
exhaustedShown: false,
};
function readStored(key) {
try {
return window.sessionStorage.getItem(key);
} catch {
return null;
}
}
function writeStored(key, value) {
try {
window.sessionStorage.setItem(key, value);
} catch {
}
}
function readVoice() {
try {
return window.localStorage.getItem(STORE_VOICE) === "1";
} catch {
return false;
}
}
function saveVoice(value) {
try {
window.localStorage.setItem(STORE_VOICE, value ? "1" : "0");
} catch {
}
}
(function restoreToken() {
var raw = readStored(STORE_TOKEN);
if (!raw) return;
try {
var saved = JSON.parse(raw);
if (saved && typeof saved.token === "string" && saved.expiresAt > Date.now() + 5000) {
state.token = saved.token;
state.expiresAt = saved.expiresAt;
}
} catch {
}
})();
function escapeHtml(value) {
return String(value == null ? "" : value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#39;");
}
function safeUrl(value) {
try {
var url = new URL(value, location.href);
if (url.protocol !== "https:" && url.protocol !== "http:") return "";
if (!/(^|\.)garofalohealthcare\.com$/i.test(url.hostname)) return "";
return url.href;
} catch {
return "";
}
}
function richText(text) {
var html = escapeHtml(text);
html = html.replace(/\[([^\]]{1,90})\]\((https?:\/\/[^\s)]+)\)/g, function (_, label, url) {
var safe = safeUrl(url);
return safe
? '<a href="' + escapeHtml(safe) + '" target="_blank" rel="noopener">' + label + "</a>"
: label;
});
html = html.replace(/\*\*([^*\n]{1,80})\*\*/g, "<strong>$1</strong>");
html = html.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (match, prefix, url) {
var safe = safeUrl(url);
return safe ? prefix + '<a href="' + escapeHtml(safe) + '" target="_blank" rel="noopener">' + url + "</a>" : match;
});
return html;
}
function scrollLog(force) {
var near = log.scrollHeight - log.scrollTop - log.clientHeight < 120;
if (force || near) log.scrollTop = log.scrollHeight;
}
function addMessage(role, text, options) {
options = options || {};
var wrap = document.createElement("div");
wrap.className = "maia-msg maia-msg--" + role + (options.error ? " is-error" : "");
if (role === "bot") {
var avatar = document.createElement("span");
avatar.className = "maia-msg__avatar";
avatar.setAttribute("aria-hidden", "true");
avatar.innerHTML = SVG.spark;
wrap.appendChild(avatar);
}
var bubble = document.createElement("div");
bubble.className = "maia-bubble";
if (options.typing) {
bubble.innerHTML = '<span class="maia-typing" aria-label="MAIA sta scrivendo"><i></i><i></i><i></i></span>';
bubble.dataset.typing = "1";
} else if (options.html) {
bubble.innerHTML = text;
} else {
bubble.textContent = text;
}
wrap.appendChild(bubble);
log.appendChild(wrap);
scrollLog(true);
return wrap;
}
function bubbleOf(wrap) {
return wrap.querySelector(".maia-bubble");
}
function setTyping(wrap, typing) {
var bubble = bubbleOf(wrap);
if (!bubble) return;
if (typing) {
bubble.innerHTML = '<span class="maia-typing" aria-label="MAIA sta scrivendo"><i></i><i></i><i></i></span>';
bubble.dataset.typing = "1";
} else if (bubble.dataset.typing === "1") {
bubble.textContent = "";
delete bubble.dataset.typing;
}
}
function addSuggestions(items) {
if (!items || !items.length) return;
var row = document.createElement("div");
row.className = "maia-chips";
items.slice(0, 3).forEach(function (item) {
if (!item || !item.label || !item.prompt) return;
var chip = document.createElement("button");
chip.type = "button";
chip.className = "maia-chip";
chip.textContent = item.label;
chip.addEventListener("click", function () {
send(item.prompt);
});
row.appendChild(chip);
});
if (row.children.length) log.appendChild(row);
}
function addSources(items) {
if (!items || !items.length) return;
var valid = items
.map(function (item) {
return item && item.title && item.url ? { title: item.title, url: safeUrl(item.url) } : null;
})
.filter(function (item) {
return item && item.url;
})
.slice(0, 3);
if (!valid.length) return;
var box = document.createElement("div");
box.className = "maia-sources";
var label = document.createElement("span");
label.className = "maia-sources__label";
label.textContent = "Fonti";
box.appendChild(label);
valid.forEach(function (item) {
var link = document.createElement("a");
link.href = item.url;
link.target = "_blank";
link.rel = "noopener";
link.textContent = item.title;
box.appendChild(link);
});
log.appendChild(box);
}
function clearSuggestions() {
Array.prototype.forEach.call(log.querySelectorAll(".maia-chips"), function (node) {
node.remove();
});
}
function setUnavailable() {
state.unavailable = true;
state.health = state.health || { ok: false };
clearLog();
addMessage(
"bot",
"L’assistente non è raggiungibile da questa anteprima. La versione completa di MAIA è attiva sul sito ufficiale Garofalo Health Care. Puoi intanto consultare strutture, servizi e convenzioni dalle pagine del sito.",
{ error: false }
);
var chips = document.createElement("div");
chips.className = "maia-chips";
var retry = document.createElement("button");
retry.type = "button";
retry.className = "maia-chip";
retry.textContent = "Riprova";
retry.addEventListener("click", retryConnection);
chips.appendChild(retry);
log.appendChild(chips);
setComposerEnabled(false);
quotaEl.textContent = "";
hideStatus();
}
function clearLog() {
log.innerHTML = "";
}
function setComposerEnabled(enabled) {
input.disabled = !enabled;
sendBtn.disabled = !enabled;
micBtn.disabled = !enabled;
form.classList.toggle("is-disabled", !enabled);
}
function showStatus(message, kind, sticky) {
statusEl.textContent = message;
statusEl.dataset.kind = kind || "info";
statusEl.hidden = false;
clearTimeout(state.statusTimer);
if (!sticky) {
state.statusTimer = setTimeout(function () {
statusEl.hidden = true;
}, 6500);
}
}
function hideStatus() {
clearTimeout(state.statusTimer);
statusEl.hidden = true;
}
function applySession(session) {
if (!session) return;
state.session = session;
if (typeof session.messagesLeft === "number") {
quotaEl.textContent = session.messagesLeft + (session.messagesLeft === 1 ? " messaggio" : " messaggi");
if (session.messagesLeft <= 0) {
state.exhausted = true;
setComposerEnabled(false);
if (!state.exhaustedShown) {
state.exhaustedShown = true;
addSuggestions([{ label: "Nuova conversazione", prompt: "__new_session__" }]);
}
} else {
state.exhausted = false;
state.exhaustedShown = false;
}
}
}
function ensureSession(force) {
if (!force && state.token && state.expiresAt > Date.now() + 5000) return Promise.resolve(state.token);
if (state.sessionPromise) return state.sessionPromise;
state.sessionPromise = fetch(API + "/session", {
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({ locale: "it" }),
cache: "no-store",
})
.then(function (response) {
return response
.json()
.catch(function () {
return {};
})
.then(function (data) {
if (!response.ok) throw new Error(data.error || "Non riesco ad aprire la sessione.");
state.token = data.token;
state.expiresAt = data.expiresAt;
writeStored(STORE_TOKEN, JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
applySession(data.session);
return data.token;
});
})
.finally(function () {
state.sessionPromise = null;
});
return state.sessionPromise;
}
function checkHealth() {
if (state.healthChecked) return Promise.resolve(state.health);
state.healthChecked = true;
var controller = new AbortController();
var timer = setTimeout(function () {
controller.abort();
}, 5000);
return fetch(API + "/health", { signal: controller.signal, cache: "no-store" })
.then(function (response) {
if (!response.ok) throw new Error("offline");
return response.json();
})
.then(function (data) {
state.health = data;
if (data && data.mock) root.setAttribute("data-mock", "1");
return data;
})
.catch(function () {
state.health = { ok: false };
return state.health;
})
.finally(function () {
clearTimeout(timer);
});
}
function welcome() {
addMessage(
"bot",
"Ciao, sono MAIA, l’assistente digitale di Garofalo Health Care. Posso aiutarti a trovare una struttura o un servizio, capire come funzionano le convenzioni e metterti in contatto con il Gruppo. Non fornisco diagnosi o consigli medici. Di cosa hai bisogno?",
{}
);
addSuggestions([
{ label: "Trova una struttura", prompt: "Come posso trovare la struttura più adatta a me?" },
{ label: "Convenzioni", prompt: "Come funzionano le convenzioni con assicurazioni e fondi?" },
{ label: "Contatti", prompt: "Come posso contattare il Gruppo Garofalo Health Care?" },
]);
}
function boot() {
showStatus("Connessione all’assistente…", "info", true);
setComposerEnabled(false);
checkHealth().then(function (health) {
if (!health || !health.ok || !health.capabilities || !health.capabilities.chat) {
setUnavailable();
return;
}
hideStatus();
setComposerEnabled(true);
welcome();
ensureSession(false)
.then(function () {
hideStatus();
})
.catch(function (error) {
showStatus(error.message || "Non riesco ad aprire la sessione.", "warn", true);
});
});
}
function retryConnection() {
state.healthChecked = false;
state.unavailable = false;
state.welcomeDone = true;
clearLog();
boot();
}
function setBusy(busy) {
state.busy = busy;
sendBtn.classList.toggle("is-stop", busy);
sendBtn.setAttribute("aria-label", busy ? "Interrompi la risposta" : "Invia la domanda");
sendBtn.innerHTML = busy ? SVG.stop : SVG.send;
if (busy) {
sendBtn.disabled = false;
micBtn.disabled = true;
} else {
micBtn.disabled = state.unavailable || state.exhausted;
sendBtn.disabled = state.unavailable || state.exhausted || !input.value.trim();
}
}
function readSse(response, onEvent) {
var reader = response.body.getReader();
var decoder = new TextDecoder();
var buffer = "";
function pump() {
return reader.read().then(function (result) {
if (result.done) {
buffer += decoder.decode();
return undefined;
}
buffer += decoder.decode(result.value, { stream: true });
var index;
while ((index = buffer.indexOf("\n\n")) >= 0) {
var block = buffer.slice(0, index);
buffer = buffer.slice(index + 2);
var event = "message";
var data = "";
block.split(/\r?\n/).forEach(function (line) {
if (line.indexOf("event:") === 0) event = line.slice(6).trim();
else if (line.indexOf("data:") === 0) data += line.slice(5).trim();
});
if (data) {
var parsed = null;
try {
parsed = JSON.parse(data);
} catch {
parsed = null;
}
if (parsed) onEvent(event, parsed);
}
}
return pump();
});
}
return pump().finally(function () {
try {
reader.cancel();
} catch {
}
});
}
function finalizeAnswer(wrap, answer, data) {
var bubble = bubbleOf(wrap);
if (!bubble || bubble.dataset.done === "1") return;
bubble.dataset.done = "1";
setTyping(wrap, false);
if (answer) {
bubble.innerHTML = richText(answer);
state.lastAnswer = answer;
state.messages.push({ role: "assistant", content: answer });
if (state.messages.length > MAX_HISTORY * 2) state.messages = state.messages.slice(-MAX_HISTORY * 2);
}
if (data && data.session) applySession(data.session);
if (data && data.sources) addSources(data.sources);
if (data && data.suggestions) addSuggestions(data.suggestions);
scrollLog(true);
if (answer && state.voice) speak(answer);
}
function send(raw) {
var text = String(raw == null ? "" : raw).trim().slice(0, MAX_INPUT);
if (!text || state.busy) return;
if (text === "__new_session__") {
resetSession();
return;
}
if (state.unavailable) {
retryConnection();
return;
}
clearSuggestions();
hideStatus();
addMessage("user", text);
state.messages.push({ role: "user", content: text });
if (state.messages.length > MAX_HISTORY * 2) state.messages = state.messages.slice(-MAX_HISTORY * 2);
input.value = "";
autosize();
setBusy(true);
var wrap = addMessage("bot", "", { typing: true });
var answer = "";
var controller = new AbortController();
state.streamController = controller;
function attempt(index) {
return ensureSession(index > 0).then(function (token) {
return fetch(API + "/chat", {
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({
token: token,
messages: state.messages.slice(-MAX_HISTORY),
page: location.pathname,
locale: "it",
}),
signal: controller.signal,
}).then(function (response) {
if (response.status === 401 && index === 0) {
state.token = "";
state.expiresAt = 0;
writeStored(STORE_TOKEN, "");
return attempt(1);
}
if (!response.ok) {
return response
.json()
.catch(function () {
return {};
})
.then(function (data) {
throw new Error(data.error || "Troppe richieste. Riprova tra poco.");
});
}
return readSse(response, function (event, data) {
if (event === "delta" && data.text) {
setTyping(wrap, false);
answer += data.text;
var bubble = bubbleOf(wrap);
bubble.textContent = answer;
scrollLog(false);
} else if (event === "done") {
finalizeAnswer(wrap, answer, data);
} else if (event === "error") {
throw new Error(data.message || "L’assistente non è raggiungibile.");
}
});
});
});
}
attempt(0)
.then(function () {
if (!answer) throw new Error("Non ho ricevuto una risposta. Riprova.");
finalizeAnswer(wrap, answer, null);
})
.catch(function (error) {
setTyping(wrap, false);
var bubble = bubbleOf(wrap);
if (controller.signal.aborted) {
if (!answer) bubble.textContent = "Risposta interrotta.";
else finalizeAnswer(wrap, answer, null);
} else {
wrap.classList.add("is-error");
bubble.textContent = error && error.message ? error.message : "Si è verificato un errore. Riprova tra poco.";
scrollLog(true);
if (/sessione/i.test(bubble.textContent)) {
addSuggestions([{ label: "Riapri la sessione", prompt: "__new_session__" }]);
}
}
})
.finally(function () {
state.streamController = null;
setBusy(false);
input.focus({ preventScroll: true });
});
}
function resetSession() {
state.token = "";
state.expiresAt = 0;
state.session = null;
state.messages = [];
state.exhausted = false;
state.exhaustedShown = false;
state.unavailable = false;
writeStored(STORE_TOKEN, "");
clearLog();
setComposerEnabled(true);
quotaEl.textContent = "";
ensureSession(true)
.then(function () {
hideStatus();
})
.catch(function (error) {
showStatus(error.message || "Non riesco ad aprire una nuova sessione.", "warn");
});
welcome();
}
function splitSpeech(text, max) {
var clean = String(text || "")
.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
.replace(/https?:\/\/\S+/g, "")
.replace(/[*_`#>]+/g, "")
.replace(/\s+/g, " ")
.trim();
if (!clean) return [];
var sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
var chunks = [];
var current = "";
sentences.forEach(function (sentence) {
var piece = sentence.trim();
if (!piece) return;
if (current && current.length + piece.length + 1 > max) {
chunks.push(current);
current = "";
}
current = current ? current + " " + piece : piece;
});
if (current) chunks.push(current);
return chunks;
}
function stopAudio() {
if (state.audioController) {
state.audioController.abort();
state.audioController = null;
}
if (state.audio) {
try {
state.audio.pause();
state.audio.removeAttribute("src");
state.audio.load();
} catch {
}
state.audio = null;
}
state.speaking = false;
playbar.hidden = true;
voiceBtn.classList.remove("is-playing");
}
function playBlob(blob, signal) {
return new Promise(function (resolve) {
var url = URL.createObjectURL(blob);
var audio = new Audio(url);
state.audio = audio;
var finished = false;
function done() {
if (finished) return;
finished = true;
try {
audio.pause();
audio.removeAttribute("src");
audio.load();
} catch {
}
URL.revokeObjectURL(url);
if (state.audio === audio) state.audio = null;
signal.removeEventListener("abort", done);
resolve();
}
audio.addEventListener("ended", done, { once: true });
audio.addEventListener("error", done, { once: true });
signal.addEventListener("abort", done, { once: true });
audio.play().catch(done);
});
}
function speak(text) {
if (!state.health || !state.health.capabilities || !state.health.capabilities.voice) return;
stopAudio();
var chunks = splitSpeech(text, 480);
if (!chunks.length) return;
var controller = new AbortController();
state.audioController = controller;
state.speaking = true;
playbar.hidden = false;
voiceBtn.classList.add("is-playing");
scrollLog(true);
function fetchChunk(piece, attempt) {
return fetch(API + "/voice", {
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({ token: state.token, text: piece, lang: "it" }),
signal: controller.signal,
}).then(function (response) {
if (response.status === 429 && !attempt) {
var wait = Number(response.headers.get("retry-after")) || 3;
if (wait <= 6) {
return new Promise(function (resolve) {
setTimeout(resolve, Math.max(1, wait) * 1000);
}).then(function () {
return fetchChunk(piece, 1);
});
}
}
if (!response.ok) {
return response
.json()
.catch(function () {
return {};
})
.then(function (data) {
throw new Error(data.error || "La voce non è disponibile.");
});
}
return response.blob();
});
}
var chain = Promise.resolve();
chunks.forEach(function (piece) {
chain = chain.then(function () {
if (controller.signal.aborted) return undefined;
return fetchChunk(piece).then(function (blob) {
if (controller.signal.aborted || !blob || !blob.size) return undefined;
return playBlob(blob, controller.signal);
});
});
});
chain
.catch(function (error) {
if (!controller.signal.aborted) showStatus(error.message || "La voce non è disponibile.", "warn");
})
.finally(function () {
if (state.audioController === controller) {
state.audioController = null;
state.speaking = false;
playbar.hidden = true;
voiceBtn.classList.remove("is-playing");
}
});
}
function setVoice(on) {
state.voice = Boolean(on);
saveVoice(state.voice);
voiceBtn.setAttribute("aria-pressed", state.voice ? "true" : "false");
voiceBtn.setAttribute("aria-label", state.voice ? "Disattiva le risposte vocali" : "Attiva le risposte vocali");
voiceBtn.title = state.voice ? "Disattiva le risposte vocali" : "Ascolta le risposte";
voiceBtn.classList.toggle("is-on", state.voice);
if (!state.voice) {
stopAudio();
return;
}
if (state.lastAnswer && !state.busy) speak(state.lastAnswer);
}
function pickMime() {
if (!window.MediaRecorder) return "";
var types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
for (var i = 0; i < types.length; i += 1) {
if (MediaRecorder.isTypeSupported(types[i])) return types[i];
}
return "";
}
function stopRecording(sendIt) {
var rec = state.recording;
if (!rec) return;
rec.discard = !sendIt;
clearInterval(rec.timer);
try {
rec.recorder.stop();
} catch {
finishRecording();
}
}
function finishRecording() {
var rec = state.recording;
if (!rec) return;
state.recording = null;
rec.stream.getTracks().forEach(function (track) {
track.stop();
});
recEl.hidden = true;
micBtn.classList.remove("is-recording");
micBtn.setAttribute("aria-label", "Registra un messaggio vocale");
if (rec.discard) return;
var blob = new Blob(rec.chunks, { type: rec.recorder.mimeType || "audio/webm" });
if (blob.size < 800) {
showStatus("La registrazione è troppo breve. Tieni il microfono aperto qualche secondo.", "warn");
return;
}
transcribeBlob(blob);
}
function transcribeBlob(blob) {
showStatus("Trascrivo l’audio…", "info", true);
ensureSession(false)
.then(function (token) {
return fetch(API + "/transcribe?lang=it", {
method: "POST",
headers: { "content-type": blob.type || "audio/webm", "x-maia-token": token },
body: blob,
}).then(function (response) {
if (response.status === 401) {
state.token = "";
state.expiresAt = 0;
writeStored(STORE_TOKEN, "");
return ensureSession(true).then(function (fresh) {
return fetch(API + "/transcribe?lang=it", {
method: "POST",
headers: { "content-type": blob.type || "audio/webm", "x-maia-token": fresh },
body: blob,
});
});
}
return response;
});
})
.then(function (response) {
return response
.json()
.catch(function () {
return {};
})
.then(function (data) {
if (!response.ok) throw new Error(data.error || "Non riesco a trascrivere l’audio.");
var text = String(data.text || "").trim();
if (!text) throw new Error("Non ho capito l’audio. Prova a scrivere la domanda.");
hideStatus();
input.value = text.slice(0, MAX_INPUT);
autosize();
if (!state.voice && state.health && state.health.capabilities && state.health.capabilities.voice) {
setVoice(true);
}
send(text);
});
})
.catch(function (error) {
showStatus(error.message || "Non riesco a trascrivere l’audio.", "warn");
});
}
function startRecording() {
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
showStatus("Il microfono non è supportato da questo browser. Puoi scrivere la domanda.", "warn");
return;
}
if (!state.health || !state.health.capabilities || !state.health.capabilities.stt) {
showStatus("Il microfono non è disponibile in questo momento. Puoi scrivere la domanda.", "warn");
return;
}
navigator.mediaDevices
.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
.then(function (stream) {
var mime = pickMime();
var recorder;
try {
recorder = mime
? new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 })
: new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
} catch {
stream.getTracks().forEach(function (track) {
track.stop();
});
showStatus("Non riesco ad avviare la registrazione su questo browser.", "warn");
return;
}
var rec = { recorder: recorder, stream: stream, chunks: [], startedAt: Date.now(), timer: null, discard: false };
state.recording = rec;
recorder.addEventListener("dataavailable", function (event) {
if (event.data && event.data.size) rec.chunks.push(event.data);
});
recorder.addEventListener("stop", finishRecording);
recorder.start();
recEl.hidden = false;
micBtn.classList.add("is-recording");
micBtn.setAttribute("aria-label", "Termina e invia la registrazione");
timerEl.textContent = "0:00";
rec.timer = setInterval(function () {
var seconds = Math.floor((Date.now() - rec.startedAt) / 1000);
timerEl.textContent = "0:" + String(seconds).padStart(2, "0");
if (seconds >= 20) stopRecording(true);
}, 250);
scrollLog(true);
})
.catch(function () {
showStatus("Per usare il microfono devi consentire l’accesso nella finestra del browser. Puoi sempre scrivere la domanda.", "warn");
});
}
function autosize() {
input.style.height = "auto";
input.style.height = Math.min(input.scrollHeight, 124) + "px";
}
function lockScroll() {
if (window.matchMedia("(max-width: 720px)").matches) document.documentElement.classList.add("maia-lock");
}
function unlockScroll() {
document.documentElement.classList.remove("maia-lock");
}
function setInert(on) {
Array.prototype.forEach.call(document.body.children, function (el) {
if (el === root || el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
if (on) {
el.dataset.maiaInert = "1";
el.inert = true;
} else if (el.dataset.maiaInert) {
el.inert = false;
delete el.dataset.maiaInert;
}
});
}
function openPanel() {
if (state.open) return;
state.open = true;
panel.hidden = false;
scrim.hidden = false;
requestAnimationFrame(function () {
panel.classList.add("is-open");
scrim.classList.add("is-open");
});
fab.setAttribute("aria-expanded", "true");
fab.classList.add("is-hidden");
setInert(true);
lockScroll();
setTimeout(function () {
input.focus({ preventScroll: true });
}, 140);
if (!state.welcomeDone) {
state.welcomeDone = true;
boot();
}
}
function closePanel() {
if (!state.open) return;
state.open = false;
panel.classList.remove("is-open");
scrim.classList.remove("is-open");
fab.setAttribute("aria-expanded", "false");
fab.classList.remove("is-hidden");
setInert(false);
unlockScroll();
stopAudio();
if (state.recording) stopRecording(false);
setTimeout(function () {
if (!state.open) {
panel.hidden = true;
scrim.hidden = true;
}
}, REDUCED ? 0 : 200);
fab.focus({ preventScroll: true });
}
function onTab(event) {
var focusables = Array.prototype.slice
.call(panel.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
.filter(function (el) {
return el.offsetParent !== null;
});
if (!focusables.length) return;
var first = focusables[0];
var last = focusables[focusables.length - 1];
if (event.shiftKey && document.activeElement === first) {
event.preventDefault();
last.focus();
} else if (!event.shiftKey && document.activeElement === last) {
event.preventDefault();
first.focus();
}
}
fab.addEventListener("click", openPanel);
scrim.addEventListener("click", closePanel);
$("[data-maia-close]").addEventListener("click", closePanel);
voiceBtn.addEventListener("click", function () {
if (state.speaking) {
stopAudio();
return;
}
setVoice(!state.voice);
});
$("[data-maia-stopaudio]").addEventListener("click", stopAudio);
$("[data-maia-reccancel]").addEventListener("click", function () {
stopRecording(false);
});
$("[data-maia-recstop]").addEventListener("click", function () {
stopRecording(true);
});
form.addEventListener("submit", function (event) {
event.preventDefault();
if (state.busy) {
if (state.streamController) state.streamController.abort();
return;
}
send(input.value);
});
input.addEventListener("input", function () {
autosize();
if (!state.busy) sendBtn.disabled = state.unavailable || !input.value.trim();
});
input.addEventListener("keydown", function (event) {
if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
event.preventDefault();
if (!state.busy) send(input.value);
}
});
micBtn.addEventListener("click", function () {
if (state.recording) stopRecording(true);
else startRecording();
});
document.addEventListener("keydown", function (event) {
if (!state.open) return;
if (event.key === "Escape") {
event.preventDefault();
closePanel();
} else if (event.key === "Tab") {
onTab(event);
}
});
document.addEventListener("click", function (event) {
var trigger = event.target && event.target.closest ? event.target.closest("[data-maia-open]") : null;
if (trigger && !root.contains(trigger)) openPanel();
});
window.addEventListener("resize", function () {
if (!state.open) return;
if (window.matchMedia("(max-width: 720px)").matches) lockScroll();
else unlockScroll();
});
setVoice(readVoice());
sendBtn.disabled = true;
setComposerEnabled(true);
sendBtn.disabled = true;
if (location.hash === "#maia" || location.hash === "#assistente") {
setTimeout(openPanel, 300);
}
window.addEventListener("hashchange", function () {
if (location.hash === "#maia" || location.hash === "#assistente") openPanel();
});
})();