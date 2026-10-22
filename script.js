const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const KUNCI_SIMPAN = 'planner-acara';

let acara = muatAcara();
let bulanTampil = new Date();
bulanTampil.setDate(1);
let tanggalTerpilih = kunci(new Date());

/* ---------- Penyimpanan ---------- */
function muatAcara() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_SIMPAN)) || [];
  } catch (e) {
    return [];
  }
}

function simpanAcara() {
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(acara));
  } catch (e) {
    /* abaikan kalau penyimpanan diblokir */
  }
}

/* ---------- Bantuan tanggal ---------- */
function dua(n) {
  return String(n).padStart(2, '0');
}

function kunci(d) {
  return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate());
}

function dariKunci(k) {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatPanjang(d) {
  return NAMA_HARI[d.getDay()] + ', ' + d.getDate() + ' ' + NAMA_BULAN[d.getMonth()] + ' ' + d.getFullYear();
}

function acaraPadaTanggal(k) {
  return acara
    .filter(a => a.tanggal === k)
    .sort((a, b) => (a.jam || '99:99').localeCompare(b.jam || '99:99'));
}

/* ---------- Jam ---------- */
function perbaruiJam() {
  const sekarang = new Date();
  document.getElementById('hari').textContent = NAMA_HARI[sekarang.getDay()];
  document.getElementById('jam').textContent =
    dua(sekarang.getHours()) + ':' + dua(sekarang.getMinutes()) + ':' + dua(sekarang.getSeconds());
  document.getElementById('tanggal').textContent =
    sekarang.getDate() + ' ' + NAMA_BULAN[sekarang.getMonth()] + ' ' + sekarang.getFullYear();
}

/* ---------- Kalender ---------- */
function gambarKalender() {
  const tahun = bulanTampil.getFullYear();
  const bulan = bulanTampil.getMonth();
  const grid = document.getElementById('grid');
  const hariIni = kunci(new Date());

  document.getElementById('judulBulan').textContent = NAMA_BULAN[bulan] + ' ' + tahun;
  grid.innerHTML = '';

  // Minggu dimulai dari Senin
  const geser = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  for (let i = 0; i < geser; i++) {
    const kosong = document.createElement('div');
    kosong.className = 'sel kosong';
    grid.appendChild(kosong);
  }

  for (let tgl = 1; tgl <= jumlahHari; tgl++) {
    const d = new Date(tahun, bulan, tgl);
    const k = kunci(d);
    const sel = document.createElement('button');
    sel.type = 'button';
    sel.className = 'sel';
    if (d.getDay() === 0) sel.classList.add('minggu');
    if (k === hariIni) sel.classList.add('hari-ini');
    if (k === tanggalTerpilih) sel.classList.add('terpilih');

    const angka = document.createElement('span');
    angka.className = 'angka';
    angka.textContent = tgl;
    sel.appendChild(angka);

    const jumlah = acaraPadaTanggal(k).length;
    if (jumlah > 0) {
      const baris = document.createElement('span');
      baris.className = 'titik-baris';
      for (let i = 0; i < Math.min(jumlah, 4); i++) {
        const titik = document.createElement('span');
        titik.className = 'titik';
        baris.appendChild(titik);
      }
      sel.appendChild(baris);
    }

    sel.setAttribute('aria-label', formatPanjang(d) + (jumlah ? ', ' + jumlah + ' acara' : ''));
    sel.addEventListener('click', () => {
      tanggalTerpilih = k;
      gambarSemua();
    });
    grid.appendChild(sel);
  }
}

/* ---------- Detail hari terpilih ---------- */
function gambarDetail() {
  document.getElementById('judulDetail').textContent = formatPanjang(dariKunci(tanggalTerpilih));
  const daftar = document.getElementById('daftarAcara');
  daftar.innerHTML = '';

  const hariItu = acaraPadaTanggal(tanggalTerpilih);
  if (hariItu.length === 0) {
    const li = document.createElement('li');
    li.className = 'kosong';
    li.textContent = 'Belum ada acara di tanggal ini. Tambahkan lewat form di bawah.';
    daftar.appendChild(li);
    return;
  }

  hariItu.forEach(a => {
    const li = document.createElement('li');

    const info = document.createElement('div');
    info.className = 'info';
    const judul = document.createElement('b');
    judul.textContent = (a.jam ? a.jam + ' - ' : '') + a.judul;
    info.appendChild(judul);
    if (a.catatan) {
      const cat = document.createElement('span');
      cat.textContent = a.catatan;
      info.appendChild(cat);
    }

    const hapus = document.createElement('button');
    hapus.type = 'button';
    hapus.className = 'hapus';
    hapus.textContent = 'Hapus';
    hapus.addEventListener('click', () => {
      acara = acara.filter(x => x.id !== a.id);
      simpanAcara();
      gambarSemua();
    });

    li.appendChild(info);
    li.appendChild(hapus);
    daftar.appendChild(li);
  });
}

/* ---------- Acara mendatang ---------- */
function gambarMendatang() {
  const ul = document.getElementById('mendatang');
  ul.innerHTML = '';
  const hariIni = kunci(new Date());

  const berikut = acara
    .filter(a => a.tanggal >= hariIni)
    .sort((a, b) => (a.tanggal + (a.jam || '99:99')).localeCompare(b.tanggal + (b.jam || '99:99')))
    .slice(0, 5);

  if (berikut.length === 0) {
    const li = document.createElement('li');
    li.className = 'kosong';
    li.textContent = 'Belum ada acara mendatang.';
    ul.appendChild(li);
    return;
  }

  berikut.forEach(a => {
    const li = document.createElement('li');
    const judul = document.createElement('b');
    judul.textContent = a.judul;
    const waktu = document.createElement('span');
    const d = dariKunci(a.tanggal);
    waktu.textContent = NAMA_HARI[d.getDay()] + ', ' + d.getDate() + ' ' + NAMA_BULAN[d.getMonth()] +
      (a.jam ? ' - ' + a.jam : '');
    li.appendChild(judul);
    li.appendChild(waktu);
    ul.appendChild(li);
  });
}

function gambarSemua() {
  gambarKalender();
  gambarDetail();
  gambarMendatang();
}

/* ---------- Tombol & form ---------- */
document.getElementById('prev').addEventListener('click', () => {
  bulanTampil.setMonth(bulanTampil.getMonth() - 1);
  gambarKalender();
});

document.getElementById('next').addEventListener('click', () => {
  bulanTampil.setMonth(bulanTampil.getMonth() + 1);
  gambarKalender();
});

document.getElementById('hariIni').addEventListener('click', () => {
  bulanTampil = new Date();
  bulanTampil.setDate(1);
  tanggalTerpilih = kunci(new Date());
  gambarSemua();
});

document.getElementById('formAcara').addEventListener('submit', e => {
  e.preventDefault();
  const judul = document.getElementById('inJudul').value.trim();
  if (!judul) return;

  acara.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    tanggal: tanggalTerpilih,
    jam: document.getElementById('inJam').value,
    judul: judul,
    catatan: document.getElementById('inCatatan').value.trim()
  });
  simpanAcara();
  e.target.reset();
  gambarSemua();
});

/* ---------- Mulai ---------- */
perbaruiJam();
setInterval(perbaruiJam, 1000);
gambarSemua();