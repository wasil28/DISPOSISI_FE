<script setup lang="ts">
import { onMounted, ref } from 'vue'

useHead({
  title: 'Disposisi App - Developer Documentation',
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

const { session } = await useSession()

// --- TABS STATE ---
const activeTab = ref('tech-stack')

const tabs = [
  { id: 'tech-stack', name: 'Stack Teknologi', icon: 'i-mdi-layers' },
  { id: 'session', name: 'Manajemen Sesi & Auth', icon: 'i-mdi-shield-account' },
  { id: 'api', name: 'Integrasi API', icon: 'i-mdi-api' },
  { id: 'crud', name: 'Panduan Modul CRUD', icon: 'i-mdi-database-edit' },
]

const currentUser = ref<any>(null)

onMounted(() => {
  currentUser.value = session.value?.userBssn || session.value?.activeRole?.role || session.value?.user || null
})
</script>

<template>
  <div class="bg-slate-50 min-h-screen text-slate-800 font-sans p-6 lg:p-10">
    <header class="mb-10 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-6">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <UnoIcon class="i-mdi-rocket-launch text-blue-600" />
          Selamat Datang di Disposisi App
        </h1>
        <p class="mt-2 text-lg text-slate-600 max-w-2xl">
          Dashboard ini adalah pengenalan interaktif. Gunakan panduan ini untuk memahami arsitektur dan standar coding
          di aplikasi ini.
        </p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[250px]">
        <div
          class="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
        >
          {{ currentUser?.name?.substring(0, 2)?.toUpperCase() || 'AD' }}
        </div>
        <div>
          <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Login Aktif
          </p>
          <p class="font-bold text-slate-800">
            {{ currentUser?.name || 'Administrator' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ session?.activeRole?.role?.name || 'Developer' }}
          </p>
        </div>
      </div>
    </header>

    <!-- TABS NAVIGATION -->
    <div class="flex space-x-2 border-b border-slate-200 mb-8 overflow-x-auto pb-2">
      <button
        v-for="tab in tabs" :key="tab.id"
        class="px-6 py-3 rounded-t-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        :class="[
          activeTab === tab.id
            ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
        ]" @click="activeTab = tab.id"
      >
        <UnoIcon :class="tab.icon" class="text-lg" />
        {{ tab.name }}
      </button>
    </div>

    <!-- TAB CONTENTS -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
      <!-- 1. TECH STACK SECTION -->
      <section v-if="activeTab === 'tech-stack'" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UnoIcon class="i-mdi-layers text-blue-500" /> Stack Teknologi Kita
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-5 border border-slate-200 rounded-xl hover:shadow-md transition">
            <h3 class="font-bold text-lg mb-2 text-green-600">
              Nuxt 3 & Vue 3
            </h3>
            <p class="text-slate-600 text-sm">
              Framework SSR utama kita. Menggunakan <code
                class="bg-slate-100 px-1 rounded text-pink-600"
              >&lt;script setup&gt;</code> (Composition API).
            </p>
          </div>
          <div class="p-5 border border-slate-200 rounded-xl hover:shadow-md transition">
            <h3 class="font-bold text-lg mb-2 text-sky-500">
              Tailwind CSS & UnoCSS
            </h3>
            <p class="text-slate-600 text-sm">
              Utility-first CSS. Hindari menulis CSS murni di &lt;style&gt;, gunakan class panjang. Gunakan <code
                class="bg-slate-100 px-1 rounded text-pink-600"
              >&lt;UnoIcon class="i-mdi-xyz" /&gt;</code> untuk icon.
            </p>
          </div>
          <div class="p-5 border border-slate-200 rounded-xl hover:shadow-md transition">
            <h3 class="font-bold text-lg mb-2 text-yellow-500">
              Pinia State Management
            </h3>
            <p class="text-slate-600 text-sm">
              Pengganti Vuex. Digunakan secara global di <code
                class="bg-slate-100 px-1 rounded text-pink-600"
              >stores/</code> untuk menyimpan data Sesi dan Menu.
            </p>
          </div>
          <div class="p-5 border border-slate-200 rounded-xl hover:shadow-md transition">
            <h3 class="font-bold text-lg mb-2 text-red-500">
              Zod Validation & Nuxt UI
            </h3>
            <p class="text-slate-600 text-sm">
              Gunakan <code class="bg-slate-100 px-1 rounded text-pink-600">z.object({...})</code> untuk representasi
              form.
            </p>
          </div>
        </div>
      </section>

      <!-- 2. SESSION & AUTH SECTION -->
      <section v-if="activeTab === 'session'" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UnoIcon class="i-mdi-shield-account text-green-500" /> Cek Auth Token & Sesi
        </h2>
        <p class="mb-4 text-slate-600">
          Aplikasi ini membagikan session melewati middleware dan Pinia custom composable bernama <code
            class="bg-slate-100 px-1 rounded text-pink-600"
          >useSession()</code>. Middleware <code
            class="bg-slate-100 px-1 rounded text-pink-600"
          >otorisasi.ts</code> menjaga halaman.
        </p>
        <div class="bg-slate-900 text-green-400 p-5 rounded-xl overflow-x-auto text-sm font-mono shadow-inner mb-6">
          <pre><code>// Mengambil session aktif
&lt;script setup lang="ts"&gt;
  const { session, update, remove } = await useSession()
  const token = session.value.token // Bearer JWT token
  const role = session.value.activeRole?.role?.kode // e.g: "RL10"
&lt;/script&gt;</code></pre>
        </div>
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="font-bold text-blue-800 mb-2">
            Live Debug Current Session:
          </p>
          <p class="text-sm font-mono text-slate-700 break-all">
            <strong>Token:</strong> {{ session?.token ? `${session.token.substring(0, 30)}...` : 'Tidak ada token' }}
            <br>
            <strong>Role Code:</strong> {{ session?.activeRole?.role?.kode || 'N/A' }} <br>
            <strong>Menu Access Allowed:</strong> {{ session?.menuAside?.length || 0 }} Modul Sidebar.
          </p>
        </div>
      </section>

      <!-- 3. API FETCHING SECTION -->
      <section v-if="activeTab === 'api'" class="animate-fade-in">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UnoIcon class="i-mdi-api text-purple-500" /> Cara Memanggil Endpoint API Terpusat
        </h2>
        <p class="mb-4 text-slate-600">
          Semua fetch dipusatkan di <code class="bg-slate-100 px-1 rounded text-pink-600">src/apis/</code>. Hindari
          menggunakan `useFetch()` mentah di dalam `.vue`.
        </p>
        <div class="bg-slate-900 text-purple-300 p-5 rounded-xl overflow-x-auto text-sm font-mono shadow-inner">
          <pre><code>import { AuthApi } from '~/apis'
import { handleApiError, withLoading } from '~/utils/error.handler.ts'

const loadData = async () => {
  try {
     const response = await withLoading(() => AuthApi.getMenu(roleId, headers))
     if(response.status === 200) data.value = response.data;
  } catch (error) {
     handleApiError(error)
  }
}</code></pre>
        </div>
      </section>

      <!-- 4. CRUD DIRECTORY SECTION -->
      <section v-if="activeTab === 'crud'" class="animate-fade-in pb-12">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 border-b pb-4 border-slate-200">
          <UnoIcon class="i-mdi-database-edit text-orange-500" /> Panduan End-to-End Membuat Modul CRUD
        </h2>

        <div class="space-y-8">
          <!-- TAHAP 1: FRONTEND -->
          <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 class="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
              <span
                class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md font-bold"
              >1</span>
              Sisi Frontend (FE): Setup Halaman & State
            </h3>

            <div class="space-y-6">
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                  <UnoIcon class="i-mdi-code-tags text-blue-500" />
                  A. Definisi Komponen & Middleware (`&lt;script setup&gt;`)
                </h4>
                <p class="text-slate-600 text-sm mb-4 leading-relaxed">
                  Semua halaman wajib didaftarkan di dalam folder <code
                    class="bg-slate-100 px-1.5 py-0.5 rounded text-pink-600"
                  >src/pages/adminpanel/[nama-modul]/index.vue</code>.
                  Gunakan <strong>middleware 'otorisasi'</strong> untuk otentikasi.
                </p>
                <div
                  class="bg-slate-900 text-sky-300 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner mb-4"
                >
                  <pre><code>&lt;script setup lang="ts"&gt;
// 1. Daftarkan Middleware & Layout (Wajib untuk halaman Admin)
definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

// 2. Akses State Sesi Login saat ini
const { session } = await useSession()
const currentRole = session.value?.activeRole?.role?.kode

// 3. Setup Hak Akses Tombol
const allow_new = ref(true)
const allow_edit = ref(true)
const allow_delete = ref(true)

// 4. Setup State UI (Modal & Data)
const isModalOpen = ref(false)
const tableData = ref([])
&lt;/script&gt;</code></pre>
                </div>
              </div>

              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                  <UnoIcon class="i-mdi-brush text-indigo-500" />
                  B. Membuat Tampilan UI (`&lt;template&gt;`)
                </h4>
                <div class="bg-slate-900 text-orange-200 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner">
                  <pre><code>&lt;template&gt;
  &lt;div class="p-6"&gt;
    &lt;div class="flex justify-between items-center mb-6"&gt;
       &lt;h1 class="text-2xl font-extrabold text-slate-800"&gt;Manajemen Modul&lt;/h1&gt;
       &lt;UButton v-if="allow_new" color="blue" icon="i-mdi-plus" @click="isModalOpen = true"&gt;Tambah Data&lt;/UButton&gt;
    &lt;/div&gt;

    &lt;!-- Tabel Data --&gt;
    &lt;div class="bg-white border border-slate-200 rounded-xl shadow-sm"&gt;
       &lt;UTable :rows="tableData" /&gt;
    &lt;/div&gt;

    &lt;!-- Slideover Modal Form --&gt;
    &lt;USlideover v-model="isModalOpen"&gt;
       &lt;div class="p-6"&gt;
          &lt;h2 class="text-xl font-bold mb-4"&gt;Formulir Input&lt;/h2&gt;
          &lt;!-- Import Component Form Di Sini --&gt;
       &lt;/div&gt;
    &lt;/USlideover&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- TAHAP 2: BACKEND -->
          <div class="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mt-6">
            <h3 class="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-3">
              <span
                class="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md font-bold"
              >2</span>
              Sisi Backend (BE): GraphQL & REST API (NestJS)
            </h3>
            <p class="text-slate-600 mb-6 text-sm">
              Backend kita menggunakan <strong class="text-red-500">NestJS</strong> dan <strong
                class="text-orange-500"
              >TypeORM</strong>.
              Berikut adalah urutan 5 file yang <strong class="underline">wajib</strong> dibuat saat membangun fitur
              CRUD baru dari nol.
            </p>

            <div class="space-y-6">
              <!-- STEP 1: ENTITY -->
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 text-sm flex justify-between items-center">
                  <span>1. Buat Entity (Koneksi Database)</span>
                  <span
                    class="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-mono hidden md:block"
                  >src/entities/data.entity.ts</span>
                </h4>
                <p class="text-xs text-slate-500 mb-3 leading-relaxed">
                  Entity merepresentasikan tabel di dalam PostgreSQL. Gunakan dekorator TypeORM seperti <code
                    class="text-pink-600"
                  >@Entity</code> dan <code class="text-pink-600">@Column</code>. Untuk GraphQL,
                  tambahkan dekorator <code class="text-purple-600">@ObjectType()</code>.
                </p>
                <div
                  class="bg-slate-900 text-emerald-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner mb-2"
                >
                  <pre><code>import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType() // Agar bisa dibaca oleh GraphQL
@Entity('m_data_contoh') // Nama tabel di Postgres
export class DataContohEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

@Field()
  @Column({ name: 'nama_data', type: 'varchar', length: 100 })
  namaData: string;
}</code></pre>
                </div>
              </div>

              <!-- STEP 2: DTO -->
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 text-sm flex justify-between items-center">
                  <span>2. Buat DTO (Data Transfer Object)</span>
                  <span
                    class="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-mono hidden md:block"
                  >src/.../dto/create-data.dto.ts</span>
                </h4>
                <p class="text-xs text-slate-500 mb-3 leading-relaxed">
                  DTO digunakan untuk memvalidasi payload (JSON) yang dikirim oleh Frontend FE. Gunakan dekorator <code
                    class="text-blue-500"
                  >class-validator</code>.
                </p>
                <div
                  class="bg-slate-900 text-blue-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner mb-2"
                >
                  <pre><code>import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateDataContohDto {
  @Field()
  @IsNotEmpty({ message: 'Nama Data tidak boleh kosong!' })
  @IsString()
  @MaxLength(100)
  namaData: string;
}</code></pre>
                </div>
              </div>

              <!-- STEP 3: SERVICE -->
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 text-sm flex justify-between items-center">
                  <span>3. Buat Service (Logika Bisnis)</span>
                  <span
                    class="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-mono hidden md:block"
                  >src/.../data.service.ts</span>
                </h4>
                <p class="text-xs text-slate-500 mb-3 leading-relaxed">
                  Tempatkan semua proses "Select, Insert, Update, Delete" ke Database di Service menggunakan <code
                    class="text-yellow-600"
                  >Repository</code> dari TypeORM.
                </p>
                <div
                  class="bg-slate-900 text-yellow-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner mb-2"
                >
                  <pre><code>import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataContohEntity } from '~/entities/data.entity';
