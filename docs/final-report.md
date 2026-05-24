# [ARTIKEL] Simulasi Stokastik Sistem Lift SGLC UGM Berbasis Visualisasi Interaktif 3D

---

## Anggota Kelompok

| Nama Anggota | NIM |
| --- | --- |
| [Nama anggota 1] | [NIM anggota 1] |
| [Nama anggota 2] | [NIM anggota 2] |
| [Nama anggota 3] | [NIM anggota 3] |

---

> Kami melakukan simulasi stokastik sistem lift di SGLC UGM untuk menganalisis dinamika antrean, waktu tunggu, dan performa strategi dispatcher lift pada berbagai skenario kepadatan.

![Foto SGLC / area lift](placeholder-foto-sglc)

SGLC (Smart Green Learning Center) merupakan salah satu gedung dengan mobilitas mahasiswa yang tinggi di Fakultas Teknik UGM. Gedung ini memiliki beberapa lift yang melayani lantai berbeda. Pada jam tertentu, seperti jam masuk kuliah, pergantian kelas, makan siang, dan jam pulang, antrean lift dapat meningkat karena banyak pengguna bergerak dalam waktu berdekatan.

Proyek ini membangun simulasi interaktif berbasis web untuk memodelkan perilaku kedatangan penumpang, pembagian layanan lift, proses naik-turun penumpang, serta perubahan metrik performa secara real-time. Simulasi divisualisasikan dalam bentuk gedung 3D sehingga pengguna dapat melihat posisi lift, antrean penumpang, dan dampak perubahan parameter secara langsung.

---

# I. Latar Belakang

Lift merupakan fasilitas penting pada gedung bertingkat karena memengaruhi efisiensi perpindahan pengguna antar lantai. Pada gedung perkuliahan seperti SGLC UGM, pola penggunaan lift tidak selalu stabil. Ada periode dengan arus naik yang dominan, periode perpindahan antar lantai, serta periode arus turun menuju lantai dasar.

Ketidakpastian jumlah pengguna, tujuan lantai, waktu kedatangan, dan strategi pemilihan lift membuat sistem ini cocok dimodelkan menggunakan simulasi stokastik. Dengan simulasi, kita dapat mengamati bagaimana perubahan kondisi operasional memengaruhi waktu tunggu, panjang antrean, jumlah penumpang terlayani, dan utilisasi lift.

## Tujuan Simulasi

Tujuan utama simulasi ini adalah:

- Memodelkan sistem lift SGLC sebagai sistem antrean stokastik dengan beberapa lift dan pembagian bank layanan.
- Menganalisis pengaruh pola kedatangan penumpang terhadap panjang antrean dan waktu tunggu.
- Membandingkan performa beberapa strategi dispatcher lift.
- Menyediakan visualisasi interaktif 3D yang dapat digunakan untuk eksplorasi parameter secara real-time.
- Menghasilkan insight operasional terkait kondisi kepadatan dan strategi layanan lift.

## Metode Simulasi yang Digunakan

Simulasi menggunakan pendekatan time-step simulation dengan interval 1 detik waktu simulasi. Pada setiap tick, sistem memperbarui beberapa proses:

1. Membangkitkan kedatangan penumpang secara stokastik.
2. Menentukan lantai asal dan lantai tujuan penumpang sesuai skenario.
3. Memilih bank lift dan lift yang valid.
4. Menggerakkan lift menuju target lantai.
5. Memproses penumpang naik dan turun.
6. Memperbarui metrik performa sistem.

Implementasi dibuat sebagai aplikasi web menggunakan React, TypeScript, Vite, Three.js, React Three Fiber, dan Recharts.

# II. Teori Pemodelan

## Sistem Antrean

Sistem lift dapat dipandang sebagai sistem antrean dengan penumpang sebagai pelanggan dan lift sebagai server. Penumpang datang pada waktu tertentu, menunggu lift yang ditugaskan, naik ke lift, lalu keluar pada lantai tujuan. Performa sistem dapat dinilai melalui metrik seperti waktu tunggu, panjang antrean, throughput, dan utilisasi server.

Dalam sistem antrean nyata, kedatangan pelanggan sering memiliki unsur acak. Oleh karena itu, model deterministik kurang cukup untuk menggambarkan variasi kondisi yang terjadi pada jam ramai. Simulasi stokastik memungkinkan variasi tersebut dimasukkan ke dalam model.

## Proses Kedatangan Stokastik

Pada simulasi ini, kedatangan penumpang dimodelkan menggunakan peluang kedatangan per tick berdasarkan parameter arrival rate per menit. Jika arrival rate bernilai lambda penumpang per menit, maka peluang munculnya grup penumpang pada setiap detik didekati dengan:

$$
p = \frac{\lambda}{60}
$$

