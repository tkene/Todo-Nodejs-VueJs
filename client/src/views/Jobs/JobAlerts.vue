<script setup>
import StatCard from '../../components/StatCard.vue';
import AddJobApplication from '../../components/AddJobApplication.vue';
import ListCard from '../../components/ListCard.vue';

const stats = [
  { label: 'Candidatures', value: 12 },
  { label: 'Réponses', value: 4 },
  { label: 'Entretiens', value: 2 },
  { label: 'Offres', value: 1 }
]

const reminders = [
  { id: 1, company: 'Google', date: '12/01' },
  { id: 2, company: 'Amazon', date: '14/01' }
]

const todos = [
  { id: 1, text: 'Tâche 1', tags: ['Tag 1', 'Tag 2'] },
  { id: 2, text: 'Tâche 2', tags: ['Tag 3', 'Tag 4'] }
]

function handleCardClick(card) {
  console.log('Card clicked:', card)
}

function handleSubmit(formData) {
  // TODO: call API pour sauvegarder (axios/fetch)
  // await api.post('/api/applications', formData)
  console.log("New application:", formData);
}
</script>

<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        @click="handleCardClick"
      />
    </div>
    
    <div class="q-mt-lg flex justify-end">
      <AddJobApplication @submit="handleSubmit" />
    </div>

    <ListCard 
      title="Liste des candidatures" 
      :items="reminders" 
      bg-color="info">
      <template #default="{ item }">
        <router-link :to="`/job-details/${item.id}`" class="w-full">
          <div :key="item.id" class="w-full">
            <q-item-section>{{ item.company }}</q-item-section>
            <q-item-section side>{{ item.date }}</q-item-section>
          </div>
        </router-link>
      </template>
    </ListCard>
  </div>
</template>
