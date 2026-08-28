<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import FileTreeNode from "./FileTreeNode.vue";
import MonacoEditor from "./editor/MonacoEditor.vue";
import ManifestInspector from "./manifest/ManifestInspector.vue";
import { validateManifestText } from "./manifest/manifest-validator.js";
import { createHelloWebWindowsTemplate } from "./project/hello-template.js";
import { childPath, ProjectRepository } from "./project/project-repository.js";
import { normalizeProjectPath, parentProjectPath, projectPathName } from "./project/path-policy.js";
import { buildProjectTree, languageForPath } from "./project/tree-model.js";

const repository = new ProjectRepository();
const projects = ref([]);
const activeProject = ref(null);
const entries = ref([]);
const selectedPath = ref("");
const openFiles = ref([]);
const activeFile = ref("");
const editorText = ref("");
const dirtyFiles = ref(new Set());
const manifestValue = ref(null);
const manifestDiagnostics = ref([]);
const status = ref("");
const statusKind = ref("");
const dialog = ref(null);
let dialogResolve = null;
let saveTimer = 0;
let manifestValidationSequence = 0;

const tree = computed(() => buildProjectTree(entries.value));
const activeEntry = computed(() => entries.value.find((entry) => entry.path === activeFile.value));
const editorLanguage = computed(() => languageForPath(activeFile.value));
const activeMarkers = computed(() => activeFile.value === "manifest.json" ? manifestDiagnostics.value : []);

onMounted(async () => {
  try {
    await refreshProjects();
    if (projects.value.length) await openProject(projects.value[0].uuid);
  } catch (error) {
    showError(error);
  }
});

onBeforeUnmount(() => {
  clearTimeout(saveTimer);
  repository.close();
});

async function refreshProjects() {
  projects.value = await repository.listProjects();
}

async function createProject() {
  try {
    await flushSave();
    const template = createHelloWebWindowsTemplate();
    const name = await askText("新建 WebWindows 功能", "项目名称", template.displayName);
    if (name == null) return;
    const project = await repository.createProject({ ...template, displayName: name });
    await refreshProjects();
    await openProject(project.uuid);
    showStatus("Hello WebWindows 项目已创建。");
  } catch (error) {
    showError(error);
  }
}

async function openProject(projectId) {
  if (!projectId) return;
  await flushSave();
  activeProject.value = await repository.getProject(projectId);
  entries.value = await repository.listEntries(projectId);
  const state = activeProject.value.editorState || {};
  openFiles.value = (state.openFiles || []).filter((path) =>
    entries.value.some((entry) => entry.path === path && entry.kind === "file"));
  activeFile.value = entries.value.some((entry) => entry.path === state.activeFile && entry.kind === "file")
    ? state.activeFile : (openFiles.value[0] || "");
  selectedPath.value = activeFile.value;
  dirtyFiles.value = new Set();
  await loadActiveFile();
  await loadManifestFromRepository();
  await persistEditorState();
}

async function renameProject() {
  if (!activeProject.value) return;
  const nextName = await askText("重命名项目", "新的项目名称", activeProject.value.displayName);
  if (nextName == null) return;
  try {
    activeProject.value = await repository.renameProject(activeProject.value.uuid, nextName);
    await refreshProjects();
    showStatus("项目已重命名。");
  } catch (error) {
    showError(error);
  }
}

async function deleteProject() {
  if (!activeProject.value) return;
  if (!await confirmAction("删除项目", `永久删除项目“${activeProject.value.displayName}”及其全部文件吗？`)) return;
  try {
    const projectId = activeProject.value.uuid;
    await repository.deleteProject(projectId);
    activeProject.value = null;
    entries.value = [];
    openFiles.value = [];
    activeFile.value = "";
    selectedPath.value = "";
    editorText.value = "";
    await refreshProjects();
    if (projects.value.length) await openProject(projects.value[0].uuid);
    showStatus("项目已删除。");
  } catch (error) {
    showError(error);
  }
}

