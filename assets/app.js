const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

let state = { dreams: [], payments: [] };
let lastFocus = null;
const seenDreams = new Set();
const counters = {};
const counterGen = {};

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function dreamFieldError(name, price) {
  if (!String(name || "").trim()) return "Escribe un nombre.";
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount < 0.01) return "El precio debe ser un número mayor que 0.";
  return "";
}

function pace(left, iso) {
  const end = new Date(iso + "T00:00:00");
  const days = Math.max(1, Math.ceil((end - new Date()) / 86400000));
  return left <= 0 ? 0 : left / Math.max(1, days / 30.44);
}

function savedMap(payments) {
  const savedBy = {};
  payments.forEach((p) => { savedBy[p.dreamId] = (savedBy[p.dreamId] || 0) + Number(p.amount); });
  return savedBy;
}

function dreamLeft(dream, savedBy) {
  return Math.max(0, Number(dream.price) - (savedBy[dream.id] || 0));
}

function snapshotLeft() {
  const savedBy = savedMap(state.payments);
  const map = {};
  state.dreams.forEach((dream) => { map[dream.id] = dreamLeft(dream, savedBy); });
  return map;
}

async function persist() {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
  if (!res.ok) throw new Error("No se pudo guardar");
  document.getElementById("status").textContent = "Guardado en data/dreams.json y data/payments.json";
}

function countTo(id, target, format) {
  const el = document.getElementById(id);
  if (!el) return;
  const next = Number(target) || 0;
  counterGen[id] = (counterGen[id] || 0) + 1;
  const token = counterGen[id];
  const from = counters[id] ?? 0;
  counters[id] = next;
  if (prefersReduced() || Math.abs(next - from) < 0.005) {
    el.textContent = format(next);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    if (counterGen[id] !== token) return;
    const t = Math.min(1, (now - start) / 380);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(from + (next - from) * eased);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = format(next);
  };
  requestAnimationFrame(step);
}

function toast(message, tone = "success") {
  const toaster = document.getElementById("toaster");
  const el = document.createElement("div");
  el.className = "toast" + (tone === "danger" ? " toast-danger" : "");
  el.textContent = message;
  toaster.appendChild(el);
  while (toaster.children.length > 4) toaster.firstElementChild.remove();
  const remove = () => {
    el.classList.add("is-out");
    setTimeout(() => el.remove(), prefersReduced() ? 0 : 180);
  };
  setTimeout(remove, 3400);
}

function celebrate(name) {
  toast("Meta cumplida: " + name, "success");
  if (prefersReduced()) return;
  const root = document.getElementById("celebrate");
  root.hidden = false;
  root.replaceChildren();
  const badge = document.createElement("div");
  badge.className = "celebrate-badge";
  badge.textContent = "100%";
  root.appendChild(badge);
  for (let i = 0; i < 12; i += 1) {
    const dot = document.createElement("span");
    dot.style.setProperty("--angle", (i * 30) + "deg");
    dot.style.setProperty("--dist", (52 + (i % 3) * 16) + "px");
    if (i % 2) dot.style.background = "var(--warning)";
    root.appendChild(dot);
  }
  setTimeout(() => {
    root.hidden = true;
    root.replaceChildren();
  }, 420);
}

function fillBars() {
  document.querySelectorAll(".bar-fill").forEach((el) => {
    const width = (el.dataset.width || "0") + "%";
    if (prefersReduced()) {
      el.style.width = width;
      el.dataset.filled = width;
      return;
    }
    if (el.dataset.filled === width) return;
    const first = el.dataset.filled == null;
    el.dataset.filled = width;
    if (!first) {
      el.style.width = width;
      return;
    }
    el.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.width = width; });
    });
  });
}

function markInvalid(nameEl, priceEl, error) {
  const nameBad = !String(nameEl.value || "").trim();
  const amount = Number(priceEl.value);
  const priceBad = !Number.isFinite(amount) || amount < 0.01;
  nameEl.setAttribute("aria-invalid", error && nameBad ? "true" : "false");
  priceEl.setAttribute("aria-invalid", error && priceBad ? "true" : "false");
}

