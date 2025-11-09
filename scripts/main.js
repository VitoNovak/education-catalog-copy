// scripts/main.js — с автоматической пометкой уровней по коду
const DEFAULT_REGION = "Пермский край";
const tableBody = document.getElementById("institutions-body");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const regionBtns = Array.from(document.querySelectorAll(".region-button"));

function norm(s) { return (s ?? "").toString().toLowerCase(); }

function highlight(text, qRaw) {
  const src = (text ?? "").toString();
  const q = (qRaw ?? "").toString().trim();
  if (!q) return src;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(safe, "gi");
  return src.replace(re, m => `<mark>${m}</mark>`);
}

function regions() {
  return Object.keys(window.catalogData || {}).sort((a, b) => a.localeCompare(b, "ru"));
}

function setActive(name) {
  regionBtns.forEach(b => b.classList.toggle("active", b.dataset.region === name));
}

function pickInitialRegion() {
  const btnActive = document.querySelector(".region-button.active");
  if (btnActive) return btnActive.dataset.region;
  const keys = regions();
  if (keys.includes(DEFAULT_REGION)) return DEFAULT_REGION;
  if (keys.length) return keys[0];
  if (regionBtns.length) return regionBtns[0].dataset.region;
  return "";
}

let currentRegion = pickInitialRegion();
setActive(currentRegion);

// === НОВАЯ ФУНКЦИЯ: Определяем уровень по коду ===
function getLevelByCode(code) {
  if (!code) return null;
  const c = code.trim();

  // СПО — .02.
  if (c.includes(".02.")) return "Среднее профильное образование (СПО)";

  // Бакалавриат — .03.
  if (c.match(/\.(03|03)\./)) return "Бакалавриат";

  // Магистратура — .04.
  if (c.match(/\.(04|04)\./)) return "Магистратура";

  // Специалитет — .05.
  if (c.includes(".05.")) return "Специалитет";

  // Аспирантура — начинается с 1. 4. 5. 6.
  if (/^[1-6]\./.test(c)) return "Аспирантура";

  return null; // если не распозналось — просто покажем как есть
}