async function selectNode(node) {
  selectedPath.value = node.path;
  if (node.kind === "file") await openFile(node.path);
}

async function openFile(path) {
  if (!activeProject.value) return;
  await flushSave();
  const normalized = normalizeProjectPath(path);
  if (!openFiles.value.includes(normalized)) openFiles.value.push(normalized);
  activeFile.value = normalized;
  selectedPath.value = normalized;
  await loadActiveFile();
  await persistEditorState();
}

async function loadActiveFile() {
  if (!activeProject.value || !activeFile.value) {
    editorText.value = "";
    return;
  }
  editorText.value = await repository.readTextFile(activeProject.value.uuid, activeFile.value);
  if (activeFile.value === "manifest.json") await refreshManifestDiagnostics(editorText.value);
  await nextTick();
}

function updateEditor(value) {
  editorText.value = value;
  if (!activeFile.value) return;
  dirtyFiles.value = new Set(dirtyFiles.value).add(activeFile.value);
  if (activeFile.value === "manifest.json") refreshManifestDiagnostics(value).catch(showError);
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => flushSave().catch(showError), 700);
}

async function refreshManifestDiagnostics(text) {
  const sequence = ++manifestValidationSequence;
  const result = await validateManifestText(text);
  if (sequence !== manifestValidationSequence) return;
  manifestValue.value = result.manifest;
  manifestDiagnostics.value = result.diagnostics;
}

async function loadManifestFromRepository() {
  if (!activeProject.value || !entries.value.some((entry) => entry.path === "manifest.json" && entry.kind === "file")) {
    manifestValue.value = null;
    manifestDiagnostics.value = [];
    return;
  }
  const text = activeFile.value === "manifest.json"
    ? editorText.value
    : await repository.readTextFile(activeProject.value.uuid, "manifest.json");
  await refreshManifestDiagnostics(text);
}

async function updateManifestForm(manifest) {
  if (activeFile.value !== "manifest.json") await openFile("manifest.json");
  updateEditor(`${JSON.stringify(manifest, null, 2)}\n`);
}

async function flushSave() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  if (!activeProject.value || !activeFile.value || !dirtyFiles.value.has(activeFile.value)) return;
  const savingPath = activeFile.value;
  await repository.writeTextFile(activeProject.value.uuid, savingPath, editorText.value);
  const nextDirty = new Set(dirtyFiles.value);
  nextDirty.delete(savingPath);
  dirtyFiles.value = nextDirty;
  activeProject.value = await repository.getProject(activeProject.value.uuid);
}

async function persistEditorState() {
  if (!activeProject.value) return;
  const recent = [activeFile.value, ...(activeProject.value.editorState?.recentFiles || [])].filter(Boolean);
  activeProject.value = await repository.saveEditorState(activeProject.value.uuid, {
    openFiles: openFiles.value,
    activeFile: activeFile.value || null,
    recentFiles: [...new Set(recent)].slice(0, 20)
  });
}

function selectedParent() {
  const selected = entries.value.find((entry) => entry.path === selectedPath.value);
  if (selected?.kind === "directory") return selected.path;
  return selected?.path ? parentProjectPath(selected.path) : "";
}

async function createEntry(kind) {
  if (!activeProject.value) return;
  const label = kind === "directory" ? "目录名称" : "文件名称";
  const name = await askText(kind === "directory" ? "新建目录" : "新建文件", label, kind === "directory" ? "new-folder" : "new-file.js");
  if (name == null) return;
  try {
    const path = childPath(selectedParent(), name);
    if (kind === "directory") await repository.createDirectory(activeProject.value.uuid, path);
    else await repository.createFile(activeProject.value.uuid, path, "");
    entries.value = await repository.listEntries(activeProject.value.uuid);
    selectedPath.value = path;
    if (kind === "file") await openFile(path);
  } catch (error) {
    showError(error);
  }
}

