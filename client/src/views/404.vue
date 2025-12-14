<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="error-page flex flex-col items-center justify-center" style="min-height: calc(100vh - 64px);">
    <q-card class="error-card" flat bordered>
      <q-card-section class="text-center q-pa-xl">
        <!-- Icône principale avec fond coloré -->
        <div class="error-icon-container q-mb-lg">
          <div class="icon-background bg-primary">
            <q-icon name="error_outline" size="80px" color="white" />
          </div>
        </div>
        
        <!-- Code d'erreur coloré -->
        <div class="error-code text-h1 text-weight-bold q-mb-md">
          404
        </div>
        
        <!-- Titre -->
        <div class="text-h5 text-weight-medium text-grey-8 q-mb-sm">
          Page introuvable
        </div>
        
        <!-- Description -->
        <div class="text-body1 text-grey-6 q-mb-xl" style="max-width: 500px; margin: 0 auto;">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </div>
        
        <!-- Actions -->
        <div class="row q-gutter-md justify-center">
          <q-btn
            color="primary"
            label="Retour à l'accueil"
            icon="home"
            size="md"
            @click="goHome"
            unelevated
          />
          <q-btn
            color="accent"
            label="Retour"
            icon="arrow_back"
            size="md"
            outline
            @click="router.go(-1)"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.error-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  min-height: calc(100vh - 64px);
}

.error-card {
  max-width: 600px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: white;
}

.error-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-background {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
}

.error-code {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 6rem;
  line-height: 1;
}
</style>
