<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { MasterUmum, AssignPenugasanApi } from '~/apis'

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Dashboard BSSN TTE'
layoutStore.setTitleBreadcrumb(pageTitle, `BSSN > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

const { session } = await useSession()

const token = session.value?.token

const totalBelumProses = ref(0)
const totalSudahDiterima = ref(0)
const totalDiApprove = ref(0)
const totalDitolak = ref(0)
const totalMenungguVerifikasi = ref(0)

// Simulasi data (ganti dengan data asli dari API)
const fetchData = async () => {

  const result = await AssignPenugasanApi.getDataDashboard(token)

  if(result){
    totalBelumProses.value = result.total_proses;
    totalMenungguVerifikasi.value = result.total_waiting
    totalDiApprove.value = result.total_approve
  }

}

onMounted( async () => {
  await fetchData()
  await renderChart() // Render chart when data is fetched
})

// Fungsi untuk merender grafik
const renderChart = () => {
  const ctx = document.getElementById('tteChart') as HTMLCanvasElement
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Belum Diproses', 'Menunggu Verifikasi', 'Di-Approve'],
      datasets: [{
        label: 'Jumlah Dokumen',
        data: [
          totalBelumProses.value,
          totalMenungguVerifikasi.value,
          totalDiApprove.value,
        ],
        backgroundColor: ['#003366', '#FFD700', '#0099FF'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(totalDiApprove.value, 200) // Atur batas maksimum
        }
      }
    }
  })
}

</script>
<template>
  <SectionMain>
    <div class="landing-page bg-gray-100 font-sans text-gray-800">
      <header class="bg-blue-800 text-white text-center py-16">
        <h1 class="text-4xl font-semibold mb-4">Dashboard TTE</h1>
        <p class="text-lg">Solusi Digital untuk Penugasan dan Proses Tanda Tangan Elektronik</p>
      </header>

      <!-- Dashboard Cards -->
      <section class="dashboard-stats p-8 mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <div class="stat-card bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-2xl font-semibold text-blue-800 mb-2">Proses</h3>
          <p class="text-lg text-gray-600">{{ totalBelumProses }} Dokumen</p>
          <p class="text-sm text-gray-500 mt-2">Data yang belum di Assign / Penugasan dari AKSI ke SRS5G</p>
        </div>

        <div class="stat-card bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-2xl font-semibold text-blue-800 mb-2">Menunggu Verifikasi</h3>
          <p class="text-lg text-gray-600">{{ totalMenungguVerifikasi }} Dokumen</p>
          <p class="text-sm text-gray-500 mt-2">Data yang sedang menunggu proses verifikasi oleh pejabat terkait.</p>
        </div>

        <div class="stat-card bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-2xl font-semibold text-blue-800 mb-2">Sudah Di-Approve</h3>
          <p class="text-lg text-gray-600">{{ totalDiApprove }} Dokumen</p>
          <p class="text-sm text-gray-500 mt-2">Data yang telah disetujui dan siap untuk diproses lebih lanjut atau diselesaikan.</p>
        </div>
      </section>

      <!-- Grafik Pengajuan TTE -->
      <section class="charts-section p-8 mx-auto max-w-6xl bg-white rounded-lg shadow-md mt-8">
        <h2 class="text-3xl font-semibold text-blue-800 mb-4">Statistik Pengajuan TTE</h2>
        
        <div class="chart-container">
          <!-- Grafik Chart.js -->
          <canvas id="tteChart" class="w-full h-64"></canvas>
        </div>
      </section>

      <!-- List Dokumen Terbaru -->
      <section class="recent-docs p-8 mx-auto max-w-6xl bg-white rounded-lg shadow-md mt-8">
        <h2 class="text-3xl font-semibold text-blue-800 mb-4">Dokumen BSSN</h2>
        <ul class="list-disc pl-8">
            <li>KD001 - LEGALISIR IJAZAH</li>
            <li>KD002 - SERTIFIKAT</li>
            <li>KD003 - SURAT KETERANGAN (SK)</li>
            <li>KD004 - IJAZAH</li>
            <li>KD005 - TRANSKRIP</li>
        </ul>
      </section>

      <!-- Call-to-Action Section -->
      <section class="call-to-action p-8 mx-auto max-w-4xl bg-blue-800 text-white rounded-lg shadow-md mt-8 text-center">
        <h2 class="text-3xl font-semibold mb-4">Mulai Gunakan Aplikasi TTE Sekarang</h2>
        <p class="mb-6">Segera manfaatkan fitur-fitur hebat dari aplikasi Tanda Tangan Elektronik untuk mempercepat dan mempermudah proses administrasi Anda.</p>
        <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full text-xl transition duration-300">
          Pelajari Lebih Lanjut
        </button>
      </section>

      <!-- Footer -->
      <footer class="footer bg-blue-800 text-white text-center py-4 mt-8">
        <p>&copy; 2025 Universitas Terbuka - Powered by DSI</p>
      </footer>
    </div>
  </SectionMain>
</template>
