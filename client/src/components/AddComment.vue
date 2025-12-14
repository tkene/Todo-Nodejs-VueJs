
<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  commentToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const open = ref(false);
const form = ref({
  comment: "",
});

watch(() => props.commentToEdit, (newComment) => {
  if (newComment) {
    form.value.comment = newComment.comment || "";
    open.value = true;
  }
}, { immediate: true });

async function submit() {
  if (!form.value.comment) {
    return;
  }

  emit('submit', form.value);

  open.value = false;
  form.value = {
    comment: "",
  };
}

function cancel() {
  open.value = false;
  form.value = {
    comment: "",
  };
  emit('cancel');
}
</script>

<template>
  <div>
    <q-btn 
      color="primary" 
      icon="add" 
      label="Ajouter un commentaire" 
      @click="open = true" 
    />

    <q-dialog v-model="open" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ props.commentToEdit ? 'Modifier le commentaire' : 'Ajouter un commentaire' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="col comment-section">
          <q-form @submit.prevent="submit" class="form-container">
            <div class="editor-container">
              <q-editor
                v-model="form.comment"
                :definitions="{
                  bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}
                }"
              />
            </div>
            <q-card-actions class="dialog-actions">
              <q-btn
                flat
                label="Annuler"
                color="secondary"
                @click="cancel"
              />
              <q-btn 
                color="primary" 
                label="Enregistrer" 
                type="submit" 
                class="q-ml-md"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.dialog-card {
  min-width: 70%;
  height: 80vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex-shrink: 0;
}

.comment-section {
  background-color: var(--light);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-container :deep(.q-editor) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.editor-container :deep(.q-editor__toolbar) {
  flex-shrink: 0;
}

.editor-container :deep(.q-editor__content) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.dialog-actions {
  flex-shrink: 0;
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
