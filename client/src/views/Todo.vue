<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
    getTodos,
    createTodo as createTodoApi,
    updateTodo as updateTodoApi,
    deleteTodo as deleteTodoApi } from '../api/todos'
import { getTags } from '../api/tags'
import FiltersTodo from '../components/FiltersTodo.vue'
import AddTodo from '../components/AddTodo.vue'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()

const todos = ref([])
const allAvailableTags = ref([])
const allTagsList = ref([]) // Tableau d'objets {id, name} pour tous les tags disponibles
const filter = ref('all')
const search = ref('')
const editing = ref(false)
const editItem = ref(null)
const editText = ref('')
const editTags = ref([])
const TodosInProgress = ref(0)

async function createTodo(todo){
    const res = await createTodoApi(todo)
    todos.value.push(res)
    $q.notify({
      message: 'Todo créé avec succès !',
      color: 'green',
      icon: 'check',
      position: 'top-right',
      timeout: 3000
    })
}

async function loadTodos(){
  const res = await getTodos()
  todos.value = res
}

async function loadTags(){
  try {
    const res = await getTags()
    allAvailableTags.value = res.map(tag => tag.name)
    allTagsList.value = res // Stocker directement le tableau d'objets {id, name}
  } catch (error) {
    console.error('Erreur lors du chargement des tags:', error)
  }
}

function getTagNameById(id) {
  const tag = allTagsList.value.find(t => t.id === id)
  return tag ? tag.name : id
}

function getTagIdByName(name) {
  const tag = allTagsList.value.find(t => t.name === name)
  return tag ? tag.id : name
}

async function toggleDone(t, newValue = null){
  const doneValue = newValue !== null ? newValue : !t.done
  const res = await updateTodoApi(t.id, { done: doneValue })
  const idx = todos.value.findIndex(x => x.id === t.id)
  if(idx !== -1) todos.value[idx] = res
}

async function editTodo(t){
  editItem.value = t
  editText.value = t.text
  editTags.value = [...(t.tags || [])]
  await loadTags()
  editing.value = true
}

async function saveEdit(){
  // Convertir les noms de tags en IDs
  const tagIds = editTags.value.map(tagName => getTagIdByName(tagName))
  const res = await updateTodoApi(editItem.value.id, { text: editText.value, tags: tagIds })
  const idx = todos.value.findIndex(x => x.id === res.id)
  if(idx !== -1) todos.value[idx] = res
  editing.value = false
  $q.notify({
    message: 'Todo modifié avec succès !',
    color: 'green',
    icon: 'check',
    position: 'top-right',
    timeout: 3000
  })
}

function cancelEdit(){ editing.value = false }

async function removeTodo(t){
  await deleteTodoApi(t.id)
  todos.value = todos.value.filter(x => x.id !== t.id)
  $q.notify({
    message: 'Todo supprimé avec succès !',
    color: 'green',
    icon: 'check',
    position: 'top-right',
    timeout: 3000
  })
}

onMounted(async () => {
  await loadTodos()
  await loadTags()
})

// Recharger les données quand on revient sur la page Todo
watch(() => route.path, async (newPath) => {
  if (newPath === '/todo') {
    await loadTodos()
    await loadTags()
  }
}, { immediate: false })

const filteredTodos = computed(()=>{
  let out = todos.value.slice()
  if(filter.value === 'todo') out = out.filter(t => !t.done)
  if(filter.value === 'done') out = out.filter(t => t.done)
  TodosInProgress.value = out.filter(t => !t.done).length
  if(search.value.trim()){
    const q = search.value.toLowerCase()
    out = out.filter(t => t.text.toLowerCase().includes(q) || (t.tags||[]).some(tag => tag.toLowerCase().includes(q)))
  }
  // Trier pour que les todos terminés (done: true) soient en bas
  return out.sort((a, b) => {
    // Si a est done et b ne l'est pas, a va en bas (retourne 1)
    // Si a n'est pas done et b est done, a reste en haut (retourne -1)
    // Si les deux ont le même statut, on garde l'ordre original
    if (a.done && !b.done) return 1
    if (!a.done && b.done) return -1
    return 0
  })
})

const allTags = computed(()=>{
  const tagSet = new Set()
  allAvailableTags.value.forEach(tag => tagSet.add(tag))
  todos.value.forEach(t => {
    if(t.tags && Array.isArray(t.tags)){
      t.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
})

const allAvailableTagsArray = computed(() => {
  return allTagsList.value
})

</script>

<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <h1 class="flex items-center gap-3 text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      <q-icon name="checklist" class="text-indigo-600 text-4xl md:text-5xl" />
      <span>Liste de Tâches + Tags</span>
    </h1>

    <!-- Filtres -->
    <div class="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <FiltersTodo 
          v-model:filter="filter" 
          v-model:search="search" 
        />
        <AddTodo 
          :tags="allAvailableTagsArray"
          @submit="createTodo"
        />
      </div>
    </div>

    <!-- Liste des todos -->
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 md:p-6 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        <div class="flex items-center gap-3 relative z-10">
          <q-icon name="task_alt" class="text-2xl opacity-90" />
          <h2 class="text-xl font-semibold m-0">Tâches ({{ TodosInProgress }})</h2>
        </div>
      </div>
      <div class="p-4">
        <transition-group name="list-fade" tag="div" class="flex flex-col gap-3">
          <div
            v-for="t in filteredTodos" 
            :key="t.id"
            class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300"
            :class="t.done 
              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 opacity-75' 
              : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-indigo-300 hover:shadow-md'"
          >
            <q-checkbox 
              :model-value="t.done"
              @update:model-value="(val) => toggleDone(t, val)"
              :color="t.done ? 'positive' : 'primary'"
              class="flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div 
                class="text-base font-medium mb-2"
                :class="t.done ? 'line-through text-gray-500' : 'text-gray-800'"
              >
                {{ t.text }}
              </div>
              <div class="flex flex-wrap gap-2">
                <q-chip
                  v-for="tag in t.tags"
                  :key="tag"
                  size="sm"
                  :label="typeof tag === 'number' ? getTagNameById(tag) : tag"
                  color="primary"
                  text-color="white"
                  class="text-xs"
                />
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <q-btn 
                icon="edit"
                :color="t.done ? 'grey' : 'warning'"
                size="md"
                flat
                round
                @click="editTodo(t)"
                class="transition-transform duration-200 hover:scale-110"
              />
              <q-btn 
                icon="delete"
                :color="t.done ? 'grey' : 'negative'"
                size="md"
                flat
                round
                @click="removeTodo(t)"
                class="transition-transform duration-200 hover:scale-110"
              />
            </div>
          </div>
          <div v-if="filteredTodos.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center">
            <q-icon name="inbox" size="48px" class="text-gray-300 mb-4" />
            <p class="text-gray-400 text-sm font-medium m-0">Aucune tâche trouvée</p>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Dialog d'édition -->
    <q-dialog v-model="editing" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pa-sm">
          <div class="text-h6">Modifier la tâche</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="editText"
            label="Texte de la tâche"
            :rules="[(v) => !!v || 'Requis']"
            class="q-mb-md"
          />
          
          <q-select
            v-model="editTags"
            :options="allTags"
            label="Tags"
            multiple
            use-chips
            class="q-mb-md"
          />

          <div class="text-caption text-grey-7">
            Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs tags
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            label="Annuler"
            color="secondary"
            @click="cancelEdit"
          />
          <q-btn
            color="primary"
            label="Enregistrer"
            @click="saveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.list-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
