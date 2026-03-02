let count = 0;
let currentTarget = 33;

const countDisplay = document.getElementById('zikir-count');
const targetDisplay = document.getElementById('target-value');
const notifArea = document.getElementById('notification');

// Fungsi pilih target
function setTarget(value) {
    currentTarget = value;
    targetDisplay.innerText = value;

    const buttons = document.querySelectorAll('.btn-target');
    buttons.forEach(btn => {
        if(parseInt(btn.innerText) === value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    resetZikir();
}

// Fungsi Tambah
document.getElementById('btn-tambah').addEventListener('click', () => {
    count++;
    countDisplay.innerText = count;

    countDisplay.style.transform = "scale(1.1)";
    setTimeout(() => { countDisplay.style.transform = "scale(1)"; }, 100);

    if (count === currentTarget) {
        notifArea.innerHTML = `<span class="badge-notif">Alhamdulillah, Target ${currentTarget} Tercapai!</span>`;
    }
});

//Fungsi Reset
function resetZikir() {
    count = 0;
    countDisplay.innerText = count;
    notifArea.innerHTML = "";
}

document.getElementById('btn-reset').addEventListener('click', resetZikir);