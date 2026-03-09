<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Disposisi App - Simulasi Backup</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p class="text-lg font-semibold text-gray-700 mb-2">Status Koneksi WebSocket:</p>
          <div
            :class="['p-3 rounded-md text-center font-medium', isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ isConnected ? 'Terhubung ke Server!' : 'Terputus dari Server' }}
          </div>
        </div>

        <div>
          <p class="text-lg font-semibold text-gray-700 mb-2">Pesan dari Server (Echo):</p>
          <div
            class="bg-gray-50 p-3 rounded-md border border-gray-200 min-h-[60px] flex items-center justify-center text-gray-600 italic">
            {{ latestMessage || 'Menunggu pesan...' }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 mb-8">
        <input v-model="messageToSend" type="text" placeholder="Ketik pesan ke server..."
          class="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        <button @click="sendMessage" :disabled="!isConnected"
          class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Kirim Pesan ke Server
        </button>

        <button @click="triggerSimulatedBackup" :disabled="!isConnected || !selectedTargetId"
          class="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Mulai Backup Tabel Terpilih
        </button>

        <select v-model="selectedTargetId"
          class="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          <option :value="null" disabled>-- Pilih tabel untuk di-backup --</option>
          <option v-for="target in backupTargets" :key="target.id" :value="target.id">
            {{ target.table_name }} (Schema: {{ target.schema_name }})
          </option>
        </select>

        <button @click="triggerSimulatedBackup" :disabled="!isConnected"
          class="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Mulai 1 Simulasi Backup
        </button>

        <button @click="triggerFiveSimulatedBackups" :disabled="!isConnected"
          class="w-full px-4 py-2 bg-pink-600 text-white font-semibold rounded-md shadow-md hover:bg-pink-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          Mulai 5 Simulasi Backup Sekaligus
        </button>
      </div>

      <div class="mb-6">
        <p class="text-lg font-semibold text-gray-700 mb-2">Daftar Status Backup:</p>
        <div class="bg-blue-50 p-4 rounded-md border border-blue-200 min-h-[150px] text-blue-800">
          <p v-if="ongoingBackups.length === 0" class="italic text-gray-600 text-center">Belum ada proses backup yang
            dimulai.</p>
          <ul v-else class="space-y-3">
            <li v-for="backup in ongoingBackups" :key="backup.id" class="p-3 rounded-md border" :class="{
              'bg-white border-gray-300': backup.status === 'PENDING' || backup.status === 'IN_PROGRESS',
              'bg-green-100 border-green-300': backup.status === 'SUCCESS',
              'bg-red-100 border-red-300': backup.status === 'FAILED'
            }">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-bold">Job ID:</span> <span class="font-mono text-xs">{{ backup.id }}</span><br>
                  <span class="font-bold">Target ID:</span> {{ backup.target_id }}<br>
                  <span class="font-bold">Status:</span>
                  <span :class="{
                    'font-bold': true,
                    'text-green-600': backup.status === 'SUCCESS',
                    'text-yellow-600': backup.status === 'IN_PROGRESS',
                    'text-red-600': backup.status === 'FAILED',
                    'text-gray-500': backup.status === 'PENDING'
                  }">
                    {{ backup.status.toUpperCase().replace('_', ' ') }}
                  </span><br>
                  <div v-if="backup.status === 'IN_PROGRESS'"
                    class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-2">
                    <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: backup.progress + '%' }"></div>
                  </div>
                  <span class="text-sm text-gray-500">{{ new Date(backup.started_at ||
                    backup.timestamp).toLocaleString() }}</span>
                  <p v-if="backup.message" class="text-sm italic text-gray-600 mt-1">{{ backup.message }}</p>
                </div>
                <button v-if="backup.status === 'SUCCESS'" @click="downloadBackup(backup.id)"
                  class="ml-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-300">
                  Unduh
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { io } from 'socket.io-client';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const isConnected = ref(false);
const latestMessage = ref('');
const messageToSend = ref('');
const ongoingBackups = ref([]);
const backupTargets = ref([]); // State baru untuk menyimpan daftar target
const selectedTargetId = ref(null); // State baru untuk menyimpan ID target yang dipilih

// Kunci untuk localStorage
const LOCAL_STORAGE_KEY = 'disposisi_ongoing_backups';

// URL dasar Backend API (Sesuaikan dengan APP_PORT di .env Backend Anda)
const BACKEND_HTTP_BASE_URL = 'http://localhost:8080';
// URL WebSocket (Sesuaikan dengan WS_PORT di .env Backend Anda)
const WEBSOCKET_URL = 'http://localhost:8080';
// Base path API (Sesuaikan dengan yang di AppController NestJS)
const API_BASE_PATH = '/api/v1/auth-sso';


// Inisialisasi koneksi Socket.IO
const socket = io(WEBSOCKET_URL);

