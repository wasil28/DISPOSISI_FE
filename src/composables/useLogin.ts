import { defineNuxtComponent } from 'nuxt/app'
import { useAuth } from '@sidebase/nuxt-auth'

export default defineNuxtComponent({
  setup() {
    const { signIn, navigateTo } = useAuth()
    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')

    const onSubmit = async () => {
      try {
        const { data } = await axios.post('http://192.168.0.77:8080/api/v1/login', {
          username: username.value,
          password: password.value,
        })

        if (data.status === 200) {
          await signIn(data.access_token)
          navigateTo('/')
        }
        else {
          errorMessage.value = data.message
        }
      }
      catch (err) {
        errorMessage.value = err.message
      }
    }

    return {
      username,
      password,
      errorMessage,
      onSubmit,
    }
  },
})
