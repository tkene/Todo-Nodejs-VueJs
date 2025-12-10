<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
    getTodos,
    createTodo as createTodoApi,
    updateTodo as updateTodoApi,
    deleteTodo as deleteTodoApi } from '../api/todos'
import { getTags } from '../api/tags'
import ListTodo from '../components/ListTodo.vue'
import FiltersTodo from '../components/FiltersTodo.vue'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()

const text = ref('')
const tags = ref([])
const todos = ref([])
const allAvailableTags = ref([])
const allTagsList = ref([]) // Tableau d'objets {id, name} pour tous les tags disponibles
const filter = ref('all')
const search = ref('')
const editing = ref(false)
const editItem = ref(null)
const editText = ref('')
const editTags = ref([])

async function createTodo(todo){
    const res = await createTodoApi(todo)
    todos.value.push(res)
    text.value = ''
    tags.value = []
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

async function toggleDone(t){
  const res = await updateTodoApi(t.id, { done: !t.done })
  const idx = todos.value.findIndex(x => x.id === t.id)
  if(idx !== -1) todos.value[idx] = res
}

async function editTodo(t){
  editItem.value = t
  editText.value = t.text
  // Les tags viennent du serveur avec les noms (enrichis), on les garde pour l'affichage
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
  <div class="mx-auto font-sans p-4">
    <h1 class="text-2xl font-bold mb-4">Liste de Tâches + Tags</h1>

    <div class="flex gap-2 flex-nowrap items-center justify-center mt-4 mb-4 bg-gray-100 p-4 rounded-lg">
      <ListTodo 
        v-model:text="text" 
        :tags="allAvailableTagsArray"
        @create-todo="createTodo"
      />
    </div>

    <FiltersTodo 
      v-model:filter="filter" 
      v-model:search="search" 
    />

    <ul class="list-none p-0 mt-4">
      <li 
      v-for="t in filteredTodos" 
      :key="t.id" 
      class="py-2 border-b border-gray-200 flex justify-between items-center"
      >
        <div>
          <strong :class="t.done ? 'line-through' : 'none'">{{ t.text }}</strong>
          <div class="mt-2">
            <span 
            v-for="tag in t.tags"
            :key="tag" 
            class="inline-block px-3 py-1 rounded-md bg-gray-100 mr-2"
            >
              {{ typeof tag === 'number' ? getTagNameById(tag) : tag }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <q-btn 
            :color="t.done ? 'black' : 'green'"
            @click="toggleDone(t)">{{ t.done ? 'Undo' : 'Done' }}
          </q-btn>
          <q-btn 
            :color="t.done ? 'black' : 'yellow'"
            @click="editTodo(t)">Edit
          </q-btn>
          <q-btn 
            :color="t.done ? 'black' : 'red'"
            @click="removeTodo(t)">Delete
          </q-btn>
        </div>
      </li>
    </ul>

    <div 
    v-if="editing" 
    class="fixed left-0 top-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class=" col-span-2 bg-white p-4 rounded-lg min-w-60">
        <div class="flex justify-between items-center"><h3>Edit todo</h3></div>
        <input v-model="editText" class="w-full mt-2 p-2" />
        <label class="block mt-2 font-bold">Tags:</label>
        <select 
        v-model="editTags" 
        multiple
        class="w-full p-2 border border-gray-300 rounded-md mt-2 min-h-20"
        >
          <option 
            v-for="tag in allTags" 
            :key="tag" 
            :value="tag"
          >
            {{ tag }}
          </option>
         </select>
         <p class="mt-2 text-sm text-gray-600">Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs tags</p>
        <div class="mt-2 flex gap-2 justify-end">
          <button class="bg-blue-500 text-white px-4 py-2 rounded-md" @click="saveEdit">Save</button>
          <button class="bg-red-500 text-white px-4 py-2 rounded-md" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>