onMounted(async () => {
  // --- Memuat Status Backup dari LocalStorage saat aplikasi dimuat ---
  try {
    const storedBackups = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedBackups) {
      ongoingBackups.value = JSON.parse(storedBackups);
      console.log('Status backup dimuat dari localStorage:', ongoingBackups.value);
    }

    // --- Memuat Daftar Target Backup dari Backend ---
    try {
      const response = await fetch(`${BACKEND_HTTP_BASE_URL}${API_BASE_PATH}/backup-targets`);
      if (!response.ok) {
        throw new Error('Gagal memuat daftar target backup.');
      }
      const targets = await response.json();
      backupTargets.value = targets;
      console.log('Daftar target backup berhasil dimuat:', targets);
      // Jika hanya ada satu target, otomatis pilih target tersebut
      if (targets.length > 0) {
        selectedTargetId.value = targets[0].id;
      }
    } catch (error) {
      console.error(error);
    }
  } catch (e) {
    console.error('Gagal memuat status backup dari localStorage:', e);
  }

  // Event listener saat koneksi berhasil
  socket.on('connect', () => {
    isConnected.value = true;
    console.log('Connected to WebSocket server!');

    // --- Memuat Status Backup dari Backend setelah koneksi WebSocket ---
    console.log('Memuat status backup yang ada dari backend...');
    fetch(`${BACKEND_HTTP_BASE_URL}${API_BASE_PATH}/all-backup-statuses`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Gagal memuat status backup dari backend: ${response.statusText}`);
        }
      })
      .then(existingBackups => {
        if (existingBackups && existingBackups.length > 0) {
          ongoingBackups.value = existingBackups;
          console.log('Status backup disinkronkan dari backend:', existingBackups);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ongoingBackups.value));
        }
      })
      .catch(error => {
        console.error('Error saat memuat status backup dari backend:', error);
      });
  });

  // Event listener saat koneksi terputus
  socket.on('disconnect', () => {
    isConnected.value = false;
    console.log('Disconnected from WebSocket server!');
  });

  // Event listener untuk pesan konfirmasi koneksi dari server
  socket.on('connectionStatus', (message) => {
    latestMessage.value = message;
  });

  // Event listener untuk pesan yang di-echo kembali dari server
  socket.on('messageReceived', (message) => {
    latestMessage.value = message;
  });

  // Event listener untuk pesan broadcast dari server
  socket.on('broadcastMessage', (message) => {
    console.log('Broadcast:', message);
  });

  // Event listener UTAMA untuk update status backup dari Backend
  socket.on('backupStatus', (data) => {
    console.log('Backup Status Update Received:', data);
    const index = ongoingBackups.value.findIndex(b => b.id === data.id);
    if (index !== -1) {
      ongoingBackups.value[index] = { ...ongoingBackups.value[index], ...data };
    } else {
      ongoingBackups.value.unshift(data); // Tambahkan ke awal array
    }
  });
});

onBeforeUnmount(() => {
  if (socket.connected) {
    socket.disconnect();
  }
});

// Watcher untuk menyimpan ke localStorage setiap kali ongoingBackups berubah
watch(ongoingBackups, (newVal) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVal));
    console.log('Status backup disimpan ke localStorage.');
  } catch (e) {
    console.error('Gagal menyimpan status backup ke localStorage:', e);
  }
}, { deep: true });

const sendMessage = () => {
  if (socket.connected && messageToSend.value.trim()) {
    socket.emit('sendMessage', messageToSend.value);
    messageToSend.value = '';
  }
};

// Fungsi untuk memicu 1 simulasi backup tunggal
const triggerSimulatedBackup = async () => {
  if (!isConnected.value || !selectedTargetId.value) {
    alert('Harap hubungkan ke server dan pilih tabel yang akan di-backup.');
    return;
  }

  // Simulasi payload dari frontend
  const payload = {
    target_id: selectedTargetId.value, // Gunakan ID dari dropdown
    user_id: 1 // ID user hardcoded
  };

  try {
    // Panggil endpoint dengan metode POST dan body
    const response = await fetch(`${BACKEND_HTTP_BASE_URL}${API_BASE_PATH}/request-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to trigger backup');
    }

    const data = await response.json();
    console.log('Backend response for simulation trigger:', data);
    // State 'pending' akan otomatis ditambahkan oleh server via WebSocket
  } catch (error) {
    console.error('Error triggering simulated backup:', error);
    alert('Gagal memicu simulasi backup. Pastikan Backend NestJS berjalan dan endpointnya benar.');
  }
};

// Fungsi untuk memicu 5 simulasi backup sekaligus
const triggerFiveSimulatedBackups = async () => {
  if (!isConnected.value) {
    alert('Tidak terhubung ke server WebSocket.');
    return;
  }

  const promises = [];
  for (let i = 0; i < 5; i++) {
    const payload = {
      target_id: Math.floor(Math.random() * 100) + 1,
      // user_id: 123 + i
      user_id: 1
    };

    // PANGGIL ENDPOINT BACKEND API YANG MENGIRIM TUGAS KE RABBITMQ
    promises.push(
      fetch(`${BACKEND_HTTP_BASE_URL}${API_BASE_PATH}/request-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(async response => {
          console.log(response, 'ini response')
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to trigger backup #${i + 1}`);
          }
          return response.json();
        })
        .then(data => console.log(`Backend response for simulation #${i + 1}:`, data))
        .catch(error => console.error(`Error triggering simulated backup #${i + 1}:`, error))
    );
  }
  alert('5 simulasi backup telah dipicu. Cek "Daftar Status Backup" untuk melihat perkembangannya.');
};


// --- Fungsi BARU untuk Mengunduh Backup ---
const downloadBackup = (backupId) => {
  // Buat URL unduhan ke backend Anda
  const downloadUrl = `${BACKEND_HTTP_BASE_URL}${API_BASE_PATH}/download-backup/${backupId}`;

  // Memicu unduhan dengan membuka URL di tab/jendela baru
  // Ini akan menyebabkan browser mengunduh file yang dikirim oleh backend
  window.open(downloadUrl, '_blank');
  alert(`Memicu unduhan untuk Backup ID: ${backupId}`);
};
</script>