import { CreateDataContohDto } from './dto/create-data.dto';

@Injectable()
export class DataContohService {
  constructor(
    @InjectRepository(DataContohEntity)
    private repo: Repository&lt;DataContohEntity&gt;,
  ) {}

  // Logika Ambil Data (GET GraphQL/REST)
  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  // Logika Tambah Data (POST MUtation)
  async create(payload: CreateDataContohDto) {
    const newData = this.repo.create(payload);
    return this.repo.save(newData); // Insert Record DB
  }
}</code></pre>
                </div>
              </div>

              <!-- STEP 4: RESOLVER / CONTROLLER -->
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 text-sm flex justify-between items-center">
                  <span>4. Buka Endpoint API (Resolver / Controller)</span>
                  <span
                    class="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-mono hidden md:block"
                  >src/.../data.resolver.ts</span>
                </h4>
                <p class="text-xs text-slate-500 mb-3 leading-relaxed">
                  Resolver membukakan endpoint ke Publik lewat GraphQL.
                  <strong class="text-red-500">PENTING:</strong> Selalu gunakan <code
                    class="text-purple-600"
                  >@UseGuards(JwtAuthGuard)</code> untuk mencegah akses liar!
                </p>
                <div
                  class="bg-slate-900 text-purple-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner mb-2"
                >
                  <pre><code>import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/guards/jwt-auth.guard'; // 🛡️ PENJAGA TOKEN JWT!
