<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  statusText: {
    type: String,
    default: ''
  },
  statusIcon: {
    type: String,
    default: 'info'
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', { label: props.label, value: props.value })
}
</script>

<template>
  <div class="col-6 col-md-3">
    <q-card 
      class="stat-card q-pa-md hover:bg-gray-100 transition-colors cursor-pointer"
      @click="handleClick"
      flat
      bordered
    >
      <q-card-section class="q-pa-md">
        <div class="row items-start q-gutter-md">
          <!-- Icône colorée dans un carré -->
          <div 
            v-if="icon" 
            class="stat-icon-container"
            :class="`bg-${iconColor}`"
          >
            <q-icon :name="icon" size="md" color="white" />
          </div>
          
          <div class="col">
            <!-- Valeur et Label sur la même ligne -->
            <div class="row items-baseline q-gutter-sm q-mb-sm">
              <div class="text-h3 text-weight-bold">{{ value }}</div>
              <div class="text-caption text-grey-7">{{ label }}</div>
            </div>
            
            <!-- Ligne de statut en bas -->
            <div v-if="statusText" class="row items-center q-gutter-xs">
              <q-icon :name="statusIcon" size="xs" color="grey-6" />
              <span class="text-caption text-grey-6">{{ statusText }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.stat-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card {
  height: 100%;
}
</style>