Pendekatan ini merupakan proses kedatangan diskrit berbasis Bernoulli per detik. Model ini cukup praktis untuk simulasi real-time karena mudah dikontrol melalui slider arrival rate. Semakin besar nilai arrival rate, semakin tinggi peluang penumpang baru muncul pada setiap tick.

## Simulasi Time-Step

Simulasi time-step memperbarui kondisi sistem pada interval waktu tetap. Dalam proyek ini, satu tick merepresentasikan satu detik simulasi. Pendekatan ini memudahkan visualisasi animasi karena posisi lift, antrean, dan status sistem dapat diperbarui secara kontinu.

## Strategi Dispatcher Lift

Dispatcher adalah mekanisme yang menentukan lift mana yang melayani permintaan penumpang. Simulasi ini membandingkan tiga strategi:

- Nearest valid elevator: memilih lift valid dengan skor terendah berdasarkan jarak, panjang antrean, dan jumlah target.
- Round robin: membagi permintaan secara bergiliran ke lift dalam bank yang sesuai.
- Collective/look-ahead: memprioritaskan lift yang sedang bergerak searah dan masih dapat menjemput penumpang sebelum melewati lantai asal.

## Referensi

Referensi utama:

- Banks, J., Carson, J. S., Nelson, B. L., & Nicol, D. M. (2010). *Discrete-Event System Simulation*. Pearson.

Referensi pendukung:

- Shiflet, A. B., & Shiflet, G. W. (2014). *Introduction to Computational Science: Modeling and Simulation for the Sciences*. Princeton University Press.
- Barney, G. C. (2003). *Elevator Traffic Handbook: Theory and Practice*. Spon Press.

# III. Pemodelan Sistem

## Objek yang Dimodelkan

Sistem yang dimodelkan adalah sistem lift pada gedung SGLC. Simulasi menyederhanakan sistem nyata menjadi empat lift yang terbagi ke dalam dua bank:

| Bank | Lift | Lantai yang Dilayani |
| --- | --- | --- |
| Barat | Barat Utara, Barat Selatan | 1, 5, 8, 9, 10, 11 |
| Timur | Timur Utara, Timur Selatan | 1, 4, 5, 6, 7 |

Lantai 2 dan 3 dianggap tidak dilayani lift. Lantai 5 menjadi lantai overlap yang dapat dilayani oleh kedua bank.

## Agen Penumpang

Penumpang adalah entitas dinamis dalam simulasi. Setiap penumpang memiliki atribut:

- `originFloor`: lantai asal.
- `destinationFloor`: lantai tujuan.
- `arrivalTime`: waktu kedatangan.
- `boardingTime`: waktu mulai naik lift.
- `exitTime`: waktu tiba di tujuan.
- `assignedBank`: bank lift yang dipilih.
- `assignedElevatorId`: lift yang ditugaskan.
- `groupSize`: ukuran grup penumpang.
- `status`: status penumpang, yaitu waiting, riding, atau completed.

Ukuran grup dibangkitkan secara acak dari 1 sampai 3 orang.

## Agen Lift

Lift berperan sebagai server dalam sistem antrean. Setiap lift memiliki atribut:

- `currentFloor`: posisi lantai saat ini.
- `targetFloors`: daftar lantai tujuan.
- `direction`: arah gerak lift.
- `capacity`: kapasitas maksimum penumpang.
- `maxWeightKg`: batas berat maksimum.
- `passengers`: daftar penumpang yang sedang berada di dalam lift.
- `status`: idle, moving, atau boarding.
- `servedFloors`: lantai yang dapat dilayani lift.
- `busyTime`: total waktu lift aktif.

Lift akan kembali ke lantai 1 ketika tidak memiliki target, tidak membawa penumpang, dan tidak memiliki antrean.

## Lingkungan Simulasi

Lingkungan divisualisasikan sebagai gedung 3D yang menampilkan:

- Struktur gedung SGLC.
- Empat shaft lift.
- Pergerakan kabin lift antar lantai.
- Titik antrean penumpang di lantai asal.
- Label bank timur dan barat.
- Label lantai.
- Jumlah penumpang di dalam lift dan antrean.

![Screenshot visualisasi 3D simulasi](placeholder-screenshot-app)

## Skenario Lalu Lintas

Simulasi menyediakan empat skenario:

| Skenario | Deskripsi |
| --- | --- |
| Normal | Kedatangan campuran dari lantai 1 dan lantai atas. |
| Jam masuk | 90% perjalanan dari lantai 1 menuju lantai atas. |
| Jam makan siang / pergantian kelas | Perpindahan dua arah antara lantai 1 dan lantai atas serta antar lantai atas. |
| Jam pulang | 90% perjalanan dari lantai atas menuju lantai 1. |

