<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import loader from '@monaco-editor/loader'
import * as monaco from 'monaco-editor'

loader.config({ monaco })

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
  theme?: string
  readOnly?: boolean
}>(), {
  language: 'json',
  theme: 'vs',
  readOnly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const containerEl = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(async () => {
  if (!containerEl.value) return

  const m = await loader.init()

  const instance = m.editor.create(containerEl.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: false,
    fixedOverflowWidgets: true,
  })
  editor = instance

  instance.onDidChangeModelContent(() => {
    emit('update:modelValue', instance.getValue())
    emit('change', instance.getValue())
  })
})

watch(() => props.modelValue, (newVal) => {
  if (editor && editor.getValue() !== newVal) {
    editor.setValue(newVal)
  }
})

watch(() => props.theme, (newTheme) => {
  monaco.editor.setTheme(newTheme)
})

onBeforeUnmount(() => {
  editor?.dispose()
  editor = null
})

defineExpose({
  format() {
    editor?.getAction('editor.action.formatDocument')?.run()
  },
  focus() {
    editor?.focus()
  },
})
</script>

<template>
  <div ref="containerEl" class="w-full h-full" />
</template>
