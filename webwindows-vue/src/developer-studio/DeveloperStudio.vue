<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import FileTreeNode from "./FileTreeNode.vue";
import MonacoEditor from "./editor/MonacoEditor.vue";
import ManifestInspector from "./manifest/ManifestInspector.vue";
import { validateManifestText } from "./manifest/manifest-validator.js";
import { selectManifestVersion } from "./manifest/manifest-version.js";
import { createHelloWebWindowsTemplate } from "./project/hello-template.js";
import { childPath, ProjectRepository } from "./project/project-repository.js";
import { normalizeProjectPath, parentProjectPath, projectPathName } from "./project/path-policy.js";
import { buildProjectTree, languageForPath } from "./project/tree-model.js";
import { createProjectSnapshot } from "./snapshot/project-snapshot.js";
import { loadStudioPlatformContracts } from "./validation/platform-contracts.js";
import { validateProjectSnapshot } from "./validation/project-validator.js";
import { PreviewHostClient } from "./preview/preview-host-client.js";
import { PreviewSessionController } from "./preview/preview-session-controller.js";

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
const permissionRegistry = ref(null);
const brokerMethods = ref(null);
const validationReport = ref(null);
const buildResult = ref(null);
const taskBusy = ref(false);
const previewHostFrame = ref(null);
const previewHostReady = ref(false);
const previewSession = ref(null);
const consoleEvents = ref([]);
const bottomPanel = ref("problems");
const inspectorMode = ref("preview");
const consoleLevel = ref("all");
const status = ref("");
const statusKind = ref("");
const dialog = ref(null);
let dialogResolve = null;
let saveTimer = 0;
let manifestValidationSequence = 0;
let previewHostClient = null;
let previewController = null;

const tree = computed(() => buildProjectTree(entries.value));
const activeEntry = computed(() => entries.value.find((entry) => entry.path === activeFile.value));
const editorLanguage = computed(() => languageForPath(activeFile.value));
const activeMarkers = computed(() => activeFile.value === "manifest.json" ? manifestDiagnostics.value : []);
const activeManifestVersion = computed(() => selectManifestVersion(manifestValue.value));
const displayedProblems = computed(() => validationReport.value?.diagnostics || manifestDiagnostics.value.map((problem) => ({
  ruleId: "Manifest",
  severity: problem.severity,
  path: problem.path,
  message: problem.message
})));
const displayedConsoleEvents = computed(() => consoleLevel.value === "all"
  ? consoleEvents.value
  : consoleEvents.value.filter((event) => event.level === consoleLevel.value));

onMounted(async () => {
  try {
    const contracts = await loadStudioPlatformContracts();
    permissionRegistry.value = contracts.permissionRegistry;
    brokerMethods.value = contracts.brokerMethods;
    await refreshProjects();
    if (projects.value.length) await openProject(projects.value[0].uuid);
  } catch (error) {
    showError(error);
  }
});