function renderDream(dream, index, savedBy) {
  const saved = savedBy[dream.id] || 0;
  const price = Number(dream.price);
  const left = Math.max(0, price - saved);
  const pct = price > 0 ? Math.min(100, Math.round((saved / price) * 100)) : 0;
  const complete = left <= 0 && price > 0;
  const end = new Date(dream.date + "T00:00:00");
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const overdue = !complete && !Number.isNaN(end.getTime()) && end < startToday;
  const pays = state.payments
    .filter((p) => p.dreamId === dream.id)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const history = pays.length
    ? `<ul>${pays.map((p) => `<li><span class="num">${esc(p.date)}</span><span class="history-amount"><span class="num income">${money(p.amount)}</span><button type="button" class="btn btn-danger btn-small" data-del="${esc(p.id)}" aria-label="Quitar abono del ${esc(p.date)} por ${money(p.amount)}">Quitar</button></span></li>`).join("")}</ul>`
    : `<p class="empty">Sin abonos todavía. Usa el formulario de arriba para agregar uno.</p>`;
  const entering = seenDreams.has(dream.id) ? "" : " enter";
  const chips = [
    complete ? `<span class="chip chip-success">Meta cumplida</span>` : "",
    overdue ? `<span class="chip chip-warning">Fecha vencida</span>` : ""
  ].join("");
  const paceLabel = complete ? "Estado" : "Ritmo";
  const paceValue = complete ? "Meta cumplida" : `${money(pace(left, dream.date))} / mes`;
  return `<article class="dream${entering}${complete ? " is-complete" : ""}" style="--i:${index}">
    <div class="dream-top">
      <div>
        <h3>${esc(dream.name)}</h3>
        <p class="meta">Meta ${money(dream.price)} · límite ${esc(dream.date)}</p>
      </div>
      <div class="dream-side">
        <p class="pct num">${pct}%</p>
        ${chips}
      </div>
    </div>
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Avance de ${esc(dream.name)}">
      <div class="bar-fill${complete ? " is-full" : ""}" data-width="${pct}"></div>
    </div>
    <dl class="metrics">
      <div class="metric"><dt>Ahorrado</dt><dd class="num income">${money(saved)}</dd></div>
      <div class="metric"><dt>Falta</dt><dd class="num">${money(left)}</dd></div>
      <div class="metric"><dt>${paceLabel}</dt><dd class="num">${paceValue}</dd></div>
    </dl>
    <div class="actions">
      <a class="btn btn-ghost" href="/api/report/${encodeURIComponent(dream.id)}">Reporte PDF</a>
      <button type="button" class="btn btn-ghost" data-edit-dream="${esc(dream.id)}">Editar</button>
      <button type="button" class="btn btn-danger" data-del-dream="${esc(dream.id)}">Eliminar</button>
    </div>
    <h4 class="history-title">Abonos</h4>
    ${history}
  </article>`;
}