async function renameSelectedEntry() {
  const selected = entries.value.find((entry) => entry.path === selectedPath.value);
  if (!selected || !activeProject.value) return;
  const name = await askText("重命名", "新的名称", projectPathName(selected.path));
  if (name == null) return;
  try {
    await flushSave();
    const target = childPath(parentProjectPath(selected.path), name);
    await repository.renameEntry(activeProject.value.uuid, selected.path, target);
    entries.value = await repository.listEntries(activeProject.value.uuid);
    activeProject.value = await repository.getProject(activeProject.value.uuid);
    openFiles.value = activeProject.value.editorState.openFiles;
    activeFile.value = activeProject.value.editorState.activeFile || "";
    selectedPath.value = target;
    await loadActiveFile();
  } catch (error) {
    showError(error);
  }
}

async function deleteSelectedEntry() {
  const selected = entries.value.find((entry) => entry.path === selectedPath.value);
  if (!selected || !activeProject.value) return;
  if (!await confirmAction("删除文件或目录", `删除“${selected.path}”${selected.kind === "directory" ? "及其全部内容" : ""}吗？`)) return;
  try {
    await repository.deleteEntry(activeProject.value.uuid, selected.path);
    entries.value = await repository.listEntries(activeProject.value.uuid);
    activeProject.value = await repository.getProject(activeProject.value.uuid);
    openFiles.value = activeProject.value.editorState.openFiles;
    activeFile.value = activeProject.value.editorState.activeFile || "";
    selectedPath.value = activeFile.value;
    await loadActiveFile();
  } catch (error) {
    showError(error);
  }
}

function showStatus(message) {
  status.value = message;
  statusKind.value = "";
  window.setTimeout(() => { if (status.value === message) status.value = ""; }, 2400);
}

function showError(error) {
  status.value = error?.message || "操作失败。";
  statusKind.value = "error";
}

function askText(title, message, value) {
  return openDialog({ kind: "text", title, message, value });
}

function confirmAction(title, message) {
  return openDialog({ kind: "confirm", title, message, value: "" });
}

function openDialog(options) {
  if (dialogResolve) dialogResolve(null);
  dialog.value = { ...options };
  return new Promise((resolve) => { dialogResolve = resolve; });
}

function finishDialog(result) {
  const resolve = dialogResolve;
  dialogResolve = null;
  dialog.value = null;
  resolve?.(result);
}
</script>

