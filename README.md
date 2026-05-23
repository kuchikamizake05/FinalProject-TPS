# SGLC Elevator Stochastic Simulation (Simulasi Lift SGLC UGM)

A premium, interactive **3D Real-Time Elevator Simulator** modeled specifically after the **SGLC (Smart Green Learning Center) Building, Faculty of Engineering, Universitas Gadjah Mada (UGM)**. This application uses a state-of-the-art **Dark Neumorphism (Soft UI)** design system and runs on stochastic trip distribution algorithms to evaluate and visualize elevator dispatching efficiency.

---

## 🌟 Fitur Utama

- **🎨 Premium Dark Neumorphism (Soft UI)**: Antarmuka super premium dengan kontur fisik 3D timbul (*extruded*) dan cekung (*inset*) menggunakan palet warna khusus **Steel Slate** (`#252c38`) yang sangat nyaman di mata.
- **🎮 Simulasi Interaktif 3D**: Rendering arsitektur gedung SGLC secara real-time berbasis **React Three Fiber (R3F)** & **Three.js** dengan rotasi orbital bebas, kontrol zoom fisik (*neumorphic capsule remote*), serta indikator jumlah penumpang melayang di atas lift.
- **📈 Tren Analitik Real-Time**: Visualisasi data tren analitik statistik dinamis berbasis **Recharts** (Waktu tunggu rata-rata, panjang antrean, jumlah orang terlayani) yang terintegrasi di dalam *dark inset well panel*.
- **⚡ Preset Skenario Lalu Lintas (Peak-Traffic)**:
  - **Normal**: Pola lalu lintas acak merata di semua lantai.
  - **Jam Masuk**: Jam sibuk pagi hari di mana 90% orang masuk dari lantai L1 dan menuju lantai ruang kuliah atas.
  - **Jam Makan Siang**: Mobilitas tinggi antar-lantai secara bolak-balik.
  - **Jam Pulang**: Jam sibuk sore hari di mana 90% orang turun dari lantai atas menuju L1 untuk meninggalkan gedung.
- **⚙️ Parameter Fleksibel**: Kustomisasi penuh kecepatan simulasi (*Speed Demo*), *Arrival Rate*, Kapasitas Lift, Waktu per Lantai, *Boarding/Alight Rate*, hingga kustomisasi *Random Seed* dan opsi *Advanced Dispatcher Strategies*.

---

## 🛠️ Stack Teknologi

1. **Frontend Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
2. **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/) (dengan utilitas Neumorphic kustom)
3. **3D Visualizer**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
4. **Data Visualization**: [Recharts](https://recharts.org/)
5. **Icon Pack**: [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai (Quick Start)

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan).

### Langkah Instalasi

1. **Klon Repositori**:
   ```bash
   git clone https://github.com/kuchikamizake05/FinalProject-TPS.git
   cd FinalProject-TPS
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di `http://localhost:5173`.

4. **Kompilasi Build Produksi**:
   ```bash
   npm run build
   ```
   Hasil build siap deploy akan berada di folder `/dist`.

---

## 📂 Struktur Direktori Utama

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

---

## ⚙️ Prinsip Desain Neumorphism (Soft UI)
Tema ini bergantung pada keselarasan warna latar belakang dan bayangan untuk menciptakan ilusi timbul dan cekung:
- **Timbul (Extruded Flat)**: `shadow-neu-flat` menggambarkan tombol/kartu fisik yang melayang.
- **Cekung (Inset Well)**: `shadow-neu-inset` menggambarkan panel layar, grafik, dropdown, dan tombol yang sedang ditekan.
- **Warna Dasar**: `#252c38` (Base Slate) dan `#1c222b` (Recessed Slate).

---

## 📝 Lisensi
Proyek ini dibuat sebagai bagian dari Tugas Akhir mata kuliah **Teknologi Penjadwalan & Simulasi (TPS)**, Departemen Teknik Elektro & Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada.