function render() {
  const savedBy = savedMap(state.payments);
  const totalSaved = state.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalTarget = state.dreams.reduce((sum, dream) => sum + Number(dream.price), 0);
  const left = Math.max(0, totalTarget - totalSaved);
  const pct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  countTo("totalSaved", totalSaved, money);
  countTo("totalLeft", left, money);
  countTo("dreamCount", state.dreams.length, (n) => String(Math.round(n)));
  countTo("globalPct", pct, (n) => Math.round(n) + "%");
  const globalBar = document.getElementById("globalBar");
  globalBar.dataset.width = String(pct);
  globalBar.classList.toggle("is-full", pct >= 100 && totalTarget > 0);
  document.getElementById("globalBarTrack").setAttribute("aria-valuenow", String(pct));

  const select = document.getElementById("payDream");
  const selectedPay = select.value;
  select.innerHTML = state.dreams.length
    ? state.dreams.map((dream) => `<option value="${esc(dream.id)}">${esc(dream.name)}</option>`).join("")
    : `<option value="">Crea un dream primero</option>`;
  if (selectedPay && state.dreams.some((dream) => dream.id === selectedPay)) select.value = selectedPay;
  document.getElementById("paySubmit").disabled = state.dreams.length === 0;

  const note = document.getElementById("dreamNote");
  note.textContent = state.dreams.length === 1 ? "1 dream" : `${state.dreams.length} dreams`;
  const list = document.getElementById("list");
  list.innerHTML = state.dreams.length
    ? state.dreams.map((dream, index) => renderDream(dream, index, savedBy)).join("")
    : `<div class="empty-card"><p class="empty">Todavía no hay dreams. Si ya tienes archivos JSON, colócalos en la carpeta data y recarga.</p></div>`;
  state.dreams.forEach((dream) => seenDreams.add(dream.id));
  list.querySelectorAll(".enter").forEach((el) => {
    el.addEventListener("animationend", () => el.classList.remove("enter"), { once: true });
  });
  fillBars();
}

async function saveState(message) {
  const before = snapshotLeft();
  await persist();
  const savedBy = savedMap(state.payments);
  const finished = [];
  state.dreams.forEach((dream) => {
    const prev = before[dream.id];
    if (prev !== undefined && prev > 0 && dreamLeft(dream, savedBy) <= 0) finished.push(dream.name);
  });
  render();
  if (message) toast(message, "success");
  finished.forEach(celebrate);
}

function showSaveError(errorEl) {
  if (errorEl) {
    errorEl.hidden = false;
    errorEl.textContent = "No se pudo guardar. Intenta de nuevo.";
  }
  toast("No se pudo guardar. Intenta de nuevo.", "danger");
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function syncThemeButton() {
  const dark = currentTheme() === "dark";
  const button = document.getElementById("themeToggle");
  button.setAttribute("aria-pressed", String(dark));
  button.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
  document.getElementById("themeLabel").textContent = dark ? "Claro" : "Oscuro";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#0B1210" : "#F3F6F4");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("ahorro-theme", theme); } catch (err) { /* private mode */ }
  syncThemeButton();
}

const editDialog = document.getElementById("editDialog");

function focusEditButton(id) {
  const fresh = id ? document.querySelector(`[data-edit-dream="${CSS.escape(id)}"]`) : null;
  if (fresh) fresh.focus();
  else if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

function closeEdit() {
  if (!editDialog.open || editDialog.classList.contains("is-closing")) return;
  if (prefersReduced()) {
    editDialog.close();
    return;
  }
  editDialog.classList.add("is-closing");
  const modal = editDialog.querySelector(".modal");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    editDialog.classList.remove("is-closing");
    if (editDialog.open) editDialog.close();
  };
  modal.addEventListener("animationend", finish, { once: true });
  setTimeout(finish, 240);
}

function openEdit(dream, trigger) {
  lastFocus = trigger;
  editDialog.dataset.dreamId = dream.id;
  document.getElementById("editName").value = dream.name;
  document.getElementById("editPrice").value = dream.price;
  const errorEl = document.getElementById("editError");
  errorEl.hidden = true;
  errorEl.textContent = "";
  document.getElementById("editName").setAttribute("aria-invalid", "false");
  document.getElementById("editPrice").setAttribute("aria-invalid", "false");
  editDialog.classList.remove("is-closing");
  editDialog.showModal();
  document.getElementById("editName").focus();
}

document.getElementById("themeToggle").addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
});
syncThemeButton();

document.getElementById("payDate").value = today();

