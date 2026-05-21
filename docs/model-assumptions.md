# Asumsi Model Simulasi Lift SGLC

## Konfigurasi Lift

- Total lift: 4 unit.
- Bank timur: 2 lift, yaitu Timur Utara dan Timur Selatan, melayani lantai 1, 4, 5, 6, dan 7.
- Bank barat: 2 lift, yaitu Barat Utara dan Barat Selatan, melayani lantai 1, 5, 8, 9, 10, dan 11.
- Lantai 2 dan 3 tidak dapat diakses lift, sehingga tidak boleh menjadi origin atau destination.
- Setiap lift memiliki antrean sendiri, bukan hanya antrean per bank.
- Lantai 5 adalah lantai overlap. Jika origin atau destination melibatkan lantai 5 dan dua bank valid, sistem memilih bank lalu lift dengan antrean atau estimasi tunggu lebih rendah.

## Parameter Default

- Kapasitas lift: 14 orang.
- Kapasitas berat: 1100 kg.
- Berat rata-rata penumpang: 70 kg.
- Waktu tempuh per lantai: 12 detik.
- Waktu boarding/alighting: 6 detik per orang atau grup.
- Durasi simulasi default: 30 menit.
- Satuan tick simulasi: 1 detik simulasi.

## Distribusi Stokastik

- Kedatangan penumpang dimodelkan sebagai peluang kedatangan per tick berdasarkan arrival rate per menit.
- Ukuran grup per kedatangan: discrete uniform 1 sampai 3 orang.
- Tujuan lantai: categorical, berbeda untuk tiap skenario.
- Random seed digunakan agar hasil eksperimen dapat direproduksi.

## Skenario

- Normal: origin dominan dari lantai 1, tetapi tetap ada perpindahan dari lantai lain.
- Jam masuk: origin lantai 1, destination lantai atas.
- Pergantian kelas: origin dan destination antar lantai atas.
- Jam pulang: origin lantai atas, destination lantai 1.

## Metrik

- Average waiting time.
- Max waiting time.
- Average travel time.
- Served passengers.
- Remaining queue.
- Utilization per lift dan per bank.
- Queue length by floor.
