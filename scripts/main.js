// scripts/main.js
const DEFAULT_REGION = "Пермский край";
const VISIBLE_REGIONS = 8;

const tableBody = document.getElementById("institutions-body");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");

let regionBtns = [];

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

let currentRegion = "";

function getLevelByCode(code) {
  if (!code) return null;
  const c = code.trim();
  if (c.includes(".02.")) return "СПО";
  if (c.match(/\.(03|04)\./)) return "Бакалавриат";
  if (c.includes(".05.")) return "Специалитет";
  if (/^[1-6]\./.test(c)) return "Аспирантура";
  if (c.includes(".08.")) return "Ординатура";
  if (c.includes(".09.")) return "Ассистентура";
  return null;
}

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
      const sub = document.createElement("tr");
      sub.className = "table-subhead";
      sub.innerHTML = `<th scope="col">№</th><th scope="col">${highlight(item.level, qRaw)}</th><th scope="col">Программы</th>`;
      tableBody.appendChild(sub);

      const row = document.createElement("tr");
      const td1 = document.createElement("td"); td1.innerHTML = "";
      const td2 = document.createElement("td"); td2.innerHTML = "";
      const td3 = document.createElement("td");
      const ul = document.createElement("ul");
      ul.style.listStyle = "none";
      ul.style.paddingLeft = "0";
      ul.style.margin = "0";

      item.programs.forEach(p => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.innerHTML = `${p.code ? `<strong>${highlight(p.code, qRaw)}</strong> ` : ""}${highlight(p.title || "", qRaw)}`;
        ul.appendChild(li);
      });
      td3.appendChild(ul);
      row.append(td1, td2, td3);
      tableBody.appendChild(row);
      return;
    }

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

    const levelsMap = {};
    let hasHigher = false;

    (item.directions || []).forEach(d => {
      let level = getLevelByCode(d.code);
      if (level === "СПО") {
        if (hasHigher) level = "Среднее профильное образование";
        else level = null;
      } else if (level) {
        hasHigher = true;
      } else {
        level = "Другое";
      }
      if (!levelsMap[level]) levelsMap[level] = [];
      levelsMap[level].push(d);
    });

    const order = ["Бакалавриат", "Специалитет", "Магистратура", "Аспирантура", "Ординатура", "Ассистентура"];
    let rendered = false;

    order.forEach(l => {
      if (levelsMap[l]) {
        rendered = true;
        const strong = document.createElement("strong");
        strong.textContent = l + ":";
        tdDirs.appendChild(strong);
        tdDirs.appendChild(document.createElement("br"));
        const ul = document.createElement("ul");
        ul.style.listStyle = "none"; ul.style.paddingLeft = "0"; ul.style.margin = "4px 0";
        levelsMap[l].forEach(d => {
          const li = document.createElement("li");
          li.style.marginBottom = "6px";
          li.innerHTML = `<strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
          ul.appendChild(li);
        });
        tdDirs.appendChild(ul);
      }
    });

    if (levelsMap["Среднее профильное образование"]) {
      rendered = true;
      const strong = document.createElement("strong");
      strong.textContent = "Среднее профильное образование:";
      tdDirs.appendChild(strong);
      tdDirs.appendChild(document.createElement("br"));
      const ul = document.createElement("ul");
      ul.style.listStyle = "none"; ul.style.paddingLeft = "0"; ul.style.margin = "4px 0";
      levelsMap["Среднее профильное образование"].forEach(d => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.innerHTML = `<strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
        ul.appendChild(li);
      });
      tdDirs.appendChild(ul);
    } else if (levelsMap[null]) {
      rendered = true;
      const ul = document.createElement("ul");
      ul.style.listStyle = "none"; ul.style.paddingLeft = "0"; ul.style.margin = "4px 0";
      levelsMap[null].forEach(d => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.innerHTML = `<strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
        ul.appendChild(li);
      });
      tdDirs.appendChild(ul);
    }

    if (levelsMap["Другое"]) {
      rendered = true;
      const ul = document.createElement("ul");
      ul.style.listStyle = "none"; ul.style.paddingLeft = "0"; ul.style.margin = "4px 0";
      levelsMap["Другое"].forEach(d => {
        const li = document.createElement("li");
        li.style.marginBottom = "6px";
        li.innerHTML = `<strong>${highlight(d.code, qRaw)}</strong> ${highlight(d.title, qRaw)}`;
        ul.appendChild(li);
      });
      tdDirs.appendChild(ul);
    }

    if (!rendered) {
      const ul = document.createElement("ul");
      ul.style.listStyle = "none"; ul.style.paddingLeft = "0"; ul.style.margin = "4px 0";
      item.directions.forEach(d => {
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

function debounce(fn, ms) { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// =============================================
//  ВСЁ ЗАПУСКАЕТСЯ ПОСЛЕ ЗАГРУЗКИ DOM
// =============================================
document.addEventListener("DOMContentLoaded", function () {

  regionBtns = Array.from(document.querySelectorAll(".region-button"));

  regionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.region;
      if (!name) return;
      currentRegion = name;
      setActive(name);
      render();
    });
  });

  const onSearch = debounce(render, 120);
  searchInput && searchInput.addEventListener("input", onSearch);

  currentRegion = pickInitialRegion();
  setActive(currentRegion);

  // =============================================
  //  ПОИСК ПО РЕГИОНАМ + ПОКАЗАТЬ ВСЕ
  // =============================================
  const regionList   = document.getElementById("region-buttons-list");
  const toggleBtn    = document.getElementById("region-toggle-btn");
  const toggleWrap   = document.getElementById("region-toggle-wrap");
  const countBadge   = document.getElementById("region-toggle-count");
  const noResults    = document.getElementById("region-no-results");
  const regionSearch = document.getElementById("region-search");
  const regionClear  = document.getElementById("region-search-clear");

  if (regionList && toggleBtn) {
    const allBtns     = Array.from(regionList.querySelectorAll(".region-button"));
    const hiddenCount = Math.max(0, allBtns.length - VISIBLE_REGIONS);
    let isExpanded    = false;
    let searchQuery   = "";

    allBtns.forEach((btn, i) => {
      if (i >= VISIBLE_REGIONS) btn.classList.add("region-hidden");
    });

    if (hiddenCount > 0) {
      countBadge.textContent = "ещё " + hiddenCount;
      regionList.classList.add("collapsed");
    } else {
      toggleWrap.hidden = true;
    }

    toggleBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;
      toggleBtn.setAttribute("aria-expanded", String(isExpanded));
      if (isExpanded) {
        regionList.classList.remove("collapsed");
        countBadge.textContent = "";
        toggleBtn.firstChild.textContent = "Скрыть ";
      } else {
        regionList.classList.add("collapsed");
        countBadge.textContent = "ещё " + hiddenCount;
        toggleBtn.firstChild.textContent = "Показать все регионы ";
      }
      if (!isExpanded && regionSearch) {
        regionSearch.value = "";
        searchQuery = "";
        if (regionClear) regionClear.hidden = true;
        applySearch();
      }
    });

    function applySearch() {
      const q = norm(searchQuery);
      let found = 0;

      allBtns.forEach(btn => {
        const name = btn.dataset.region || "";
        const match = !q || norm(name).includes(q);

        if (q && match) {
          const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          btn.innerHTML = name.replace(new RegExp(safe, "gi"), m => `<mark>${m}</mark>`);
        } else {
          btn.textContent = name;
        }

        btn.style.display = q ? (match ? "" : "none") : "";
        if (q && match) found++;
      });

      if (noResults) noResults.hidden = !(q && found === 0);

      if (toggleWrap) {
        if (q) {
          toggleWrap.hidden = true;
          regionList.classList.remove("collapsed");
        } else {
          toggleWrap.hidden = hiddenCount <= 0;
          regionList.classList.toggle("collapsed", !isExpanded);
        }
      }
    }

    if (regionSearch) {
      regionSearch.addEventListener("input", () => {
        searchQuery = regionSearch.value.trim();
        if (regionClear) regionClear.hidden = !searchQuery;
        applySearch();
      });
    }

    if (regionClear) {
      regionClear.addEventListener("click", () => {
        regionSearch.value = "";
        searchQuery = "";
        regionClear.hidden = true;
        regionSearch.focus();
        applySearch();
      });
    }
  }

  render();
});