document.getElementById("dreamForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("dreamFormError");
  const nameEl = document.getElementById("dreamName");
  const priceEl = document.getElementById("dreamPrice");
  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const error = dreamFieldError(name, price);
  markInvalid(nameEl, priceEl, error);
  if (error) {
    errorEl.hidden = false;
    errorEl.textContent = error;
    return;
  }
  errorEl.hidden = true;
  const dream = {
    id: crypto.randomUUID(),
    name,
    price,
    date: document.getElementById("dreamDate").value
  };
  state.dreams.push(dream);
  try {
    await saveState("Dream creado");
  } catch (err) {
    state.dreams = state.dreams.filter((item) => item.id !== dream.id);
    render();
    showSaveError(errorEl);
    return;
  }
  event.target.reset();
  nameEl.setAttribute("aria-invalid", "false");
  priceEl.setAttribute("aria-invalid", "false");
});

document.getElementById("payForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const dreamId = document.getElementById("payDream").value;
  if (!dreamId) return;
  const payment = {
    id: crypto.randomUUID(),
    dreamId,
    amount: Number(document.getElementById("payAmount").value),
    date: document.getElementById("payDate").value
  };
  state.payments.push(payment);
  try {
    await saveState("Abono guardado");
  } catch (err) {
    state.payments = state.payments.filter((item) => item.id !== payment.id);
    render();
    showSaveError(null);
    return;
  }
  event.target.reset();
  document.getElementById("payDate").value = today();
});

document.getElementById("list").addEventListener("click", async (event) => {
  const delPay = event.target.closest("[data-del]");
  const delDream = event.target.closest("[data-del-dream]");
  const edit = event.target.closest("[data-edit-dream]");
  if (delPay) {
    const previous = state.payments;
    state.payments = state.payments.filter((payment) => payment.id !== delPay.dataset.del);
    try {
      await saveState("Abono eliminado");
    } catch (err) {
      state.payments = previous;
      render();
      showSaveError(null);
    }
    return;
  }
  if (delDream) {
    const id = delDream.dataset.delDream;
    const previousDreams = state.dreams;
    const previousPayments = state.payments;
    state.dreams = state.dreams.filter((dream) => dream.id !== id);
    state.payments = state.payments.filter((payment) => payment.dreamId !== id);
    try {
      await saveState("Dream eliminado");
    } catch (err) {
      state.dreams = previousDreams;
      state.payments = previousPayments;
      render();
      showSaveError(null);
    }
    document.getElementById("dreamsTitle").focus();
    return;
  }
  if (edit) {
    const dream = state.dreams.find((item) => item.id === edit.dataset.editDream);
    if (dream) openEdit(dream, edit);
  }
});

editDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeEdit();
});
editDialog.addEventListener("click", (event) => {
  if (event.target === editDialog) closeEdit();
});
editDialog.addEventListener("close", () => {
  const id = editDialog.dataset.dreamId || "";
  focusEditButton(id);
});
document.getElementById("editCancel").addEventListener("click", () => closeEdit());
document.getElementById("editForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = editDialog.dataset.dreamId;
  const nameEl = document.getElementById("editName");
  const priceEl = document.getElementById("editPrice");
  const errorEl = document.getElementById("editError");
  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const error = dreamFieldError(name, price);
  markInvalid(nameEl, priceEl, error);
  if (error) {
    errorEl.hidden = false;
    errorEl.textContent = error;
    return;
  }
  const dream = state.dreams.find((item) => item.id === id);
  if (!dream) {
    closeEdit();
    return;
  }
  const previous = { name: dream.name, price: dream.price };
  dream.name = name;
  dream.price = price;
  try {
    await saveState("Cambios guardados");
  } catch (err) {
    dream.name = previous.name;
    dream.price = previous.price;
    showSaveError(errorEl);
    return;
  }
  closeEdit();
});

fetch("/api/data").then((res) => {
  if (!res.ok) throw new Error("bad");
  return res.json();
}).then((data) => {
  state = { dreams: data.dreams || [], payments: data.payments || [] };
  document.getElementById("status").textContent = "Datos leídos desde data/dreams.json y data/payments.json";
  render();
}).catch(() => {
  document.getElementById("status").textContent = "No pude leer los JSON. Abre esta página desde el servidor, no como archivo suelto.";
});
