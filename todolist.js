function openTab(evt, tabName) {
  const panels = document.getElementsByClassName("panel");
  for (let i = 0; i < panels.length; i++) {
    panels[i].style.display = "none";
    panels[i].classList.remove("active");
  }

  const tabBtns = document.querySelectorAll(".tab-btn, .dropdown-item, .nav-item-dropdown, .dropdown-content button");
  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].classList.remove("active");
  }

  const selectedPanel = document.getElementById("panel-" + tabName);
  if (selectedPanel) {
    selectedPanel.style.display = "block";
    selectedPanel.classList.add("active");
  }

  // Logika class active pada tombol
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
    const parentDropdown = evt.currentTarget.closest('.dropdown');
      if (parentDropdown) {
        const toggleBtn = parentDropdown.querySelector('.nav-item-dropdown');
        if (toggleBtn) toggleBtn.classList.add("active");
      }
  } else {
    const mainBtn = document.querySelector('.nav-item-dropdown');
    if (mainBtn) mainBtn.classList.add("active");
  }
}

// STATE DATA
const state = {
  shalat: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
  quran: { target: 0, dibaca: 0, targetKhatam: 0, dibacaTotal: 0 },
  puasa: Array(31).fill(false)
};

// STORAGE & TOAST
function loadState() {
  try {
    const s = localStorage.getItem('rmdn2025');
    if (s) { const d = JSON.parse(s); Object.assign(state, d); }
  } catch (e) { }
}

function saveState() {
  try { localStorage.setItem('rmdn2025', JSON.stringify(state)); } catch (e) { }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// PROGRESS
function updateOverall() {
  const shalatPct = Object.values(state.shalat).filter(Boolean).length / 5 * 100;
  const quranPct = state.quran.target > 0 ? Math.min(state.quran.dibaca / state.quran.target * 100, 100) : 0;
  const hariKe = getRamadhanHari();
  const puasaPct = hariKe > 0 ? state.puasa.filter(Boolean).length / Math.min(hariKe, 30) * 100 : 0;

  const total = (shalatPct + quranPct + puasaPct) / 3;

  document.getElementById('overallFill').style.width = total + '%';
  document.getElementById('overallPct').textContent = Math.round(total) + '%';

  const msgs = [[0, 'Bismillah mulai!'], [33, 'Langkah pertama!'], [66, 'Terus semangat!'], [100, 'MasyaAllah! Luar biasa!']];
  let mot = msgs[0][1];
  for (const [th, m] of msgs) { if (total >= th) mot = m; }
  document.getElementById('overallMotivasi').textContent = mot;
}

// SHALAT
function toggleShalat(el, key) {
  state.shalat[key] = !state.shalat[key];
  el.classList.toggle('checked', state.shalat[key]);
  updateShalat(); updateOverall();
}

function updateShalat() {
  const done = Object.values(state.shalat).filter(Boolean).length;
  const pct = done / 5 * 100;
  document.getElementById('shalatFill').style.width = pct + '%';
  document.getElementById('shalatPctLabel').textContent = done + ' / 5';
    
  const el = document.getElementById('shalatStatus');
    if (pct <= 40) { 
      el.className = 'status-text status-warn'; 
      el.textContent = 'Belum optimal'; 
    }
    else if (pct < 100) { 
      el.className = 'status-text status-mid'; 
      el.textContent = 'Cukup baik'; 
    }
    else { 
      el.className = 'status-text status-good'; 
      el.textContent = 'MasyaAllah lengkap!'; 
    }
}

// RESET SHALAT
function resetShalat() {
    if (confirm("Apakah Anda yakin ingin mereset semua checklist shalat hari ini?")) {
        state.shalat = { 
            subuh: false, 
            dzuhur: false, 
            ashar: false, 
            maghrib: false, 
            isya: false 
        };
        saveState();
        restoreShalat();
        updateShalat();
        updateOverall();
        showToast('Checklist shalat telah dibersihkan');
    }
}

function restoreShalat() {
    const items = document.querySelectorAll('#shalatList .shalat-item');
    const keys = Object.keys(state.shalat);
    items.forEach((el, i) => {
        el.classList.toggle('checked', state.shalat[keys[i]]);
    });
    updateShalat();
}
function saveShalat() { saveState(); showToast('Progress shalat disimpan!'); }

// QURAN
function hitungQuran() {
  state.quran.target = parseFloat(document.getElementById('targetHalaman').value) || 0;
  state.quran.dibaca = parseFloat(document.getElementById('dibacaHalaman').value) || 0;

  const pct = state.quran.target > 0 ? Math.min((state.quran.dibaca / state.quran.target) * 100, 100) : 0;
  const fill = document.getElementById('quranFill');
  const label = document.getElementById('quranPctLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = Math.round(pct) + '%';
  
  //Status
  const el = document.getElementById('quranStatus');
  if (state.quran.target === 0) {
    el.className = 'status-text status-warn';
    el.textContent = 'Masukkan target hari ini';
  } else if (pct < 50) {
    el.className = 'status-text status-warn';
    el.textContent = 'Masih bisa ditambah';
  } else if (pct <= 90) {
      el.className = 'status-text status-mid';
      el.textContent = 'Hampir selesai';
  } else if (pct >= 100) {
    el.className = 'status-text status-good';
    el.textContent = 'Target tercapai';
  }
    
  updateOverall();
}

function hitungQuranTotal() {
  state.quran.targetKhatam = parseFloat(document.getElementById('targetKhatam').value) || 0;
  state.quran.dibacaTotal = parseFloat(document.getElementById('dibacaTotal').value) || 0;
  const pct = state.quran.targetKhatam > 0 ? Math.min(state.quran.dibacaTotal / state.quran.targetKhatam * 100, 100) : 0;
  document.getElementById('quranTotalFill').style.width = pct + '%';
  document.getElementById('quranTotalLabel').textContent = Math.round(pct) + '%';
}

function saveQuran() { saveState(); 
  showToast('Progress Quran disimpan!');
}

function tandaiTargetSelesai() {
  const targetVal = document.getElementById('targetHalaman').value;
  if (targetVal > 0) {
    document.getElementById('dibacaHalaman').value = targetVal;
    hitungQuran();
    showToast('MasyaAllah! Target tercapai!');
  } else {
    showToast('Tentukan target dulu!');
  }
}

// PUASA
function getRamadhanHari() {
  const start = new Date(2025, 2, 1);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diff, 1), 30);
}

function buildCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  days.forEach(d => {
    const h = document.createElement('div'); 
      h.className = 'cal-header'; 
      h.textContent = d; 
      grid.appendChild(h);
    });

    // Offset awal bulan (Maret 2025 mulai hari Sabtu = index 6)
    const offset = 4;
    for (let i = 0; i < offset; i++) { 
      grid.appendChild(document.createElement('div')); 
    }

    const hariKe = getRamadhanHari();

    for (let d = 1; d <= 30; d++) {
      const el = document.createElement('div');
      el.className = 'cal-day';
        
      // Logika Tampilan: Jika sudah puasa tampilkan icon checklist, jika belum tampilkan angka
      if (state.puasa[d]) {
        el.classList.add('done');
        el.innerHTML = '<i class="bi bi-patch-check-fill"></i>'; // Menggunakan icon bootstrap
      } else {
        el.textContent = d;
      }

      if (d === hariKe) el.classList.add('today');
      if (d > hariKe) el.classList.add('future');

      // Hanya hari yang sudah/sedang berjalan yang bisa diklik
      if (d <= hariKe) {
        el.onclick = () => togglePuasaDay(d);
      }
        
      grid.appendChild(el);
    }
}
function togglePuasaDay(d) { state.puasa[d] = !state.puasa[d]; buildCalendar(); updatePuasa(); updateOverall(); }
function togglePuasaHariIni() {
  let hariTarget = 0;
  for (let d = 1; d <= 30; d++) {
    if (!state.puasa[d]) {
      hariTarget = d;
      break;
    }}
  if (hariTarget !== 0) {
    state.puasa[hariTarget] = true;
  }

  buildCalendar();
  updatePuasa();
  updateOverall();
}

function updatePuasa() {
    const h = getRamadhanHari();   
    const hariKeEl = document.getElementById('hariKe');
    if (hariKeEl) hariKeEl.textContent = h;

    const done = state.puasa.filter(Boolean).length;
    const pct = (done / 30) * 100;

    const fill = document.getElementById('puasaFill');
    const label = document.getElementById('puasaPctLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${done} / 30 Hari`;
    const btn = document.getElementById('todayPuasaBtn');
    const icon = document.getElementById('todayIcon');
    
    if (btn && icon) {
      if (state.puasa[h]) {
        btn.classList.add('done');
        icon.textContent = '✓';
      } else {
        btn.classList.remove('done');
        icon.textContent = '☐';
      }
    }

    const statusEl = document.getElementById('puasaStatus');
    if (statusEl) {
      if (pct < 40) statusEl.textContent = 'Bismillah, ayo mulai puasa pertamamu!';
      else if (pct < 80) statusEl.textContent = 'Luar biasa! Kamu sangat konsisten.';
      else if (pct < 100) statusEl.textContent = 'Hampir sampai di garis finish!';
      else statusEl.textContent = 'MasyaAllah! Puasa 30 hari lengkap!';
    }
}

function savePuasa() { saveState(); showToast('Progress puasa disimpan!'); }

// INISIALISASI SAAT HALAMAN DIBUKA
document.addEventListener("DOMContentLoaded", function () {
    loadState();
    openTab(null, 'shalat');

    restoreShalat();
    buildCalendar();
    updatePuasa();
    updateOverall();

    if (state.quran.target > 0) document.getElementById('targetHalaman').value = state.quran.target;
    if (state.quran.dibaca > 0) document.getElementById('dibacaHalaman').value = state.quran.dibaca;
    if (state.quran.targetKhatam > 0) document.getElementById('targetKhatam').value = state.quran.targetKhatam;
    if (state.quran.dibacaTotal > 0) document.getElementById('dibacaTotal').value = state.quran.dibacaTotal;
    hitungQuran();
    hitungQuranTotal();
});