<script setup>
  defineProps({
    selectedTechnology: {
      type: String,
      default: null
    },
    technologyOptions: {
      type: Array,
      required: true
    },
    loadingTechnologies: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['update:selectedTechnology', 'start'])
</script>

<template>
  <div>
    <q-card class="q-pa-xl rounded-borders shadow-2" style="max-width: 600px; margin: 2rem auto;">
      <q-card-section class="text-center">
        <div class="q-mb-lg" style="animation: float 3s ease-in-out infinite;">
          <q-icon name="menu_book" size="80px" color="primary" />
        </div>
        <div class="text-h4 q-mb-md text-weight-bold">Bienvenue !</div>
        <div class="text-body1 q-mb-xl text-grey-7">
          Choisissez une technologie et apprenez à votre rythme
          <br />
          Explorez les questions et révèle les réponses quand vous êtes prêt
        </div>
        
        <!-- Sélection de technologie -->
        <div class="q-mb-lg mb-5" style="max-width: 400px; margin: 0 auto;">
          <q-select
            :model-value="selectedTechnology"
            @update:model-value="$emit('update:selectedTechnology', $event)"
            :options="technologyOptions"
            option-label="name"
            option-value="id"
            label="Choisissez une technologie"
            filled
            emit-value
            map-options
            :loading="loadingTechnologies"
            standout
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="code" />
            </template>
          </q-select>
        </div>

        <q-btn
          color="primary"
          size="lg"
          label="Commencer l'apprentissage"
          icon="play_arrow"
          @click="$emit('start')"
          :loading="loading"
          :disable="!selectedTechnology"
          unelevated
          rounded
          class="q-px-xl mt-5"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>

