# Simulasi Lift Stokastik SGLC UGM

Repositori ini berisi sistem simulasi dan visualisasi 3D real-time untuk pergerakan lift di gedung SGLC (Smart Green Learning Center), Fakultas Teknik, Universitas Gadjah Mada (UGM). Proyek ini dikembangkan untuk menganalisis dan mengevaluasi efisiensi berbagai strategi dispatcher lift menggunakan pemodelan lalu lintas stokastik.

## Fitur Utama

- **Visualisasi 3D Real-Time**: Rendering arsitektur vertikal gedung SGLC dan pergerakan kabin lift secara real-time berbasis Three.js dan React Three Fiber (R3F), dilengkapi dengan kontrol zoom orbital.
- **Model Lalu Lintas Stokastik (Peak-Traffic Scenarios)**:
  - **Normal**: Pola sebaran kedatangan acak di seluruh lantai.
  - **Jam Masuk**: Konsentrasi kedatangan pagi hari dengan 90% penumpang masuk melalui lantai 1 (L1) menuju ruang kuliah di lantai atas.
  - **Jam Makan Siang**: Mobilitas dua arah yang tinggi antar lantai.
  - **Jam Pulang**: Jam sibuk sore hari dengan 90% penumpang turun dari lantai atas menuju lantai 1 (L1).
- **Analisis Kinerja Terintegrasi**: Visualisasi tren metrik statistik real-time (waktu tunggu rata-rata, panjang antrean aktif, total penumpang terlayani) menggunakan Recharts.
- **Konfigurasi Parameter Fleksibel**: Kemampuan menyesuaikan parameter simulasi seperti *arrival rate*, kapasitas lift, waktu tempuh antar lantai, *boarding time*, *random seed*, serta pilihan algoritma dispatcher.
- **Desain Antarmuka Teroptimasi**: Implementasi gaya visual Neumorphic dengan palet warna Steel Slate (#252c38) yang dirancang untuk kenyamanan visual jangka panjang dan kejelasan informasi metrik.

## Stack Teknologi

- **Kerangka Kerja Utama**: React + TypeScript + Vite
- **Visualisasi 3D**: Three.js, @react-three/fiber, @react-three/drei
- **Grafik Tren**: Recharts
- **Gaya Visual**: Tailwind CSS v4 (Utilitas Neumorphic Kustom)
- **Ikon**: Lucide React

## Panduan Instalasi dan Pengembangan

### Prasyarat
- Node.js (versi 18 ke atas)

### Langkah-Langkah

1. **Klon Repositori**:
   ```bash
   git clone https://github.com/kuchikamizake05/FinalProject-TPS.git
   cd FinalProject-TPS
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Menjalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

4. **Melakukan Build Produksi**:
   ```bash
   npm run build
   ```
   Hasil build siap pakai akan digenerasikan di direktori `/dist`.

## Struktur Direktori

```
FinalProject-TPS/
├── src/
│   ├── components/
│   │   ├── controls/       # Parameter Simulasi & Tombol Preset
│   │   ├── dashboard/      # Live Metrics & Grafik Tren Recharts
│   │   └── scene/          # Scene Arsitektur 3D Gedung SGLC & Lift
│   ├── hooks/              # Custom Hook state mesin simulasi
│   ├── simulation/         # Algoritma antrean & Generator trip stokastik
│   ├── App.tsx             # Entry Shell Layout Utama
│   ├── index.css           # Sistem desain bayangan Neumorphic
│   └── main.tsx            # React DOM mounting
├── package.json
└── vite.config.ts
```

## Lisensi & Hak Cipta
Proyek ini dibuat sebagai bagian dari Tugas Akhir mata kuliah **Teknologi Penjadwalan & Simulasi (TPS)**, Departemen Teknik Elektro & Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada (UGM).

