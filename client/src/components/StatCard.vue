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

function getIconColorClass(color) {
  const colorMap = {
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'amber': 'bg-gradient-to-br from-amber-500 to-orange-500',
    'purple': 'bg-gradient-to-br from-purple-500 to-indigo-600',
    'green': 'bg-gradient-to-br from-green-500 to-emerald-600',
    'pink': 'bg-gradient-to-br from-pink-500 to-rose-500',
    'indigo': 'bg-gradient-to-br from-indigo-500 to-purple-600',
    'primary': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'secondary': 'bg-gradient-to-br from-emerald-500 to-green-600',
    'accent': 'bg-gradient-to-br from-amber-500 to-orange-500'
  }
  return colorMap[color] || colorMap['primary']
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
          <div 
            v-if="icon" 
            class="stat-icon-container"
            :class="getIconColorClass(iconColor)"
          >
            <q-icon :name="icon" size="md" color="white" />
          </div>
          
          <div class="col">
            <div class="row items-baseline q-gutter-sm q-mb-sm">
              <div class="text-h3 text-weight-bold">{{ value }}</div>
              <div class="text-caption text-grey-7">{{ label }}</div>
            </div>
            
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
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-container {
  transform: scale(1.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-card {
  height: 100%;
}
</style>