// === Рендер с группировкой по уровням ===
function render() {
  const qRaw = (searchInput?.value || "").trim();
  const q = qRaw.toLowerCase();
  const data = Array.isArray(window.catalogData?.[currentRegion]) ? window.catalogData[currentRegion] : [];
  tableBody.innerHTML = "";
  
  const filtered = data.filter(item => {
    if (item.type === "heading") return q === "";
    if (item.level && Array.isArray(item.programs)) {
      if (!q) return true;
      if (norm(item.level).includes(q)) return true;
      return item.programs.some(p => norm(p.code).includes(q) || norm(p.title).includes(q));
    }
    if (!q) return true;
    const byNum = norm(item.number).includes(q);
    const byName = norm(item.name).includes(q);
    const byDirs = Array.isArray(item.directions) && item.directions.some(d => norm(d.code).includes(q) || norm(d.title).includes(q));
    return byNum || byName || byDirs;
  });

  if (filtered.length === 0) { emptyState.hidden = false; return; }
  emptyState.hidden = true;

  filtered.forEach((item) => {
    if (item.type === "heading") {
      const tr = document.createElement("tr");
      tr.className = "table-subhead";
      tr.innerHTML = `<th scope="col">№</th><th scope="col">${item.title}</th><th scope="col">Направления подготовки Номер / наименование специальности</th>`;
      tableBody.appendChild(tr);
      return;
    }

    if (item.level && Array.isArray(item.programs)) {
      // старый формат блоков — оставляем как есть
      const sub = document.createElement("tr");
      sub.className = "table-subhead";
      sub.innerHTML = `<th scope="col">№</th><th scope="col">${highlight(item.level, qRaw)}</th><th scope="col">Программы</th>`;
      tableBody.appendChild(sub);
      const row = document.createElement("tr");
      const td1 = document.createElement("td"); td1.innerHTML = "";
      const td2 = document.createElement("td"); td2.innerHTML = "";
      const td3 = document.createElement("td");
      const ul = document.createElement("ul"); ul.className = "specializations";
      item.programs.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `${p.code ? `<strong>${highlight(p.code, qRaw)}</strong> ` : ""}${highlight(p.title || "", qRaw)}`;
        ul.appendChild(li);
      });
      td3.appendChild(ul);
      row.append(td1, td2, td3);
      tableBody.appendChild(row);
      return;
    }

    // === ОСНОВНАЯ ЗАПИСЬ С АВТО-УРОВНЯМИ ===
    const row = document.createElement("tr");

    const tdNum = document.createElement("td");
    tdNum.setAttribute("data-label", "№");
    tdNum.innerHTML = highlight(item.number ?? "", qRaw);

    const tdInfo = document.createElement("td");
    tdInfo.setAttribute("data-label", "Каталог специальностей и профессионального образования");
    tdInfo.innerHTML = `
      <div class="institution-name">${highlight(item.name || "", qRaw)}</div>
      <ul class="contact-list">
        ${item.site || item.website ? `<li><strong>Сайт:</strong> <a href="${item.site || item.website}" target="_blank" rel="noopener">${highlight(item.site || item.website, qRaw)}</a></li>` : ""}
        ${item.group || item.vk ? `<li><strong>Группа VK:</strong> <a href="${item.group || item.vk}" target="_blank" rel="noopener">${highlight(item.group || item.vk, qRaw)}</a></li>` : ""}
        ${item.address ? `<li><strong>Адрес:</strong> ${highlight(item.address, qRaw)}</li>` : ""}
        ${item.tel || item.phone ? `<li><strong>Тел.:</strong> ${highlight(item.tel || item.phone, qRaw)}</li>` : ""}
        ${item.email ? `<li><strong>E-mail:</strong> <a href="mailto:${item.email}">${highlight(item.email, qRaw)}</a></li>` : ""}
      </ul>
    `;

    const tdDirs = document.createElement("td");
    tdDirs.setAttribute("data-label", "Направления подготовки Номер / наименование специальности");

    // Группируем по уровням
    const levelsMap = {};
    (item.directions || []).forEach(d => {
      const level = getLevelByCode(d.code) || "Другое";
      if (!levelsMap[level]) levelsMap[level] = [];
      levelsMap[level].push(d);
    });

    // Если уровни не распознались — показываем как было
    if (Object.keys(levelsMap).length === 1 && levelsMap["Другое"]) {
      const ul = document.createElement("ul");
      ul.className = "specializations";
      item.directions.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${highlight(d.code || "", qRaw)}</strong> ${highlight(d.title || "", qRaw)}`;
        ul.appendChild(li);
      });
      tdDirs.appendChild(ul);
    } else {
      // С группировкой
      Object.keys(levelsMap).sort().forEach(level => {
        if (level === "Другое") return; // пропускаем, если есть нормальные уровни
        const strong = document.createElement("strong");
        strong.textContent = level + ":";
        tdDirs.appendChild(strong);
        const ul = document.createElement("ul");
        ul.className = "specializations";
        levelsMap[level].forEach(d => {
          const li = document.createElement("li");
          li.innerHTML = `• <strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
          ul.appendChild(li);
        });
        tdDirs.appendChild(ul);
      });

      // Если остались "Другое" — добавим в конец
      if (levelsMap["Другое"]) {
        const ul = document.createElement("ul");
        ul.className = "specializations";
        levelsMap["Другое"].forEach(d => {
          const li = document.createElement("li");
          li.innerHTML = `• <strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
          ul.appendChild(li);
        });
        tdDirs.appendChild(ul);
      }
    }

    row.append(tdNum, tdInfo, tdDirs);
    tableBody.appendChild(row);
  });
}

function debounce(fn, ms) { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
const onSearch = debounce(render, 120);
searchInput && searchInput.addEventListener("input", onSearch);

regionBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.region;
    if (!name) return;
    currentRegion = name;
    setActive(name);
    render();
  });
});

(function ensureButtons() {
  if (document.querySelectorAll(".region-button").length) return;
  const box = document.querySelector(".region-buttons"); if (!box) return;
  regions().forEach(r => {
    const b = document.createElement("button");
    b.className = "region-button"; b.dataset.region = r; b.textContent = r;
    b.addEventListener("click", () => { currentRegion = r; setActive(r); render(); });
    box.appendChild(b);
  });
})();

(function init() {
  const keys = regions();
  if (keys.includes(DEFAULT_REGION)) currentRegion = DEFAULT_REGION;
  else if (!currentRegion) currentRegion = keys[0] || regionBtns[0]?.dataset.region || "";
  setActive(currentRegion);
  render();
})();
