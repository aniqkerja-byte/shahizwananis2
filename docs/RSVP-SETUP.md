# RSVP ke Google Sheets

Kedua-dua website menggunakan `/api/rsvp`. Browser menghantar nama, kehadiran dan bilangan tetamu kepada server. Server menyimpan satu baris dalam tab `RSVP` sebelum mengesahkan kejayaan.

## Dua fail berasingan

- Perempuan: https://docs.google.com/spreadsheets/d/1qkpMB4F8vAgbop6L8IaDNkxp8oDMXJONs_ELcSIEneQ/edit
- Lelaki: https://docs.google.com/spreadsheets/d/1bqBiYOuGHorrBZL2UX7Y9lk7VejdkruRzQZD7lzijFU/edit

Kolum A–D: masa penghantaran (Malaysia), nama, kehadiran (`Hadir` / `Tidak hadir`), bilangan tetamu. Respons tidak hadir menyimpan bilangan 0. Kekalkan nama tab `RSVP` dan susunan kolum ini. Nama disimpan sebagai teks melalui `RAW`, termasuk jika bermula dengan tanda `=`.

## 1. Google Cloud

1. Buka https://console.cloud.google.com/ dan cipta project untuk RSVP.
2. Buka **APIs & Services → Library**, cari **Google Sheets API**, dan klik **Enable**.
3. Buka **IAM & Admin → Service Accounts → Create service account**. Namakan `wedding-rsvp`. Tidak perlu beri role project atau domain-wide delegation.
4. Buka service account itu → **Keys → Add key → Create new key → JSON**. Simpan fail di lokasi peribadi di luar repo. Jangan commit, letak dalam `public/`, atau hantar private key dalam chat.
5. Salin e-mel service account (`client_email` dalam JSON). Pada kedua-dua Sheets, klik **Share**, tambah e-mel itu sebagai **Editor**. Kekalkan akses fail terhad; tetamu tidak perlukan akses ke Sheets.

Sheets API menyediakan penggunaan standard tanpa caj tambahan: https://developers.google.com/workspace/sheets/api/limits. Integrasi ini tidak memerlukan kenaikan kuota berbayar.

## 2. Tetapan Vercel

Untuk **setiap** project Vercel, buka **Settings → Environment Variables**. Tetapkan:

| Nama | Nilai |
| --- | --- |
| `GOOGLE_SHEET_ID` | ID fail mengikut versi di bawah |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Nilai `client_email` daripada JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Nilai `private_key` daripada JSON; boleh mengandungi newline sebenar atau `\n` |

ID perempuan: `1qkpMB4F8vAgbop6L8IaDNkxp8oDMXJONs_ELcSIEneQ`

ID lelaki: `1bqBiYOuGHorrBZL2UX7Y9lk7VejdkruRzQZD7lzijFU`

Pilih environment Production; set Preview hanya jika preview patut menulis ke fail itu juga. Jangan guna awalan `VITE_`. Redeploy selepas konfigurasi dan perubahan kod dihantar. Satu service account boleh digunakan oleh kedua-dua project, tetapi setiap project mesti menggunakan ID failnya sendiri.

## 3. Ujian local

Salin `.env.example` ke `.env.local` (diabaikan Git), kemudian isi tiga nilai. Untuk menguji kedua-dua versi dalam satu checkout, gunakan `.env.bride.local` dengan ID perempuan dan `.env.groom.local` dengan ID lelaki. Hentikan dan jalankan semula dev server selepas menukar env.

```sh
npm install
npm run dev:bride
# atau npm run dev:groom
npm run test:api
npx playwright test tests/invitation.spec.js -g RSVP --workers=1
npm run build
```

`npm run dev` menyokong endpoint yang sama melalui Vite middleware. `npm run preview` hanya preview aset statik; endpoint RSVP production disediakan oleh Vercel.

## 4. Pengesahan sebenar selepas akses tersedia

Ujian local dengan service account telah berjaya pada 9 Oktober 2026: versi perempuan dan lelaki masing-masing menyimpan satu respons hadir (2 tetamu) dan satu tidak hadir (0 tetamu) ke fail yang betul. Semua baris ujian telah dibuang. Fail env local disimpan dalam kedua-dua checkout dan diabaikan Git. Tiga environment variables Production telah disimpan sebagai Secret pada kedua-dua project Vercel. Deployment kod RSVP diperlukan untuk menggunakan tetapan ini pada website live.

Hantar satu RSVP hadir dan satu tidak hadir pada setiap website dengan nama ujian yang jelas. Semak hanya fail yang betul menerima baris, bilangan tepat, dan masa Malaysia. Padam baris ujian secara manual selepas semakan. Tanpa konfigurasi atau akses Google, endpoint memulangkan 503 dan borang tidak memaparkan pengesahan berjaya.

Butang dikunci semasa menghantar, termasuk jika tetamu menukar halaman. Kod tidak mencuba semula append secara automatik. Gangguan selepas Google menyimpan tetapi sebelum browser menerima jawapan boleh menyebabkan penghantaran semula menjadi baris tambahan; tiada deduplikasi merentas sesi. Ujian automatik menggunakan storage mock, bukan bukti akses Google sebenar.
