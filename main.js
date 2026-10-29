const state = {
  meta: {
    nama: 'Tracker Project WNGR',
    lokasi: 'Jakarta',
    pm: 'Doyok Sadino',
  },
  theme: localStorage.getItem('tracker-theme') || 'light',
  filters: {
    payment: 'Semua',
    bill: 'Semua',
  },
  projects: ['CAO', 'JRP', 'FTTH SURGE', 'SURGE BACKBONE'].map((name) => ({
    name,
    spk: null,
    plan: null,
    boq: null,
    tagihan: null,
    terbayar: null,
  })),
  spk: [
    {
      no: 1,
      judul: 'Pekerjaan Persiapan dan Mobilisasi',
      noSpk: 'SPK-001/2026',
      vendor: 'PT. Mandiri Konstruksi',
      nilai: 125000000,
      tanggal: '2026-01-12',
      status: 'Selesai',
    },
    {
      no: 2,
      judul: 'Pekerjaan Struktur Lantai 1-3',
      noSpk: 'SPK-002/2026',
      vendor: 'PT. Bina Bangunan',
      nilai: 420000000,
      tanggal: '2026-02-20',
      status: 'Aktif',
    },
    {
      no: 3,
      judul: 'Pekerjaan Finishing dan Arsitektur',
      noSpk: 'SPK-003/2026',
      vendor: 'PT. Sentra Interior',
      nilai: 280000000,
      tanggal: '2026-03-10',
      status: 'Tertunda',
    },
  ],
  boq: [
    { uraian: 'Galian Tanah', satuan: 'm3', volume: 220, harga: 85000, realisasi: 210 },
    { uraian: 'Beton Struktur', satuan: 'm3', volume: 180, harga: 1500000, realisasi: 130 },
    { uraian: 'Pasangan Bata', satuan: 'm2', volume: 640, harga: 185000, realisasi: 425 },
    { uraian: 'Plester & Acian', satuan: 'm2', volume: 980, harga: 92000, realisasi: 540 },
  ],
  payments: [
    { tanggal: '2026-01-20', jumlah: 25000000, metode: 'Transfer', keterangan: 'Termin 1 - Mobilisasi' },
    { tanggal: '2026-02-18', jumlah: 68000000, metode: 'Transfer', keterangan: 'Termin 2 - Struktur' },
    { tanggal: '2026-03-22', jumlah: 42000000, metode: 'Cek', keterangan: 'Termin 3 - Pelaksanaan' },
  ],
  bills: [
    { no: 'INV-001', uraian: 'Tagihan Persiapan', nilai: 120000000, terbayar: 95000000, status: 'Proses' },
    { no: 'INV-002', uraian: 'Tagihan Struktur', nilai: 420000000, terbayar: 150000000, status: 'Belum dibayar' },
    { no: 'INV-003', uraian: 'Tagihan Finishing', nilai: 280000000, terbayar: 0, status: 'Belum dibayar' },
  ],
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const calcSummary = () => {
  const totalSpk = state.spk.reduce((sum, item) => sum + Number(item.nilai || 0), 0);
  const totalBoq = state.boq.reduce((sum, item) => sum + Number((item.volume || 0) * (item.harga || 0)), 0);
  const totalPayment = state.payments.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);
  const totalTagihan = state.bills.reduce((sum, bill) => sum + Number(bill.nilai || 0), 0);
  const totalInvoiceLunas = state.bills
    .filter((bill) => bill.status === 'Lunas')
    .reduce((sum, bill) => sum + Number(bill.nilai || 0), 0);
  const totalProjects = state.projects.length;
  const sisaTagihan = Math.max(totalTagihan - totalPayment, 0);

  return {
    totalSpk,
    totalBoq,
    totalPayment,
    totalTagihan,
    totalInvoiceLunas,
    totalProjects,
    sisaTagihan,
  };
};