onBeforeUnmount(() => {
  clearTimeout(saveTimer);
  previewController?.dispose().catch(() => {});
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
  if (previewSession.value) await stopPreview();
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
  invalidateBuildState();
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
    invalidateBuildState();
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
  invalidateBuildState();
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
    invalidateBuildState();
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
    invalidateBuildState();
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
    invalidateBuildState();
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

async function createCurrentSnapshot() {
  if (!activeProject.value) throw new Error("请先打开项目。");
  await flushSave();
  return createProjectSnapshot(repository, activeProject.value.uuid);
}

async function validateProject() {
  if (taskBusy.value) return;
  taskBusy.value = true;
  try {
    const snapshot = await createCurrentSnapshot();
    const contracts = await loadStudioPlatformContracts();
    validationReport.value = await validateProjectSnapshot(snapshot, { contracts });
    buildResult.value = null;
    showStatus(validationReport.value.passed ? "项目验证通过。" : `验证发现 ${validationReport.value.errorCount} 个错误。`);
  } catch (error) {
    showError(error);
  } finally {
    taskBusy.value = false;
  }
}

async function buildProject() {
  if (taskBusy.value) return;
  taskBusy.value = true;
  try {
    const snapshot = await createCurrentSnapshot();
    const contracts = await loadStudioPlatformContracts();
    const { buildProjectPackage } = await import("./build/deterministic-builder.js");
    buildResult.value = await buildProjectPackage(snapshot, { contracts });
    validationReport.value = buildResult.value.validationReport;
    showStatus(buildResult.value.artifactReady ? "确定性 ZIP 构建完成。" : "构建被验证错误阻止。");
  } catch (error) {
    showError(error);
  } finally {
    taskBusy.value = false;
  }
}

function exportBuild() {
  if (!buildResult.value?.artifactReady || !buildResult.value.zipBytes) return;
  const identity = buildResult.value.manifestIdentity;
  const baseName = `${identity?.id || "webwindows-function"}-${identity?.version || "build"}`.replace(/[^a-z0-9._-]+/gi, "-");
  const blob = new Blob([buildResult.value.zipBytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${baseName}.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function invalidateBuildState() {
  validationReport.value = null;
  buildResult.value = null;
}

async function connectPreviewHost() {
  previewHostReady.value = false;
  previewController?.dispose().catch(() => {});
  previewHostClient = new PreviewHostClient({
    onConsole: (event) => {
      const active = previewSession.value || previewController?.activeSession;
      if (!active || event?.sessionId !== active.sessionId || event?.snapshotId !== active.snapshotId) return;
      consoleEvents.value = [...consoleEvents.value, event].slice(-1000);
    },
    onState: (event) => {
      if (!previewSession.value || event?.sessionId !== previewSession.value.sessionId) return;
      previewSession.value = { ...previewSession.value, state: event.state };
    }
  });
  previewController = new PreviewSessionController({ hostClient: previewHostClient });
  try {
    await previewHostClient.connect(previewHostFrame.value);
    previewHostReady.value = true;
  } catch (error) {
    showError(error);
  }
}

async function runPreview({ reload = false } = {}) {
  if (taskBusy.value || !previewController || !previewHostReady.value) return;
  taskBusy.value = true;
  try {
    const snapshot = await createCurrentSnapshot();
    const contracts = await loadStudioPlatformContracts();
    const result = reload && previewSession.value
      ? await previewController.reload(snapshot, { contracts })
      : await previewController.run(snapshot, { contracts });
    validationReport.value = result.validationReport;
    buildResult.value = null;
    bottomPanel.value = result.started ? "console" : "problems";
    inspectorMode.value = "preview";
    if (!result.started) {
      showStatus(`Developer Preview 被 ${result.validationReport.errorCount} 个验证错误阻止。`);
      return;
    }
    previewSession.value = result.session;
    showStatus(reload ? "Developer Preview 已从新 Snapshot 重新加载。" : "Developer Preview 已启动。");
  } catch (error) {
    showError(error);
  } finally {
    taskBusy.value = false;
  }
}

async function stopPreview() {
  if (!previewController || !previewSession.value) return;
  try {
    await previewController.stop(previewSession.value.sessionId);
    previewSession.value = null;
    showStatus("Developer Preview 已停止，会话凭据已撤销。");
  } catch (error) {
    showError(error);
  }
}

function clearConsole() {
  consoleEvents.value = [];
}

function consoleMessage(event) {
  return event.arguments.map((value) => typeof value === "string" ? value : JSON.stringify(value)).join(" ");
}

function openProblem(problem) {
  const entry = entries.value.find((candidate) => candidate.kind === "file"
    && (problem.path === candidate.path || problem.path?.startsWith(`${candidate.path}$`)));
  if (entry) openFile(entry.path).catch(showError);
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
      <button type="button" :disabled="!activeProject || taskBusy" @click="validateProject">Validate</button>
      <button class="primary" type="button" :disabled="!activeProject || taskBusy" @click="buildProject">Build</button>
      <button class="primary" type="button" :disabled="!activeProject || taskBusy || !previewHostReady" @click="runPreview()">Run</button>
      <button type="button" :disabled="!previewSession || taskBusy" @click="runPreview({ reload: true })">Reload</button>
      <button type="button" :disabled="!previewSession" @click="stopPreview">Stop</button>
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
        <div class="panel-heading">
          <span>Inspector</span>
          <div class="panel-switcher">
            <button type="button" :class="{ active: inspectorMode === 'manifest' }" @click="inspectorMode = 'manifest'">Manifest</button>
            <button type="button" :class="{ active: inspectorMode === 'preview' }" @click="inspectorMode = 'preview'">Preview</button>
          </div>
        </div>
        <div v-show="inspectorMode === 'manifest'" class="inspector-content">
          <h2>Manifest {{ activeManifestVersion === 2 ? 'v2' : activeManifestVersion === 1 ? 'v1' : 'unsupported' }}</h2>
          <p class="project-uuid">项目 UUID：{{ activeProject.uuid }}</p>
          <ManifestInspector
            :manifest="manifestValue"
            :diagnostics="manifestDiagnostics"
            :permission-registry="permissionRegistry"
            :broker-methods="brokerMethods"
            @update:manifest="updateManifestForm($event).catch(showError)"
            @open-json="openFile('manifest.json').catch(showError)"
          />
          <section class="build-inspector">
            <h3>Validation</h3>
            <p v-if="!validationReport">尚未创建 Snapshot 验证。</p>
            <dl v-else>
              <div><dt>Result</dt><dd>{{ validationReport.passed ? 'Passed' : 'Blocked' }}</dd></div>
              <div><dt>Errors</dt><dd>{{ validationReport.errorCount }}</dd></div>
              <div><dt>Warnings</dt><dd>{{ validationReport.warningCount }}</dd></div>
              <div><dt>Files</dt><dd>{{ validationReport.packageFacts.fileCount }}</dd></div>
              <div><dt>Bytes</dt><dd>{{ validationReport.packageFacts.unpackedBytes }}</dd></div>
            </dl>
            <template v-if="buildResult">
              <h3>Build Result</h3>
              <p v-if="!buildResult.artifactReady" class="build-blocked">验证未通过，没有生成可发布 ZIP。</p>
              <dl v-else>
                <div><dt>Size</dt><dd>{{ buildResult.zipSize }} bytes</dd></div>
                <div><dt>Files</dt><dd>{{ buildResult.fileCount }}</dd></div>
                <div class="hash-row"><dt>SHA-256</dt><dd>{{ buildResult.sha256 }}</dd></div>
              </dl>
              <button type="button" :disabled="!buildResult.artifactReady" @click="exportBuild">Export ZIP</button>
            </template>
          </section>
        </div>
        <div v-show="inspectorMode === 'preview'" class="preview-inspector">
          <div class="preview-session-banner">
            <strong>Developer Preview</strong>
            <span v-if="previewSession">{{ previewSession.state }} · {{ previewSession.snapshotId }}</span>
            <span v-else>无活动会话</span>
          </div>
          <iframe
            ref="previewHostFrame"
            class="preview-host-frame"
            src="developer-preview-host.html?v=20260829-1"
            title="Trusted Developer Preview Host"
            referrerpolicy="no-referrer"
            @load="connectPreviewHost"
          ></iframe>
        </div>
      </aside>
    </section>

    <section v-else class="empty-workspace studio-main">
      <h2>创建第一个 WebWindows 功能</h2>
      <p>项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。</p>
      <button class="primary" type="button" @click="createProject">新建 Hello WebWindows</button>
    </section>

    <section class="problems-panel">
      <div class="bottom-tabs">
        <button type="button" :class="{ active: bottomPanel === 'problems' }" @click="bottomPanel = 'problems'">Problems <span>{{ displayedProblems.length }}</span></button>
        <button type="button" :class="{ active: bottomPanel === 'console' }" @click="bottomPanel = 'console'">Console <span>{{ consoleEvents.length }}</span></button>
        <span class="bottom-spacer"></span>
        <template v-if="bottomPanel === 'console'">
          <select v-model="consoleLevel" aria-label="Console level">
            <option value="all">All levels</option>
            <option v-for="level in ['log', 'info', 'warn', 'error', 'debug']" :key="level" :value="level">{{ level }}</option>
          </select>
          <button type="button" @click="clearConsole">Clear</button>
        </template>
      </div>
      <template v-if="bottomPanel === 'problems'">
        <div v-if="!displayedProblems.length" class="problems-empty">当前 Snapshot 未发现问题。</div>
        <button
          v-for="(problem, index) in displayedProblems"
          :key="`${problem.ruleId}:${problem.path}:${index}`"
          type="button"
          class="problem-row"
          @click="openProblem(problem)"
        >
          <span class="problem-severity" :class="problem.severity">{{ problem.ruleId }}</span>
          <code>{{ problem.path }}</code>
          <span>{{ problem.message }}</span>
        </button>
      </template>
      <template v-else>
        <div v-if="!displayedConsoleEvents.length" class="problems-empty">当前 Developer Preview 尚无 Console 输出。</div>
        <div v-for="event in displayedConsoleEvents" :key="`${event.sessionId}:${event.sequence}`" class="console-row" :class="event.level">
          <time>{{ event.timestamp }}</time>
          <strong>{{ event.level }}</strong>
          <span>{{ consoleMessage(event) }}</span>
          <code>{{ event.snapshotId }}</code>
        </div>
      </template>
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
