<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ConfirmDialog from './ConfirmDialog.vue'

const $q = useQuasar()

const props = defineProps({
  tags: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:tags', 'add-tag', 'remove-tag', 'edit-tag']);

const newTag = ref('')
const editingTagId = ref(null)
const editingTagName = ref('')
const showDeleteDialog = ref(false)
const tagToDelete = ref(null)
const openAddDialog = ref(false)

function addTag(){
  const t = newTag.value && newTag.value.trim()
  if(t && !props.tags.some(tag => tag.name.toLowerCase() === t.toLowerCase())){ 
    emit('add-tag', t)
    newTag.value = ''
    openAddDialog.value = false
    $q.notify({
      message: 'Tag ajouté avec succès !',
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    })
  } else if (t) {
    $q.notify({
      message: 'Ce tag existe déjà',
      color: 'warning',
      icon: 'warning',
      position: 'top-right',
      timeout: 2000
    })
  }
}

function cancelAdd(){
  openAddDialog.value = false
  newTag.value = ''
}

function startEdit(tag){
  editingTagId.value = tag.id
  editingTagName.value = tag.name
}

function cancelEdit(){
  editingTagId.value = null
  editingTagName.value = ''
}

function saveEdit(){
  if(editingTagName.value && editingTagName.value.trim()){
    emit('edit-tag', editingTagId.value, { value: editingTagName.value.trim() })
    editingTagId.value = null
    editingTagName.value = ''
    $q.notify({
      message: 'Tag modifié avec succès !',
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    })
  }
}

function removeTag(tagId){
  tagToDelete.value = tagId
  showDeleteDialog.value = true
}

function confirmDelete(){
  if(tagToDelete.value){
    emit('remove-tag', tagToDelete.value)
    showDeleteDialog.value = false
    tagToDelete.value = null
    $q.notify({
      message: 'Tag supprimé avec succès !',
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    })
  }
}
</script>

<template>
  <div>
    <!-- Bouton d'ajout -->
    <div class="q-mb-md flex justify-end">
      <q-btn 
        color="primary" 
        icon="add" 
        label="Ajouter un tag" 
        @click="openAddDialog = true"
      />
    </div>

    <!-- Modal d'ajout -->
    <q-dialog v-model="openAddDialog" persistent>
      <q-card style="min-width: 350px; max-width: 500px">
        <q-card-section class="q-pa-md">
          <div class="text-h5 text-weight-bold q-mb-xs">Ajouter un tag</div>
          <div class="text-body2 text-grey-7">
            Entrez le nom du tag à ajouter
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="addTag">
            <q-input
              v-model="newTag"
              label="Nom du tag *"
              placeholder="Entrez le nom du tag"
              @keyup.enter="addTag"
              autofocus
            />

            <q-card-actions 
              class="q-mt-md"
              align="right"
            >
              <q-btn
                flat
                label="Annuler"
                color="secondary"
                @click="cancelAdd"
              />
              <q-btn 
                color="primary" 
                label="Ajouter" 
                type="submit" 
                class="q-ml-md"
                :disable="!newTag || !newTag.trim()"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Liste des tags -->
    <q-card>
      <q-card-section class="text-h6" style="background-color: var(--secondary); color: white;">
        Liste des tags ({{ tags.length }})
      </q-card-section>
      <q-list>
        <q-item 
          v-for="t in tags" 
          :key="t.id"
          class="q-pa-md"
        >
          <q-item-section v-if="editingTagId !== t.id">
            <q-item-label>
              <q-chip 
                :label="t.name.toUpperCase()" 
                color="primary" 
                text-color="white"
                size="md"
              />
            </q-item-label>
          </q-item-section>
          
          <q-item-section v-else>
            <q-input
              v-model="editingTagName"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              autofocus
            />
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-xs" v-if="editingTagId !== t.id">
              <q-btn 
                icon="edit"
                color="warning"
                size="md"
                flat
                round
                @click="startEdit(t)"
              />
              <q-btn 
                icon="delete"
                color="negative"
                size="md"
                flat
                round
                @click="removeTag(t.id)"
              />
            </div>
            <div class="row q-gutter-xs" v-else>
              <q-btn 
                icon="check"
                color="positive"
                size="sm"
                flat
                round
                @click="saveEdit"
              />
              <q-btn 
                icon="close"
                color="negative"
                size="sm"
                flat
                round
                @click="cancelEdit"
              />
            </div>
          </q-item-section>
        </q-item>
        
        <q-item v-if="tags.length === 0">
          <q-item-section>
            <q-item-label class="text-center text-grey-7">
              Aucun tag disponible
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Dialog de confirmation de suppression -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Confirmer la suppression"
      message="Êtes-vous sûr de vouloir supprimer ce tag ?"
      header-color="negative"
      @confirm="confirmDelete"
    />
  </div>
</template>
