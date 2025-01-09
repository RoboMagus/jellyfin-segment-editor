<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        {{ chapterData.chapter }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="GetChapterData" @click="getChapterData" />
        <q-btn color="primary" label="writeChapterData" @click="writeChapterData" />
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { usePluginChapterApi } from 'src/composables/pluginChapterApi'
import { ref } from 'vue';

let chapterData = ref('');

const props = defineProps<{
  item: ItemDto
}>()

const { createChapterById, getChapterById } = usePluginChapterApi()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome



defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])


// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK()
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}

const getChapterData = async () => {
  chapterData.value = await getChapterById(props.item.Id)
  console.log(chapterData.value)
}

const writeChapterData = async () => {
  await createChapterById([props.item.Id])
}
</script>