const renderSummary = () => {
  const summary = calcSummary();
  const cards = [
    { title: 'Nilai SPK', value: formatCurrency(summary.totalSpk), accent: 'blue' },
    { title: 'Nilai BOQ', value: formatCurrency(summary.totalBoq), accent: 'green' },
    { title: 'Pembayaran', value: formatCurrency(summary.totalPayment), accent: 'amber' },
    { title: 'Nilai Invoice Lunas', value: formatCurrency(summary.totalInvoiceLunas), accent: 'green' },
    { title: 'Sisa Tagihan', value: formatCurrency(summary.sisaTagihan), accent: 'red' },
  ];

  document.getElementById('summary-grid').innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card ${card.accent}">
          <span>${card.title}</span>
          <strong>${card.value}</strong>
          ${card.detail ? `<small class="summary-detail">${card.detail}</small>` : ''}
        </article>
      `
    )
    .join('');

  document.getElementById('project-summary').innerHTML = `
    <article class="summary-card blue project-summary-card">
      <div>
        <span>Total Proyek Berjalan</span>
        <strong>${summary.totalProjects} Proyek</strong>
      </div>
      <small class="summary-detail">${state.projects.map((project) => project.name).join(', ')}</small>
    </article>
    <div class="project-metrics-grid">
      ${state.projects
        .map((project) => {
          const metrics = [
            ['Nilai SPK', project.spk, true],
            ['Plan', project.plan, false],
            ['BOQ', project.boq, true],
            ['Jumlah Tagihan', project.tagihan, true],
            ['Jumlah Terbayar', project.terbayar, true],
          ];

          return `
            <article class="project-metrics-card">
              <h3>${project.name}</h3>
              <dl>
                ${metrics
                  .map(([label, value, isCurrency]) => {
                    const displayValue = value == null || value === ''
                      ? 'Belum diisi'
                      : isCurrency && typeof value === 'number'
                        ? formatCurrency(value)
                        : value;

                    return `<div><dt>${label}</dt><dd>${displayValue}</dd></div>`;
                  })
                  .join('')}
              </dl>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
};

const renderPaymentChart = () => {
  const { totalPayment, sisaTagihan } = calcSummary();
  const total = totalPayment + sisaTagihan;
  const paidShare = total > 0 ? totalPayment / total : 0;
  const circumference = 2 * Math.PI * 72;
  const paidArc = circumference * paidShare;
  const svg = document.getElementById('payment-chart');
  if (!svg) return;

  svg.innerHTML = `
    <circle cx="110" cy="110" r="72" class="donut-track" />
    <g transform="rotate(-90 110 110)">
      <circle cx="110" cy="110" r="72" class="donut-paid"
        stroke-dasharray="${paidArc} ${circumference - paidArc}" />
    </g>
    <text x="110" y="106" class="donut-percent">${Math.round(paidShare * 100)}%</text>
    <text x="110" y="128" class="donut-label">terbayar</text>
  `;

  document.getElementById('paid-total').textContent = formatCurrency(totalPayment);
  document.getElementById('unpaid-total').textContent = formatCurrency(sisaTagihan);
  svg.setAttribute('aria-label', `Terbayar ${formatCurrency(totalPayment)}, belum terbayar ${formatCurrency(sisaTagihan)}`);
};

const renderSpk = () => {
  const body = document.getElementById('spk-table');
  body.innerHTML = state.spk
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.judul}</td>
          <td>${row.noSpk}</td>
          <td>${row.vendor}</td>
          <td>${formatCurrency(row.nilai)}</td>
          <td>${row.tanggal}</td>
          <td><span class="status ${row.status.toLowerCase().replace(/\s+/g, '-')}">${row.status}</span></td>
        </tr>
      `
    )
    .join('');
};

const renderBoq = () => {
  const body = document.getElementById('boq-table');
  body.innerHTML = state.boq
    .map((row) => {
      const subtotal = Number((row.volume || 0) * (row.harga || 0));
      const realisasi = Number(row.realisasi || 0);
      const persentase = subtotal > 0 ? (realisasi / row.volume) * 100 : 0;
      return `
        <tr>
          <td>${row.uraian}</td>
          <td>${row.satuan}</td>
          <td>${formatNumber(row.volume)}</td>
          <td>${formatCurrency(row.harga)}</td>
          <td>${formatCurrency(subtotal)}</td>
          <td>${formatNumber(realisasi)}</td>
          <td>${Math.min(Math.max(persentase, 0), 100).toFixed(1)}%</td>
        </tr>
      `;
    })
    .join('');
};

const renderPayments = () => {
  const body = document.getElementById('payment-table');
  const filtered = state.filters.payment === 'Semua' ? state.payments : state.payments.filter((row) => row.metode === state.filters.payment);

  body.innerHTML = filtered
    .map(
      (row) => `
        <tr>
          <td>${row.tanggal}</td>
          <td>${formatCurrency(row.jumlah)}</td>
          <td><span class="mini-pill method-${row.metode.toLowerCase()}">${row.metode}</span></td>
          <td>${row.keterangan}</td>
        </tr>
      `
    )
    .join('');
};

const renderBills = () => {
  const body = document.getElementById('bill-table');
  const filtered = state.filters.bill === 'Semua' ? state.bills : state.bills.filter((row) => row.status === state.filters.bill);

  body.innerHTML = filtered
    .map((row) => {
      const sisa = Number(row.nilai || 0) - Number(row.terbayar || 0);
      const statusClass = row.status.toLowerCase().replace(/\s+/g, '-');
      return `
        <article class="bill-card ${statusClass}">
          <div class="bill-top">
            <span class="bill-no">${row.no}</span>
            <span class="status ${statusClass}">${row.status}</span>
          </div>
          <h4>${row.uraian}</h4>
          <div class="bill-metrics">
            <div>
              <small>Nilai</small>
              <strong>${formatCurrency(row.nilai)}</strong>
            </div>
            <div>
              <small>Terbayar</small>
              <strong>${formatCurrency(row.terbayar)}</strong>
            </div>
            <div class="sisa-box">
              <small>Sisa</small>
              <strong>${formatCurrency(sisa)}</strong>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
};

const applyTheme = () => {
  document.body.classList.toggle('dark-theme', state.theme === 'dark');
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  localStorage.setItem('tracker-theme', state.theme);
};

const renderPage = () => {
  document.getElementById('project-name').textContent = state.meta.nama;
  document.getElementById('project-location').textContent = state.meta.lokasi;
  document.getElementById('project-pm').textContent = `PM : ${state.meta.pm}`;

  applyTheme();
  renderSummary();
  renderPaymentChart();
  renderSpk();
  renderBoq();
  renderPayments();
  renderBills();
};

const addRow = (type) => {
  const templates = {
    spk: {
      no: state.spk.length + 1,
      judul: 'Pekerjaan Baru',
      noSpk: `SPK-${String(state.spk.length + 1).padStart(3, '0')}/2026`,
      vendor: 'Vendor Baru',
      nilai: 0,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Aktif',
    },
    boq: {
      uraian: 'Item BOQ Baru',
      satuan: 'pcs',
      volume: 0,
      harga: 0,
      realisasi: 0,
    },
    payment: {
      tanggal: new Date().toISOString().split('T')[0],
      jumlah: 0,
      metode: 'Transfer',
      keterangan: 'Pembayaran baru',
    },
    bill: {
      no: `INV-${String(state.bills.length + 1).padStart(3, '0')}`,
      uraian: 'Tagihan Baru',
      nilai: 0,
      terbayar: 0,
      status: 'Belum dibayar',
    },
  };

  state[type + 's'] = state[type + 's'] || [];
  state[type + 's'].push(structuredClone(templates[type]));
  renderPage();
};

document.getElementById('add-spk').addEventListener('click', () => addRow('spk'));
document.getElementById('add-boq').addEventListener('click', () => addRow('boq'));
document.getElementById('add-payment').addEventListener('click', () => addRow('payment'));
document.getElementById('add-bill').addEventListener('click', () => addRow('bill'));

document.getElementById('payment-filter').addEventListener('change', (event) => {
  state.filters.payment = event.target.value;
  renderPayments();
});

document.getElementById('bill-filter').addEventListener('change', (event) => {
  state.filters.bill = event.target.value;
  renderBills();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

renderPage();