import { DataContohEntity } from '~/entities/data.entity';
import { DataContohService } from './data.service';
@Resolver(() => DataContohEntity)
export class DataContohResolver {
  constructor(private svc: DataContohService) {}

  @Query(() => [DataContohEntity])
  @UseGuards(JwtAuthGuard) // Mengunci endpoint (Harus Login Dulu)
  async cariSemuaData() {
    return this.svc.findAll();
  }

  @Mutation(() => DataContohEntity)
  @UseGuards(JwtAuthGuard)
  async tambahData(@Args('input') input: CreateDataContohDto) {
    return this.svc.create(input);
  }
}</code></pre>
                </div>
              </div>

              <!-- STEP 5: MODULE -->
              <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 text-sm flex justify-between items-center">
                  <span>5. Daftarkan File ke System (Module)</span>
                  <span
                    class="text-xs bg-slate-100 text-slate-500 py-1 px-2 rounded-md font-mono hidden md:block"
                  >src/.../data.module.ts</span>
                </h4>
                <p class="text-xs text-slate-500 mb-3 leading-relaxed">
                  Terakhir, kumpulkan Service, Resolver, dan Entity ke dalam Module agar dibaca NestJS.
                  Pastikan modul ini kelak di-import di <code class="text-orange-600 font-bold">app.module.ts</code>
                  utama.
                </p>
                <div
                  class="bg-slate-900 text-orange-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner mb-2"
                >
                  <pre><code>import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataContohEntity } from '~/entities/data.entity';
import { DataContohResolver } from './data.resolver';
import { DataContohService } from './data.service';

@Module({
  // TypeOrmModule.forFeature MEMBERIKAN Repository Entity ke dalam Service
  imports: [TypeOrmModule.forFeature([DataContohEntity])],
  providers: [DataContohResolver, DataContohService],
})
export class DataContohModule {}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
