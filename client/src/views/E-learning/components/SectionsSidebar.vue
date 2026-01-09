<script setup>
  defineProps({
    sections: {
      type: Array,
      required: true
    },
    currentSectionIndex: {
      type: Number,
      required: true
    }
  })
  
  defineEmits(['select-section'])
</script>

<template>
  <q-card class="rounded-borders column full-height" style="position: sticky; top: 20px; max-height: calc(100vh - 100px);" flat>
    <q-card-section class="overflow-hidden">
      <div class="text-subtitle1 text-weight-bold q-mb-md">Sections</div>
      <div class="overflow-y-auto">
      <q-list>
        <q-item
          v-for="(section, index) in sections"
          :key="index"
          clickable
          v-ripple
          :active="currentSectionIndex === index"
          active-class="bg-primary-1 text-primary"
          @click="$emit('select-section', index)"
          class="section-item"
        >
          <q-item-section avatar>
            <q-icon 
              :name="currentSectionIndex === index ? 'folder_open' : 'folder'" 
              :color="currentSectionIndex === index ? 'primary' : 'grey'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ section.topic }}</q-item-label>
            <q-item-label caption>
              {{ section.questions.length }} questions
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.section-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.section-item:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.bg-primary-1 {
  background-color: rgba(25, 118, 210, 0.1);
}
</style>
