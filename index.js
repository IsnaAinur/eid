const API_BASE = "https://api.myquran.com/v2/sholat/jadwal";
const YEAR = 2026;
const START_DATE = new Date("2026-02-19");
const END_DATE = new Date("2026-03-20");

const citySelect = document.getElementById('citySelect');
const citySearch = document.getElementById('citySearch');
const suggestions = document.getElementById('searchSuggestions');
const tableBody = document.getElementById('tableBody');
const loadingMsg = document.getElementById('loadingMsg');
const errorMsg = document.getElementById('errorMsg');

/* Memuat semua daftar kota ke dalam dropdown */
async function loadAllCities() {
    try {
        const response = await fetch("https://api.myquran.com/v2/sholat/kota/semua");
        const result = await response.json();

        if (result.status) {
            citySelect.innerHTML = '<option value="" disabled selected>-- Pilih Kota / Kabupaten --</option>';           
            result.data.forEach(kota => {
                const option = document.createElement('option');
                option.value = kota.id;
                option.textContent = kota.lokasi;
                citySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Gagal memuat kota:", error);
    }
}

/* Fetch data API */
async function getJadwalImsakiyah(cityId) {
    tableBody.innerHTML = '';
    loadingMsg.classList.remove('d-none');
    errorMsg.classList.add('d-none');

    try {
        const [respFeb, respMar] = await Promise.all([
            fetch(`${API_BASE}/${cityId}/${YEAR}/02`),
            fetch(`${API_BASE}/${cityId}/${YEAR}/03`)
        ]);

        const dataFeb = await respFeb.json();
        const dataMar = await respMar.json();

        if (dataFeb.status && dataMar.status) {
            const gabunganJadwal = [...dataFeb.data.jadwal, ...dataMar.data.jadwal];
            const jadwalFiltered = gabunganJadwal.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= START_DATE && itemDate <= END_DATE;
            });

            renderTable(jadwalFiltered);
        } else {
            throw new Error("Data tidak ditemukan");
        }
    } catch (error) {
        errorMsg.classList.remove('d-none');
    } finally {
        loadingMsg.classList.add('d-none');
    }
}

/* highlight hari */
function renderTable(jadwal) {
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    jadwal.forEach(item => {
        const row = document.createElement('tr');
        if (item.date === todayISO) {
            row.classList.add('today-highlight');
        }
        row.innerHTML = `
            <td>${item.tanggal}</td>
            <td>${item.imsak}</td>
            <td>${item.subuh}</td>
            <td>${item.dzuhur}</td>
            <td>${item.ashar}</td>
            <td>${item.maghrib}</td>
            <td>${item.isya}</td>
        `;
        tableBody.appendChild(row);
        if (item.date === todayISO) {
            setTimeout(() => {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    });
}

// Pencarian Kota
citySearch.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) {
        suggestions.classList.add('d-none');
        return;
    }

    try {
        const resp = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
        const result = await resp.json();

        if (result.status && result.data.length > 0) {
            suggestions.innerHTML = '';
            result.data.forEach(kota => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = kota.lokasi;
                div.onclick = () => {
                    citySearch.value = kota.lokasi;
                    citySelect.value = kota.id;
                    suggestions.classList.add('d-none');
                    getJadwalImsakiyah(kota.id);
                };
                suggestions.appendChild(div);
            });
            suggestions.classList.remove('d-none');
        }
    } catch (err) {
        console.error("Gagal mencari kota");
    }
});

// Event Listener Dropdown 
citySelect.addEventListener('change', (e) => {
    citySearch.value = "";
    getJadwalImsakiyah(e.target.value);
});

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
    loadAllCities(); 
    getJadwalImsakiyah('1301'); // Default Jakarta
});