# IV. Desain dan Implementasi

## Struktur Kode

Struktur utama kode adalah sebagai berikut:

```txt
src/
  App.tsx
  components/
    controls/ControlPanel.tsx
    dashboard/MetricsPanel.tsx
    dashboard/ChartsPanel.tsx
    scene/BuildingScene.tsx
  hooks/
    useSimulation.ts
  simulation/
    constants.ts
    dispatch.ts
    engine.ts
    metrics.ts
    passengerGenerator.ts
    random.ts
    types.ts
docs/
  final-report.md
  model-assumptions.md
```

Keterangan:

- `App.tsx`: layout utama aplikasi.
- `ControlPanel.tsx`: kontrol parameter simulasi.
- `BuildingScene.tsx`: visualisasi gedung dan lift 3D.
- `MetricsPanel.tsx`: ringkasan metrik real-time.
- `ChartsPanel.tsx`: grafik tren metrik.
- `useSimulation.ts`: hook penghubung state React dan engine simulasi.
- `engine.ts`: logika utama pergerakan lift, boarding, alighting, dan update state.
- `passengerGenerator.ts`: pembangkitan penumpang stokastik.
- `dispatch.ts`: logika pemilihan bank dan lift.
- `metrics.ts`: perhitungan metrik performa.
- `constants.ts`: konfigurasi default, lantai valid, skenario, dan label dispatcher.

## Parameter Simulasi

| Parameter | Nilai Default | Keterangan |
| --- | ---: | --- |
| Durasi simulasi | 30 menit | Lama simulasi berjalan. |
| Arrival rate | 12 grup/menit | Rata-rata kedatangan grup penumpang. |
| Kapasitas lift | 14 orang | Kapasitas maksimum per lift. |
| Batas berat | 1100 kg | Batas berat maksimum lift. |
| Berat rata-rata penumpang | 70 kg | Asumsi berat per orang. |
| Waktu tempuh per lantai | 12 detik | Waktu lift berpindah satu lantai. |
| Boarding/alighting | 6 detik/orang | Waktu naik/turun per orang atau grup. |
| Speed demo | 10x | Kecepatan visualisasi. |
| Random seed | 2026 | Seed untuk reproduksibilitas. |

## Kontrol Interaktif

Pengguna dapat mengubah parameter simulasi secara langsung melalui aplikasi:

- Start, pause, reset, dan step 1 detik.
- Preset skenario lalu lintas.
- Strategi dispatcher.
- Arrival rate.
- Durasi simulasi.
- Speed demo.
- Kapasitas lift.
- Waktu tempuh per lantai.
- Waktu boarding/alighting.
- Random seed.

![Screenshot panel kontrol](placeholder-screenshot-control-panel)

## Visualisasi dan Embed Aplikasi

Aplikasi akan dideploy ke Vercel agar dapat dibuka dan disematkan pada Notion.

Link simulasi interaktif:

[Masukkan link Vercel di sini](placeholder-link-vercel)

Video demonstrasi:

[Masukkan link video demo di sini](placeholder-link-video-demo)

# V. Eksperimen dan Analisis Sensitivitas

## Desain Eksperimen

Analisis sensitivitas dilakukan dengan membandingkan beberapa kombinasi parameter:

| Eksperimen | Parameter yang Diubah | Tujuan |
| --- | --- | --- |
| Perbandingan skenario | Normal, jam masuk, jam makan siang, jam pulang | Melihat dampak pola perjalanan terhadap antrean dan waktu tunggu. |
| Perbandingan dispatcher | Nearest, round robin, collective | Menilai strategi penugasan lift paling efisien. |
| Perubahan arrival rate | Rendah, sedang, tinggi | Melihat batas kepadatan sistem. |
| Perubahan kapasitas lift | 8 sampai 14 orang | Melihat pengaruh kapasitas terhadap throughput. |

## Metrik Evaluasi

Metrik yang diamati:

- Average waiting time: rata-rata waktu tunggu sebelum naik lift.
- Maximum waiting time: waktu tunggu maksimum.
- Average travel time: rata-rata waktu perjalanan setelah naik lift.
- Served passengers: jumlah penumpang yang selesai dilayani.
- Remaining queue: jumlah penumpang yang masih mengantre.
- Throughput per minute: jumlah penumpang selesai per menit.
- Utilization by elevator: persentase waktu aktif tiap lift.
- Utilization by bank: rata-rata utilisasi bank timur dan barat.

## Template Hasil Eksperimen

| Skenario | Dispatcher | Arrival Rate | Avg Wait | Max Wait | Served | Remaining Queue | Insight Singkat |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Normal | Nearest | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |
| Jam masuk | Nearest | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |
| Jam makan siang | Nearest | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |
| Jam pulang | Nearest | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |
| Jam masuk | Round robin | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |
| Jam masuk | Collective | 12 | [isi] | [isi] | [isi] | [isi] | [isi] |

