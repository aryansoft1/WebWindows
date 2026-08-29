<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  projectId: { type: String, required: true },
  path: { type: String, required: true },
  language: { type: String, default: "plaintext" },
  value: { type: String, default: "" },
  markers: { type: Array, default: () => [] }
});
const emit = defineEmits(["update:value", "save", "ready", "error"]);
const host = ref(null);
const loading = ref(true);
let editor;
let model;
let monaco;
let changeSubscription;
let applyingExternalValue = false;
let configureManifestSchemaForText;

onMounted(async () => {
  try {
    const runtime = await import("./monaco-runtime.js");
    ({ monaco } = await runtime.configureStudioMonaco());
    configureManifestSchemaForText = runtime.configureManifestSchemaForText;
    model = getOrCreateModel();
    updateManifestSchema(model.getValue());
    editor = monaco.editor.create(host.value, {
      model,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      tabSize: 2,
      insertSpaces: true,
      scrollBeyondLastLine: false,
      wordWrap: "off",
      renderWhitespace: "selection",
      accessibilityPageSize: 20
    });
    changeSubscription = editor.onDidChangeModelContent(() => {
      const value = model.getValue();
      updateManifestSchema(value);
      if (!applyingExternalValue) emit("update:value", value);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => emit("save"));
    loading.value = false;
    updateMarkers();
    editor.focus();
    emit("ready");
  } catch (error) {
    loading.value = false;
    emit("error", error);
  }
});

watch(() => props.value, (value) => {
  if (!model || model.getValue() === value) return;
  applyingExternalValue = true;
  model.setValue(value);
  updateManifestSchema(value);
  applyingExternalValue = false;
});

watch(() => props.markers, updateMarkers, { deep: true });

onBeforeUnmount(() => {
  changeSubscription?.dispose();
  editor?.dispose();
});

function getOrCreateModel() {
  const uri = monaco.Uri.parse(`inmemory://webwindows-studio/${encodeURIComponent(props.projectId)}/${props.path}`);
  const existing = monaco.editor.getModel(uri);
  if (existing) {
    monaco.editor.setModelLanguage(existing, props.language);
    if (existing.getValue() !== props.value) existing.setValue(props.value);
    return existing;
  }
  return monaco.editor.createModel(props.value, props.language, uri);
}

function updateMarkers() {
  if (!monaco || !model) return;
  monaco.editor.setModelMarkers(model, "webwindows-manifest", props.markers.map((marker) => ({
    severity: marker.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
    message: `${marker.path}: ${marker.message}`,
    startLineNumber: marker.line || 1,
    startColumn: marker.column || 1,
    endLineNumber: marker.endLine || marker.line || 1,
    endColumn: marker.endColumn || Math.max(2, (marker.column || 1) + 1)
  })));
}

function updateManifestSchema(value) {
  if (props.path === "manifest.json") configureManifestSchemaForText?.(value);
}
</script>

<template>
  <div class="monaco-editor-shell">
    <div ref="host" class="monaco-editor-host"></div>
    <div v-if="loading" class="editor-loading">正在载入本地编辑器…</div>
  </div>
</template>
