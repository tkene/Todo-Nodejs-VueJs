<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logoPath from '../assets/images/JobTracker.png'

const router = useRouter()
const route = useRoute()
const { login, isLoading } = useAuth()

const email = ref('')
const password = ref('')
const emailRef = ref(null)
const passwordRef = ref(null)
const showPassword = ref(false)

async function submit() {
  if (emailRef.value) {
    emailRef.value.resetValidation()
  }
  if (passwordRef.value) {
    passwordRef.value.resetValidation()
  }

  try {
    if (emailRef.value) {
      await emailRef.value.validate()
    }
    if (passwordRef.value) {
      await passwordRef.value.validate()
    }

    if (emailRef.value?.hasError || passwordRef.value?.hasError) {
      return
    }

    // Appel à la fonction login du composable
    const result = await login({
      email: email.value,
      password: password.value
    })

    // Si la connexion réussit, rediriger vers la route demandée ou la page d'accueil
    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (err) {
    // Les erreurs sont déjà gérées dans le composable useAuth
    console.error('Erreur lors de la connexion:', err)
  }
}
</script>

<template>
  <div id="login-view" class="flex items-center justify-center h-screen bg-grey-1">
    <div class="flex flex-col items-center gap-10" style="width: 100%; max-width: 420px; padding: 20px;">
      <img :src="logoPath" alt="JobTracker logo" class="w-1/2 max-w-xs" />

      <q-card id="login-card" class="w-full" flat bordered>
        <q-card-section class="q-pa-md">
          <div class="text-h6 text-center q-mb-md">Connexion</div>
          
          <q-form @submit.prevent="submit" class="q-gutter-md">
            <q-input
              ref="emailRef"
              v-model="email"
              type="email"
              label="Email"
              placeholder="Votre adresse email"
              filled
              :rules="[
                val => !!val || 'L\'email est requis',
                val => /.+@.+\..+/.test(val) || 'Email invalide'
              ]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              ref="passwordRef"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Mot de passe"
              placeholder="Votre mot de passe"
              filled
              :rules="[val => !!val || 'Le mot de passe est requis']"
              lazy-rules
              @keyup.enter="submit"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="row justify-center q-mt-lg">
              <q-btn
                id="connexion-btn"
                label="Me connecter"
                type="submit"
                no-caps
                color="primary"
                unelevated
                :loading="isLoading"
                style="min-width: 200px; padding: 12px;"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
