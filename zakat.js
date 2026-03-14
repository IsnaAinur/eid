const zakatType = document.getElementById('zakat-type');
const formPenghasilan = document.getElementById('form-penghasilan');
const formEmas = document.getElementById('form-emas');
const btnHitung = document.getElementById('btn-hitung');

zakatType.addEventListener('change', () => {
    if (zakatType.value === 'penghasilan') {
    formPenghasilan.style.display = 'block';
    formEmas.style.display = 'none';
    } else {
    formPenghasilan.style.display = 'none';
    formEmas.style.display = 'block';
    }
});

btnHitung.addEventListener('click', () => {
    const hargaEmas = parseFloat(document.getElementById('harga-emas').value);
    const resultBox = document.getElementById('result-box');

    if (!hargaEmas) {
    alert("Harap masukkan harga emas!");
    return;
    }

    let totalHarta = 0;
     const nisab = hargaEmas * 85; // Nisab tahunan

    if (zakatType.value === 'penghasilan') {
    const gaji = parseFloat(document.getElementById('gaji').value) || 0;
    const lainnya = parseFloat(document.getElementById('lainnya').value) || 0;

    totalHarta = (gaji + lainnya) * 12; // Total tahunan
    } else {
    const gram = parseFloat(document.getElementById('total-emas').value) || 0;
    totalHarta = gram * hargaEmas;
    }

    let status = "Tidak Wajib";
    let jumlahZakat = 0;

    if (totalHarta >= nisab) {
    status = "Wajib Zakat";
    jumlahZakat = totalHarta * 0.025;
    }

    // Tampilkan hasil
    resultBox.style.display = 'block';
    document.getElementById('res-total').innerText = "Rp " + totalHarta.toLocaleString();
    document.getElementById('res-nisab').innerText = "Rp " + nisab.toLocaleString();
    document.getElementById('res-status').innerText = status;
    document.getElementById('res-zakat').innerText = "Rp " + jumlahZakat.toLocaleString();
});

// Reset form
document.getElementById('btn-reset-zakat').addEventListener('click', function() {
    document.getElementById('harga-emas').value = "";
    document.getElementById('gaji').value = "";
    document.getElementById('lainnya').value = "";
    document.getElementById('total-emas').value = "";
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'none';
});