// scripts/main.js — группировка по уровням + поиск по регионам
const DEFAULT_REGION = "Пермский край";

const tableBody = document.getElementById("institutions-body");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const regionBtns = Array.from(document.querySelectorAll(".region-button"));

function norm(s) {
  return (s ?? "").toString().toLowerCase().trim();
}

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

// === Определяем уровень по коду ===
function getLevelByCode(code) {
  if (!code) return null;
  const c = code.trim();
  if (c.includes(".02.")) return "СПО";
  if (c.match(/\.(03|04)\./)) return "Бакалавриат";
  if (c.includes(".05.")) return "Специалитет";
  if (c.match(/\.(04)\./) && c.includes("магистр")) return "Магистратура"; // для магистратуры
  if (/^[1-6]\./.test(c)) return "Аспирантура";
  if (c.includes(".08.")) return "Ординатура";
  return null;
}

// Основная функция отрисовки
function render() {
  const qRaw = (searchInput?.value || "").trim();
  const q = norm(qRaw);

  tableBody.innerHTML = "";

  let allItems = [];

  // Если запрос пустой — показываем только текущий регион
  if (!q) {
    const data = Array.isArray(window.catalogData?.[currentRegion]) 
      ? window.catalogData[currentRegion] 
      : [];
    allItems = data.map(item => ({ ...item, region: currentRegion }));
  } 
  // Если есть запрос — ищем по всем регионам
  else {
    Object.keys(window.catalogData || {}).forEach(regionName => {
      const regionNorm = norm(regionName);

      // Если запрос совпадает с названием региона — берём весь регион
      if (regionNorm.includes(q)) {
        const data = window.catalogData[regionName] || [];
        allItems = allItems.concat(data.map(item => ({ ...item, region: regionName })));
        return;
      }

      // Иначе ищем внутри учреждений региона
      const data = Array.isArray(window.catalogData[regionName]) 
        ? window.catalogData[regionName] 
        : [];

      const found = data.filter(item => {
        if (!item.name) return false;

        const byName = norm(item.name).includes(q);
        const byNum = norm(item.number).includes(q);
        const byDirs = Array.isArray(item.directions) && 
                       item.directions.some(d => 
                         norm(d.code).includes(q) || norm(d.title).includes(q)
                       );

        return byName || byNum || byDirs;
      });

      if (found.length > 0) {
        allItems = allItems.concat(found.map(item => ({ ...item, region: regionName })));
      }
    });
  }

  if (allItems.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  // Отрисовка всех найденных элементов
  allItems.forEach(item => {
    const row = document.createElement("tr");

    // Номер
    const tdNum = document.createElement("td");
    tdNum.setAttribute("data-label", "№");
    tdNum.innerHTML = highlight(item.number ?? "", qRaw);

    // Информация об учреждении
    const tdInfo = document.createElement("td");
    tdInfo.setAttribute("data-label", "Учебное заведение");
    tdInfo.innerHTML = `
      <div class="institution-name">${highlight(item.name || "", qRaw)}</div>
      <ul class="contact-list">
        ${item.website ? `<li><strong>Сайт:</strong> <a href="${item.website}" target="_blank">${highlight(item.website, qRaw)}</a></li>` : ""}
        ${item.vk ? `<li><strong>Группа ВК:</strong> <a href="${item.vk}" target="_blank">${highlight(item.vk, qRaw)}</a></li>` : ""}
        ${item.address ? `<li><strong>Адрес:</strong> ${highlight(item.address, qRaw)}</li>` : ""}
        ${item.phone ? `<li><strong>Тел.:</strong> ${highlight(item.phone, qRaw)}</li>` : ""}
        ${item.email ? `<li><strong>E-mail:</strong> <a href="mailto:${item.email}">${highlight(item.email, qRaw)}</a></li>` : ""}
      </ul>
    `;

    // Направления подготовки
    const tdDirs = document.createElement("td");
    tdDirs.setAttribute("data-label", "Направления подготовки");

    const levelsMap = {};
    (item.directions || []).forEach(d => {
      const level = getLevelByCode(d.code) || "СПО";
      if (!levelsMap[level]) levelsMap[level] = [];
      levelsMap[level].push(d);
    });

    const order = ["Бакалавриат", "Специалитет", "Магистратура", "Аспирантура", "Ординатура"];

    order.forEach(l => {
      if (levelsMap[l]) {
        const strong = document.createElement("strong");
        strong.textContent = l + ":";
        tdDirs.appendChild(strong);
        tdDirs.appendChild(document.createElement("br"));

        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.paddingLeft = "0";
        ul.style.margin = "4px 0";

        levelsMap[l].forEach(d => {
          const li = document.createElement("li");
          li.style.marginBottom = "6px";
          li.innerHTML = `<strong>${highlight(d.code || "", qRaw)}</strong> ${highlight(d.title || "", qRaw)}`;
          ul.appendChild(li);
        });
        tdDirs.appendChild(ul);
      }
    });

    // СПО без заголовка (если только СПО)
    if (levelsMap["СПО"] && Object.keys(levelsMap).length === 1) {
      const ul = document.createElement("ul");
      ul.style.listStyle = "none";
      ul.style.paddingLeft = "0";
      ul.style.margin = "4px 0";

      levelsMap["СПО"].forEach(d => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.innerHTML = `<strong>${highlight(d.code || "", qRaw)}</strong> ${highlight(d.title || "", qRaw)}`;
        ul.appendChild(li);
      });
      tdDirs.appendChild(ul);
    }

    row.append(tdNum, tdInfo, tdDirs);
    tableBody.appendChild(row);
  });
}

// Дебounce для поиска
function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

const onSearch = debounce(render, 150);

if (searchInput) {
  searchInput.addEventListener("input", onSearch);
}

// Клик по кнопкам регионов
regionBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.region;
    if (!name) return;
    currentRegion = name;
    setActive(name);
    render();
  });
});

// Инициализация
(function init() {
  const keys = regions();
  if (keys.includes(DEFAULT_REGION)) currentRegion = DEFAULT_REGION;
  else if (!currentRegion && keys.length) currentRegion = keys[0];
  else if (!currentRegion && regionBtns.length) currentRegion = regionBtns[0].dataset.region;

  setActive(currentRegion);
  render();
})();
