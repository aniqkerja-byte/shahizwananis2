export const wedding = {
  bride: 'Anis Jamilah Jamlus',
  groom: 'Mohd Shahizwan Mohammad Shahari',
  date: '9 Januari 2027',
  dateISO: '2027-01-09',
  day: 'Sabtu',
  time: '11.00 pagi – 4.30 petang',
  timezone: 'Asia/Kuala_Lumpur',
  venue: 'Dewan Perdana',
  location: 'Tampin, Negeri Sembilan',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dewan%20Perdana%2C%20Tampin%2C%20Negeri%20Sembilan',
  assistanceHeading: 'Untuk Sebarang Bantuan / Pertanyaan Berkaitan Majlis',
  parkingNote: 'Sila ikut arahan anggota RELA yang bertugas. Tempat letak kenderaan di dalam kawasan Dewan Perdana adalah sangat terhad dan hanya untuk menurunkan penumpang. Tempat letak kenderaan disediakan berhampiran dan bersebelahan dengan Dewan Perdana.',
  parents: {
    groom: ['Mohammad Shahari Ludin', 'Sariah Datok Gempa Borhan'],
    bride: ["Dato’ Ir. Jamlus Aziz", 'Datin Hamidah Mansor'],
  },
  contacts: [
    { name: 'Aiman Jamil', side: 'Pihak perempuan', phone: '012 324 5122', international: '60123245122' },
    { name: 'Azfar Jamil', side: 'Pihak perempuan', phone: '019 276 7122', international: '60192767122' },
    { name: 'Wan', side: 'Pihak lelaki', phone: '011 2992 2304', international: '601129922304' },
  ],
  eventDetails: {
    dressCode: 'Tradisional / Smart Casual',
    dressCodeNote: 'Apa sahaja warna pilihan anda kecuali putih & silver.',
    schedule: [
      { time: '11:00 am', title: 'Ketibaan para tetamu' },
      { time: '12:30 pm', title: 'Ketibaan pengantin', description: 'Bacaan doa & salam restu' },
      { time: '11:00 am – 4:30 pm', title: 'Jamuan makan & beramah mesra' },
    ],
    menu: [
      'Biryani',
      'Hidangan Sampingan & Pembuka Selera',
      'Buah-buahan',
      'Kuih-muih Melayu & Manisan',
      'Minuman sejuk & panas',
      'Air mineral',
    ],
  },
  closing: [
    'This day would not feel complete without you. Your doa, your prayers, your restu have made this day happen.',
    'Dalam setiap doa dan restu yang diterima, kami dipertemukan dan ditakdirkan sampai ke sini. Our takdir has always been cared for and guided in the most beautiful ways through you.',
    'Terima kasih daripada kami untuk semua doa-doa yang baik. Terima kasih sudi luangkan masa untuk raikan kami. Semoga hari kita nanti diberkati dan menjadi satu memori yang indah untuk semua.',
    'Jumpa nanti, we can’t wait to see you!',
  ],
};

export const pages = [
  { id: 'home', label: 'Utama', eyebrow: 'Jemputan' },
  { id: 'invitation', label: 'Jemputan', eyebrow: 'Walimatulurus' },
  { id: 'dresscode', label: 'Event Details', eyebrow: 'Maklumat majlis' },
  { id: 'location', label: 'Lokasi', eyebrow: 'Lokasi majlis' },
  { id: 'rsvp', label: 'RSVP', eyebrow: 'Tempat untuk anda' },
  { id: 'note', label: '🤍', eyebrow: 'Daripada kami' },
];