![Grafik hasil eksperimen](placeholder-grafik-hasil)

# VI. Analisis Hasil dan Insight

## Dampak Skenario Lalu Lintas

Pada skenario normal, permintaan lift tersebar lebih merata sehingga antrean cenderung lebih stabil. Pada skenario jam masuk, permintaan didominasi perjalanan dari lantai 1 menuju lantai atas, sehingga antrean dapat menumpuk di lantai dasar. Pada skenario jam pulang, arah dominan berubah menjadi lantai atas menuju lantai 1, sehingga beban lift lebih banyak berasal dari lantai atas.

Skenario jam makan siang atau pergantian kelas menghasilkan mobilitas dua arah. Kondisi ini dapat meningkatkan kompleksitas dispatcher karena lift harus melayani perjalanan naik, turun, dan antar lantai atas dalam waktu bersamaan.

## Dampak Strategi Dispatcher

Nearest valid elevator cenderung efektif pada kondisi normal karena memilih lift yang relatif dekat dan tidak terlalu sibuk. Round robin membagi permintaan secara merata, tetapi tidak selalu mempertimbangkan posisi lift. Collective/look-ahead berpotensi lebih baik pada jam sibuk karena mempertimbangkan arah gerak lift dan posisi penumpang.

## Dampak Arrival Rate

Semakin tinggi arrival rate, semakin besar peluang penumpang baru muncul setiap detik. Jika arrival rate melebihi kapasitas layanan lift, antrean akan meningkat dan waktu tunggu bertambah. Hal ini menunjukkan adanya batas kapasitas sistem.

## Insight Operasional

Insight utama dari simulasi:

- Jam masuk dan jam pulang merupakan kondisi paling kritis karena arah perjalanan terkonsentrasi.
- Dispatcher yang mempertimbangkan posisi dan arah lift lebih cocok untuk kondisi padat.
- Lantai 5 sebagai lantai overlap dapat membantu distribusi beban antara bank timur dan barat.
- Arrival rate tinggi dapat menyebabkan antrean bertambah meskipun semua lift aktif.
- Visualisasi 3D membantu memahami lokasi penumpukan antrean, bukan hanya angka metrik.

## Rekomendasi

Rekomendasi berdasarkan simulasi:

- Pada jam masuk, lift perlu diprioritaskan untuk mengangkut penumpang dari lantai 1 ke lantai atas.
- Pada jam pulang, sistem perlu cepat mengembalikan lift ke lantai atas atau mengatur pola layanan turun.
- Strategi dispatcher collective dapat dijadikan kandidat strategi utama untuk kondisi padat.
- Pengelola dapat menggunakan simulasi ini untuk menguji perubahan asumsi sebelum menerapkan kebijakan operasional.

# VII. Keterbatasan Model

Model ini memiliki beberapa keterbatasan:

- Data kedatangan penumpang masih berbasis asumsi, belum berasal dari observasi lapangan aktual.
- Perilaku individu seperti preferensi menunggu, memilih tangga, atau berpindah bank belum dimodelkan.
- Waktu boarding dan alighting dibuat sederhana dan belum membedakan jumlah orang secara detail pada kondisi penuh.
- Model belum memasukkan gangguan operasional seperti lift maintenance, pintu tertahan, atau overload aktual.
- Visualisasi gedung bersifat representatif, bukan model arsitektur presisi.

# VIII. Kesimpulan

Simulasi stokastik sistem lift SGLC berhasil memodelkan hubungan antara pola kedatangan penumpang, strategi dispatcher, kapasitas lift, dan performa layanan. Dengan visualisasi 3D interaktif, pengguna dapat mengamati perubahan antrean, pergerakan lift, dan metrik performa secara real-time.

Hasil simulasi menunjukkan bahwa performa sistem sangat dipengaruhi oleh pola lalu lintas. Jam masuk dan jam pulang menjadi skenario yang paling berpotensi menghasilkan antrean panjang karena arah perjalanan terkonsentrasi. Strategi dispatcher yang mempertimbangkan posisi dan arah lift berpotensi memberikan performa lebih baik dibandingkan pembagian sederhana.

Secara umum, simulasi ini dapat digunakan sebagai alat eksplorasi untuk memahami dinamika antrean lift dan mengevaluasi kebijakan layanan pada gedung bertingkat seperti SGLC.

# IX. Lampiran

- Link aplikasi Vercel: [isi setelah deploy]
- Link GitHub: [isi link repository]
- Link video demo: [isi link video]
- Link Notion project: [isi link Notion]
- Dokumentasi asumsi model: `docs/model-assumptions.md`