<template>
  <main class="developer-studio">
    <header class="studio-toolbar">
      <div class="studio-brand"><strong>Developer Studio</strong><span>WebWindows Function IDE</span></div>
      <button class="primary" type="button" @click="createProject">新建功能</button>
      <select
        aria-label="打开项目"
        :value="activeProject?.uuid || ''"
        @change="openProject($event.target.value).catch(showError)"
      >
        <option value="" disabled>打开项目…</option>
        <option v-for="project in projects" :key="project.uuid" :value="project.uuid">
          {{ project.displayName }}
        </option>
      </select>
      <button type="button" :disabled="!activeProject" @click="renameProject">重命名项目</button>
      <button type="button" :disabled="!activeProject" @click="deleteProject">删除项目</button>
      <span class="toolbar-spacer"></span>
      <button type="button" disabled title="Phase 1B 提供 Run">Run available in next phase</button>
    </header>

    <section v-if="activeProject" class="studio-main">
      <aside class="explorer-panel">
        <div class="panel-heading">
          <span>Project · {{ activeProject.displayName }}</span>
          <div class="panel-actions">
            <button type="button" title="新建文件" @click="createEntry('file')">＋F</button>
            <button type="button" title="新建目录" @click="createEntry('directory')">＋D</button>
            <button type="button" title="重命名" :disabled="!selectedPath" @click="renameSelectedEntry">R</button>
            <button type="button" title="删除" :disabled="!selectedPath" @click="deleteSelectedEntry">×</button>
          </div>
        </div>
        <div class="file-tree">
          <FileTreeNode
            v-for="node in tree"
            :key="node.path"
            :node="node"
            :selected-path="selectedPath"
            @select="selectNode"
          />
        </div>
      </aside>

      <section class="editor-workbench">
        <nav class="editor-tabs" aria-label="打开的文件">
          <button
            v-for="path in openFiles"
            :key="path"
            type="button"
            class="editor-tab"
            :class="{ active: path === activeFile }"
            @click="openFile(path).catch(showError)"
          >
            <span>{{ projectPathName(path) }}</span>
            <span v-if="dirtyFiles.has(path)" class="dirty-dot">•</span>
          </button>
        </nav>
        <div class="editor-host">
          <MonacoEditor
            v-if="activeEntry?.kind === 'file'"
            :key="`${activeProject.uuid}:${activeFile}`"
            :project-id="activeProject.uuid"
            :path="activeFile"
            :language="editorLanguage"
            :value="editorText"
            :markers="activeMarkers"
            @update:value="updateEditor"
            @save="flushSave().then(() => showStatus('已保存。')).catch(showError)"
            @error="showError"
          />
          <div v-else class="empty-editor">
            <h2>选择文件开始编辑</h2>
            <p>Phase 1A 支持 HTML、CSS、JavaScript、JSON 和其他文本文件。</p>
          </div>
        </div>
      </section>

      <aside class="inspector-panel">
        <div class="panel-heading"><span>Manifest / Inspector</span></div>
        <div class="inspector-content">
          <h2>Manifest v1</h2>
          <p class="project-uuid">项目 UUID：{{ activeProject.uuid }}</p>
          <ManifestInspector
            :manifest="manifestValue"
            :diagnostics="manifestDiagnostics"
            @update:manifest="updateManifestForm($event).catch(showError)"
            @open-json="openFile('manifest.json').catch(showError)"
          />
        </div>
      </aside>
    </section>

    <section v-else class="empty-workspace studio-main">
      <h2>创建第一个 WebWindows 功能</h2>
      <p>项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。</p>
      <button class="primary" type="button" @click="createProject">新建 Hello WebWindows</button>
    </section>

    <section class="problems-panel">
      <div class="panel-heading"><span>Problems</span><span>{{ manifestDiagnostics.length }}</span></div>
      <div v-if="!manifestDiagnostics.length" class="problems-empty">Manifest v1 Schema 未发现问题。</div>
      <button
        v-for="(problem, index) in manifestDiagnostics"
        :key="`${problem.path}:${index}`"
        type="button"
        class="problem-row"
        @click="openFile('manifest.json').catch(showError)"
      >
        <span class="problem-severity" :class="problem.severity">{{ problem.severity }}</span>
        <code>{{ problem.path }}</code>
        <span>{{ problem.message }}</span>
      </button>
    </section>

    <div v-if="status" class="studio-status" :class="statusKind" role="status">{{ status }}</div>

    <div v-if="dialog" class="studio-dialog-backdrop" @keydown.esc="finishDialog(dialog.kind === 'confirm' ? false : null)">
      <form class="studio-dialog" @submit.prevent="finishDialog(dialog.kind === 'confirm' ? true : dialog.value)">
        <h2>{{ dialog.title }}</h2>
        <p>{{ dialog.message }}</p>
        <input
          v-if="dialog.kind === 'text'"
          v-model="dialog.value"
          aria-label="输入值"
          autofocus
        >
        <div class="studio-dialog-actions">
          <button type="button" @click="finishDialog(dialog.kind === 'confirm' ? false : null)">取消</button>
          <button class="primary" type="submit">{{ dialog.kind === 'confirm' ? '确认' : '继续' }}</button>
        </div>
      </form>
    </div>
  </main>
</template>
