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
  <div class="q-pa-md">
    <h1 class="text-h4 q-mb-md">Liste de Tâches + Tags</h1>

    <!-- Filtres -->
    <q-card class="q-mb-md">
      <q-card-section class="row items-center justify-between">
        <FiltersTodo 
          v-model:filter="filter" 
          v-model:search="search" 
        />
        <AddTodo 
          :tags="allAvailableTagsArray"
          @submit="createTodo"
        />
      </q-card-section>
    </q-card>

    <!-- Liste des todos -->
    <q-card>
      <q-card-section class="text-h6" style="background-color: var(--accent); color: white;">
        Tâches ({{ TodosInProgress }})
      </q-card-section>
      <q-list>
        <q-item 
          v-for="t in filteredTodos" 
          :key="t.id"
          class="q-pa-md"
        >
          <q-item-section avatar>
            <q-checkbox 
              :model-value="t.done"
              @update:model-value="(val) => toggleDone(t, val)"
              :color="t.done ? 'positive' : 'primary'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label 
              :class="{ 'text-strike': t.done, 'text-grey-7': t.done }"
              class="text-body1"
            >
              {{ t.text }}
            </q-item-label>
            <q-item-label caption>
              <div class="row q-gutter-xs q-mt-xs">
                <q-chip
                  v-for="tag in t.tags"
                  :key="tag"
                  size="sm"
                  :label="typeof tag === 'number' ? getTagNameById(tag) : tag"
                  color="primary"
                  text-color="white"
                />
              </div>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn 
                icon="edit"
                :color="t.done ? 'grey' : 'warning'"
                size="md"
                flat
                round
                @click="editTodo(t)"
              />
              <q-btn 
                icon="delete"
                :color="t.done ? 'grey' : 'negative'"
                size="md"
                flat
                round
                @click="removeTodo(t)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="filteredTodos.length === 0">
          <q-item-section>
            <q-item-label class="text-center text-grey-7">
              Aucune tâche trouvée
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

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
