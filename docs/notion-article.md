# 📑 Template Artikel Notion: Simulasi Stokastik Sistem Lift SGLC

*(Salin seluruh konten di bawah ini dan tempel (paste) ke halaman Notion Anda. Blok dan format seperti callout/quote akan otomatis menyesuaikan dengan Notion.)*

---

# Simulasi Stokastik Sistem Lift SGLC dengan 4 Lift

💡 **Ringkasan Proyek:**
> Proyek ini memodelkan sistem antrean dan transportasi vertikal di Gedung Smart and Green Learning Center (SGLC) FT UGM. Menggunakan pendekatan antrean multi-pelayan dan simulasi *discrete-event*, proyek ini bertujuan menemukan hambatan antrean dan mengoptimalkan performa waktu tunggu mahasiswa.

---

## 1. 🏗️ Latar Belakang dan Penjelasan Masalah

Gedung Smart and Green Learning Center (SGLC) FT UGM memiliki intensitas pergerakan mahasiswa yang tinggi. Gedung ini menggunakan 4 unit lift yang terbagi menjadi dua *bank* layanan:
*   **Bank Timur:** Melayani Lantai 1, 4, 5, 6, dan 7.
*   **Bank Barat:** Melayani Lantai 1, 5, 8, 9, 10, dan 11.
*   **Lantai Overlap:** Lantai 5 adalah satu-satunya lantai yang dilayani oleh kedua bank.

**Masalah Utama:** Antrean yang panjang sering terjadi di Lantai 1 saat *jam masuk* dan penumpukan penumpang di lantai atas pada *jam pulang*.

**[ 📷 INSERT FOTO/ILUSTRASI: Masukkan foto nyata antrean lift SGLC atau diagram pembagian lantai Bank Timur & Barat di sini ]**

---

## 2. 🧮 Pemodelan Sistem

Pemodelan ini menggunakan **Teori Antrean (Queueing Theory)** dan **Simulasi Kejadian Diskrit (Discrete Event Simulation - DES)**.
*   **Konsep:** Multi-server queueing system yang bersifat *on-demand*.
*   **Time-step:** Waktu dimajukan bertahap dalam *tick* 1 detik.
*   **Referensi:** *Elevator Traffic Handbook: Theory and Practice* oleh G. Barney (2003).

**[ 🎥 INSERT VIDEO/GIF: Rekaman layar singkat yang menunjukkan aplikasi simulasi 3D Anda berjalan (menunjukkan waktu, tick, atau penumpang yang muncul) ]**

---

## 3. ⚙️ Desain Sistem dan Asumsi

Simulasi ini dikembangkan menggunakan bahasa **TypeScript** dengan kerangka **React**. Lingkungan visual 3D dibangun menggunakan **Three.js**.

### Parameter & Asumsi
*   **Kapasitas:** 14 orang per lift / 1100 kg.
*   **Waktu Tempuh:** Rata-rata 12 detik per lantai.
*   **Waktu Pintu (Boarding/Alighting):** 6 detik per rombongan.
*   **Distribusi Kedatangan:** Menggunakan distribusi *discrete uniform* (rombongan 1-3 orang).

### Skenario Uji Coba
1.  **Normal:** Pergerakan acak, dominasi dari Lantai 1.
2.  **Jam Masuk (Up-Peak):** Gelombang masuk dari Lantai 1 ke atas.
3.  **Pergantian Kelas (Interfloor):** Perpindahan padat antar lantai atas.
4.  **Jam Pulang (Down-Peak):** Gelombang turun dari lantai atas ke Lantai 1.

**[ 📷 INSERT GAMBAR: Screenshot dari kodingan (snippet TypeScript) bagian `engine.ts` atau `dispatch.ts` yang menurut Anda paling krusial / menarik ]**

---

## 4. 🎮 Simulasi Interaktif & Analisis Sensitifitas

Coba jalankan sendiri simulasi pada aplikasi interaktif yang telah di-*deploy*!

**[ 🌐 INSERT EMBED: Ketik `/embed` di Notion, lalu paste Link Web App Simulasi (Vercel/Netlify) Anda agar aplikasi bisa dimainkan langsung di dalam Notion ]**
👉 *Tautan alternatif jika embed gagal: [Link Aplikasi Simulasi SGLC](masukkan-link-disini.com)*

### Analisis Sensitifitas
*Bagaimana jika mahasiswa datang 50% lebih banyak dari biasanya?*
**[ 📊 INSERT GAMBAR/CHART: Screenshot grafik metrik (Average Waiting Time vs Arrival Rate) dari dashboard aplikasi saat diuji dengan arrival multiplier yang tinggi ]**
> **Hasil Analisis:** Jika *arrival rate* dinaikkan, rata-rata waktu tunggu (*AWT*) melonjak tajam melewati batas kenyamanan 2 menit. Perubahan parameter kecepatan buka/tutup pintu memiliki efek penundaan konstan, tidak se-ekstrem dampak lonjakan *demand*.

---

## 5. 💡 Analisis Hasil dan Insight

Dari percobaan berbagai skenario, ditemukan beberapa temuan penting:

1.  **Bottleneck pada Down-Peak (Jam Pulang):** Lift yang turun dari Lantai 11 akan cepat terisi penuh. Akibatnya, penumpang di lantai tengah (seperti Lantai 8 atau 9) mengalami fenomena *starvation* (ditinggalkan karena lift penuh).
2.  **Lantai 5 sebagai Penyeimbang (Load Balancer):** Karena dilayani dua bank, mahasiswa di lantai 5 secara natural akan memilih antrean bank lift yang lebih sepi, yang secara signifikan memperbaiki keseimbangan beban lalu lintas gedung.
3.  **Keuntungan Rute Ekspres:** Pembagian bank Timur dan Barat secara efektif memangkas *Round Trip Time (RTT)* karena lift Barat tidak perlu berhenti di lantai 4, 6, dan 7.

**[ 🎥 INSERT VIDEO/GIF: Rekaman layar aplikasi Anda saat skenario "Jam Pulang" (Down-Peak) untuk menunjukkan visualisasi lift yang langsung penuh di lantai teratas ]**

---

## 6. 🏁 Kesimpulan

Sistem zonasi bank lift di SGLC sudah efektif bertindak sebagai *express route* untuk mendistribusikan penumpang dengan cepat. Namun, manajemen antrean di jam pulang tetap membutuhkan intervensi strategis (misalnya pengaturan jadwal kelas agar tidak bubar serentak) untuk mencegah antrean tak tertangani di lantai tengah.

Aplikasi simulasi ini berhasil memvisualisasikan masalah antrean yang tak terlihat (*invisible queues*) dan dapat digunakan sebagai alat bantu analisis untuk manajemen lalu lintas di masa depan.

---
*Dibuat menggunakan React, Three.js, TailwindCSS, dan TypeScript.*