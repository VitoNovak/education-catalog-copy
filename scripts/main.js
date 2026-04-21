:root{--primary-blue:#1E63F0;--light-blue:#f2f6ff;--text-dark:#1a1a1a;}
*{box-sizing:border-box}
body{font-family:"Segoe UI",Roboto,Arial,sans-serif;margin:0;background:var(--light-blue);color:var(--text-dark)}
header{background:#fff;box-shadow:0 2px 6px rgba(30,99,240,.15);padding:1.5rem 1rem;position:sticky;top:0;z-index:10}
h1{margin:0 0 1rem;color:var(--primary-blue);text-align:center}

/* ============================
   БЛОК ВЫБОРА РЕГИОНА
   ============================ */
.region-selector {
  max-width: 960px;
  margin: 0 auto 1rem;
}

/* --- Поиск по регионам --- */
.region-search-wrap {
  position: relative;
  margin-bottom: .75rem;
}
.region-search-icon {
  position: absolute;
  left: .85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: .95rem;
  pointer-events: none;
  opacity: .5;
}
.region-search-input {
  width: 100%;
  padding: .6rem 2.5rem .6rem 2.4rem;
  border: 2px solid #d0dcf7;
  border-radius: 999px;
  font-size: .95rem;
  color: var(--text-dark);
  background: #f7f9ff;
  transition: border-color .2s, box-shadow .2s;
}
.region-search-input:focus {
  outline: 0;
  border-color: var(--primary-blue);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(30,99,240,.12);
}
.region-search-input::placeholder { color: #9aabcf; }
.region-search-clear {
  position: absolute;
  right: .7rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #9aabcf;
  font-size: 1rem;
  cursor: pointer;
  padding: .2rem .4rem;
  border-radius: 50%;
  line-height: 1;
  transition: color .15s, background .15s;
}
.region-search-clear:hover { color: var(--primary-blue); background: rgba(30,99,240,.08); }

/* --- Кнопки регионов --- */
.region-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  justify-content: center;
  margin-bottom: .6rem;
  /* Коллапс: скрываем лишние через .collapsed */
}

/* Скрытые кнопки в свёрнутом состоянии */
.region-buttons.collapsed .region-button.region-hidden {
  display: none;
}

.region-button {
  border: 2px solid var(--primary-blue);
  background: #fff;
  color: var(--primary-blue);
  padding: .5rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  transition: background .18s, color .18s, box-shadow .18s, transform .1s;
}
.region-button.active,
.region-button:hover,
.region-button:focus {
  background: var(--primary-blue);
  color: #fff;
  outline: 0;
  box-shadow: 0 0 0 4px rgba(30,99,240,.15);
}
.region-button:active { transform: scale(.97); }

/* Подсветка совпадения при поиске */
.region-button mark {
  background: #ffe066;
  color: var(--text-dark);
  border-radius: 2px;
  padding: 0 1px;
}

/* --- Кнопка "Показать все" --- */
.region-toggle-wrap {
  text-align: center;
  margin-top: .25rem;
}
.region-toggle-btn {
  border: none;
  background: none;
  color: var(--primary-blue);
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  padding: .4rem .8rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  transition: background .15s;
}
.region-toggle-btn:hover { background: rgba(30,99,240,.07); }
.region-toggle-count {
  background: rgba(30,99,240,.12);
  color: var(--primary-blue);
  border-radius: 999px;
  padding: .05rem .55rem;
  font-size: .8rem;
  font-weight: 700;
}
.region-toggle-arrow {
  font-size: .75rem;
  transition: transform .22s;
  display: inline-block;
}
.region-toggle-btn[aria-expanded="true"] .region-toggle-arrow {
  transform: rotate(180deg);
}

/* --- Нет результатов поиска --- */
.region-no-results {
  text-align: center;
  color: #9aabcf;
  font-size: .9rem;
  padding: .4rem 0;
}

/* Поиск */
.search-container{max-width:960px;margin:0 auto}
.search-container label{display:block;font-weight:600;margin-bottom:.5rem;color:var(--primary-blue)}
.search-input{width:100%;padding:.75rem 1rem;border:2px solid var(--primary-blue);border-radius:12px;font-size:1rem}
.search-input:focus{outline:0;box-shadow:0 0 0 4px rgba(30,99,240,.15)}

main{max-width:1200px;margin:0 auto;padding:2rem 1rem 3rem}

/* ===== ДЕСКТОП ===== */
table.catalog{
  width:100%;
  border-collapse:collapse;
  background:#fff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 10px 30px rgba(30,99,240,.12);
  table-layout:fixed;
}
thead{background:var(--primary-blue);color:#fff}
th,td{padding:1.25rem 1rem;vertical-align:top;text-align:left}

.catalog th:nth-child(1), .catalog td:nth-child(1){width:60px;text-align:center;font-weight:600}
.catalog th:nth-child(2), .catalog td:nth-child(2){width:40%}
.catalog th:nth-child(3), .catalog td:nth-child(3){width:60%}

tbody tr:nth-child(even){background:rgba(30,99,240,.04)}
tbody tr:hover{background:rgba(30,99,240,.08)}

.institution-name{font-size:1.05rem;font-weight:700;margin-bottom:.75rem}
.contact-list{margin:0;padding:0;list-style:none}
.contact-list li{margin-bottom:.35rem;line-height:1.4}
a{color:var(--primary-blue);text-decoration:none;font-weight:600}
a:hover,a:focus{text-decoration:underline}
.specializations{margin:0;padding-left:1.1rem}
.empty-state{text-align:center;padding:2rem;color:#4a4a4a}

.table-subhead th{padding:.9rem 1rem;background:var(--primary-blue);color:#fff;font-weight:700}
.table-subhead th:first-child{border-top-left-radius:10px;border-bottom-left-radius:10px;width:60px;text-align:center}
.table-subhead th:last-child{border-top-right-radius:10px;border-bottom-right-radius:10px}

.contact-list a, .specializations li{word-break:break-word;overflow-wrap:anywhere}

/* ===== МОБИЛЬНАЯ ВЕРСТКА ===== */
@media (max-width: 768px) {
  .catalog{display:block;overflow-x:hidden;-webkit-overflow-scrolling:touch;border-radius:12px;background:#fff;table-layout:auto}
  .catalog thead{display:none}
  .catalog th, .catalog td{width:100% !important}
  .catalog tbody, .catalog tr, .catalog td{display:block;width:100%}
  .catalog tbody tr{
    margin-bottom:1rem;
    border:1px solid rgba(30,99,240,.12);
    border-radius:12px;
    overflow:hidden;
    background:#fff;
  }
  .catalog td{display:block;padding:.9rem 1rem}
  .catalog td::before{
    content:attr(data-label);
    display:block;
    margin-bottom:.5rem;
    font-weight:700;
    color:var(--primary-blue);
  }
  .catalog td:nth-child(1){
    font-size:1.05rem;
    background:rgba(30,99,240,.04);
    padding:.6rem 1rem;
  }
  .table-subhead{display:block;margin:0 0 .5rem;border-radius:10px;overflow:hidden}
  .table-subhead th{display:block;padding:.7rem .9rem;background:var(--primary-blue);color:#fff;font-weight:700}
}

@media (max-width: 420px){
  .catalog td{padding:.7rem .8rem}
  .catalog td::before{margin-bottom:.4rem;font-size:.95rem}
}
