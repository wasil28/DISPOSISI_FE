<script lang="ts" setup>
import Swal from 'sweetalert2'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { LoginApi } from '~/apis'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  token: {
    type: String,
    required: true,
    default: '',
  },
})

const emit = defineEmits(['update:model-value', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const dataFormUbahPassword = ref({
  old: '',
  new: '',
  confirm: '',
})

const ubahPasswordVisible = ref({
  old: false,
  new: false,
  confirm: false,
})

const schema = z.object({
  old: z.string({
    required_error: 'Wajib diisi',
  }).min(8, 'Minimal 8 karakter'),
  new: z.string({
    required_error: 'Wajib diisi',
  }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
  confirm: z.string({
    required_error: 'Wajib diisi',
  }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
})

type Schema = z.output<typeof schema>

const onSubmitUbahPassword = async (event: FormSubmitEvent<Schema>) => {
  const param = {
    currentPassword: event.data.old,
    password: event.data.new,
    passwordConfirmation: event.data.confirm,
  }

  const response = await LoginApi.gantiPassword(props.token, param)

  if (response.data) {
    Swal.fire({
      icon: 'success',
      title: 'Ubah Password Berhasil',
      text: 'Silakan login kembali menggunakan password baru Anda.',
      timer: 2000,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      navigateTo('/logout', { replace: true })
    })
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: response?.errors[0].message ?? 'Gagal Mengubah Password',
    })
  }
}
</script>

<template>
  <UModal
    v-model="open"
    :ui="{
      width: 'w-full sm:max-w-lg',
    }"
    prevent-close
  >
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            Form Ubah Password
          </h3>
          <UButton
            color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click=" dataFormUbahPassword = { old: '', new: '', confirm: '' }; emit('close')"
          />
        </div>
      </template>

      <UForm :schema="schema" :state="dataFormUbahPassword" class="space-y-4" @submit="onSubmitUbahPassword">
        <UFormGroup eager-validation required label="Password Lama" name="old">
          <div class="relative">
            <UInput v-model="dataFormUbahPassword.old" :type="ubahPasswordVisible.old ? 'text' : 'password'" :required="true" placeholder="Ketikkan password lama Anda" />
            <UnoIcon class="!text-ut-textGray absolute right-3 top-1.5 cursor-pointer" :class="ubahPasswordVisible.old ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="ubahPasswordVisible.old = !ubahPasswordVisible.old" />
          </div>
        </UFormGroup>

        <UFormGroup eager-validation required label="Password Baru" name="new">
          <div class="relative">
            <UInput v-model="dataFormUbahPassword.new" :type="ubahPasswordVisible.new ? 'text' : 'password'" :required="true" placeholder="Ketikkan password baru Anda" />
            <UnoIcon class="!text-ut-textGray absolute right-3 top-1.5 cursor-pointer" :class="ubahPasswordVisible.new ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="ubahPasswordVisible.new = !ubahPasswordVisible.new" />
          </div>
        </UFormGroup>

        <UFormGroup eager-validation required label="Konfirmasi Password Baru" name="confirm">
          <div class="relative">
            <UInput v-model="dataFormUbahPassword.confirm" :type="ubahPasswordVisible.confirm ? 'text' : 'password'" :required="true" placeholder="Ketikkan ulang password baru Anda" />
            <UnoIcon class="!text-ut-textGray absolute right-3 top-1.5 cursor-pointer" :class="ubahPasswordVisible.confirm ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="ubahPasswordVisible.confirm = !ubahPasswordVisible.confirm" />
          </div>
        </UFormGroup>

        <div class="text-right !mt-8">
          <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
            <UnoIcon class="i-mdi-content-save" /> Simpan
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
