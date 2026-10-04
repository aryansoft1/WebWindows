<template>
  <teleport to="body">
    <section
      v-if="popoverVisible"
      class="ww-workspace-quick-panel"
      :aria-label="t('工作空间')"
      @pointerdown.stop
      @click.stop
      @keydown.esc="closePopover"
    >
      <header class="ww-workspace-quick-heading">
        <strong>{{ t('工作空间') }}</strong>
        <button type="button" :title="t('打开工作空间总览')" @click="open">{{ t('管理') }}</button>
      </header>
      <div class="ww-workspace-quick-list">
        <button
          v-for="workspace in model.workspaces"
          :key="workspace.id"
          type="button"
          class="ww-workspace-quick-item"
          :class="{ 'is-active': workspace.id === model.activeWorkspaceId }"
          :aria-current="workspace.id === model.activeWorkspaceId ? 'true' : undefined"
          @click="switchTo(workspace.id)"
        >
          <span class="ww-workspace-quick-mark" aria-hidden="true">{{ workspace.id === model.activeWorkspaceId ? '✓' : '' }}</span>
          <span class="ww-workspace-quick-label">{{ displayWorkspaceName(workspace.name) }}</span>
          <span class="ww-workspace-quick-count">{{ workspace.windows.length }}</span>
        </button>
      </div>
      <button type="button" class="ww-workspace-quick-create" @click="create">＋ {{ t('新建工作空间') }}</button>
    </section>

    <div
      v-if="visible"
      ref="overlay"
      class="ww-workspace-overview"
      role="dialog"
      aria-modal="true"
      :aria-label="t('工作空间总览')"
      tabindex="-1"
      @click.self="close"
      @keydown.esc="close"
    >
      <div class="ww-workspace-panel">
        <header class="ww-workspace-heading">
          <div>
            <p>WebWindows · Workspace</p>
            <h1>{{ t('工作空间总览') }}</h1>
            <span>{{ t('按场景整理窗口，切换时保留应用当前状态') }}</span>
          </div>
          <button class="ww-workspace-close" type="button" :aria-label="t('关闭总览')" @click="close">×</button>
        </header>

        <div class="ww-workspace-grid">
          <article
            v-for="(workspace, index) in model.workspaces"
            :key="workspace.id"
            class="ww-workspace-card"
            :class="{ 'is-active': workspace.id === model.activeWorkspaceId }"
            @dragover.prevent
            @drop="dropOnWorkspace(workspace.id, index, $event)"
          >
            <div class="ww-workspace-card-heading">
              <button
                class="ww-workspace-reorder"
                type="button"
                draggable="true"
                :title="t('拖动以调整顺序')"
                :aria-label="t('调整工作空间顺序')"
                @dragstart="startWorkspaceDrag(workspace.id, $event)"
              >⠿</button>
              <span class="ww-workspace-name">{{ displayWorkspaceName(workspace.name) }}</span>
              <span class="ww-workspace-count">{{ workspaceAppCount(workspace) }} {{ t('个应用') }}</span>
              <button type="button" class="ww-workspace-action" :title="t('重命名')" @click="rename(workspace)">✎</button>
              <button
                type="button"
                class="ww-workspace-action danger"
                :title="t('删除工作空间')"
                :disabled="model.workspaces.length <= 1"
                @click="remove(workspace)"
              >×</button>
            </div>

            <button
              type="button"
              class="ww-workspace-preview"
              :aria-pressed="workspace.id === model.activeWorkspaceId"
              @click="switchTo(workspace.id)"
            >
              <img v-if="workspace.wallpaper" class="ww-workspace-preview-wallpaper" :src="workspace.wallpaper" alt="" />
              <div class="ww-workspace-preview-apps" aria-hidden="true">
                <span v-for="app in workspaceSceneApps(workspace).slice(0, 5)" :key="app.id" class="ww-workspace-preview-app">
                  <img v-if="app.iconUrl" :src="app.iconUrl" alt="" />
                  <small>{{ app.title }}</small>
                </span>
              </div>
              <span
                v-for="(win, windowIndex) in workspaceWindows(workspace)"
                :key="win.id"
                class="ww-workspace-mini-window"
                :class="{ minimized: win.minimized }"
                :style="miniWindowStyle(win, windowIndex)"
                draggable="true"
                :title="format('拖动窗口“{name}”到另一个工作空间', { name: win.title })"
                @click.stop="switchTo(workspace.id, win.id)"
                @dragstart.stop="startWindowDrag(win.id, $event)"
              >
                <img v-if="win.iconUrl" :src="win.iconUrl" alt="" />
                <span>{{ win.title }}</span>
              </span>
              <span v-if="!workspace.windows.length && !workspace.shortcuts.length" class="ww-workspace-empty">{{ t('空工作空间') }}</span>
            </button>

            <div class="ww-workspace-scene-meta">
              <div class="ww-workspace-scene-icons" :aria-label="t('主要应用')">
                <template v-for="app in workspaceSceneApps(workspace).slice(0, 4)" :key="app.id">
                  <img
                    v-if="app.iconUrl"
                    :src="app.iconUrl"
                    :alt="app.title"
                    :title="app.title"
                  />
                </template>
                <span v-if="!workspaceSceneApps(workspace).length">{{ t('没有主要应用') }}</span>
              </div>
              <span class="ww-workspace-recent">{{ t('最近使用') }} · {{ recentUsage(workspace.lastUsedAt) }}</span>
            </div>

            <div class="ww-workspace-card-footer">
              <span v-if="workspace.id === model.activeWorkspaceId" class="ww-workspace-current">{{ t('当前工作空间') }}</span>
              <span v-else>{{ t('拖动窗口卡片到此处即可移动') }}</span>
              <button v-if="workspace.id !== model.activeWorkspaceId" type="button" @click="switchTo(workspace.id)">{{ t('切换') }}</button>
            </div>
          </article>

          <button class="ww-workspace-create" type="button" @click="create">
            <span aria-hidden="true">＋</span>
            <strong>{{ t('新建桌面') }}</strong>
            <small>{{ displayWorkspaceName(nextWorkspaceName) }}</small>
          </button>
        </div>

        <footer class="ww-workspace-settings">
          <strong>{{ t('任务栏显示') }}</strong>
          <label>
            <input type="radio" name="ww-workspace-taskbar-mode" value="active" checked disabled />
            {{ t('当前工作空间') }}
          </label>
          <span class="ww-workspace-shortcut">{{ t('快捷键：Web 键 + Tab') }}</span>
        </footer>
      </div>

      <div
        v-if="renamingWorkspaceId"
        class="ww-workspace-rename-backdrop"
        @click.self="cancelRename"
        @keydown.esc="cancelRename"
      >
        <form class="ww-workspace-rename-dialog" role="dialog" aria-modal="true" :aria-label="t('工作空间名称')" @submit.prevent="saveRename">
          <label :for="'ww-workspace-rename-input'">{{ t('工作空间名称') }}</label>
          <input
            id="ww-workspace-rename-input"
            ref="renameInput"
            v-model="renameValue"
            type="text"
            maxlength="48"
            autocomplete="off"
            @keydown.esc.stop.prevent="cancelRename"
          />
          <div class="ww-workspace-rename-actions">
            <button type="button" @click="cancelRename">{{ t('取消') }}</button>
            <button type="submit" :disabled="!renameValue.trim()">{{ t('保存') }}</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { workspaceManager } from '../stores/workspaceManager'

const visible = ref(false)
const popoverVisible = ref(false)
const overlay = ref(null)
const renamingWorkspaceId = ref(null)
const renameInput = ref(null)
const renameValue = ref('')
const languageRevision = ref(0)
let taskbarButton = null
const model = ref(workspaceManager.getSnapshot())
const currentLocale = () => ({ zh: 'zh-CN', tw: 'zh-TW', en: 'en-US', jp: 'ja-JP' }[window.WebWindowsI18n?.getLanguage?.() || 'zh'] || 'zh-CN')
// Keep this system panel self-contained: the legacy global dictionary does not
// contain every Workspace string in every language and otherwise causes mixed UI.
const sceneCopy = {
  zh: {
    '工作空间': '工作空间', '打开工作空间总览': '打开工作空间总览', '管理': '管理', '新建工作空间': '新建工作空间',
    '工作空间总览': '工作空间总览', '按场景整理窗口，切换时保留应用当前状态': '按场景整理窗口，切换时保留应用当前状态', '关闭总览': '关闭总览',
    '拖动以调整顺序': '拖动以调整顺序', '调整工作空间顺序': '调整工作空间顺序', '个应用': '个应用', '重命名': '重命名', '删除工作空间': '删除工作空间',
    '拖动窗口“{name}”到另一个工作空间': '拖动窗口“{name}”到另一个工作空间', '空工作空间': '空工作空间', '主要应用': '主要应用', '没有主要应用': '没有主要应用',
    '最近使用': '最近使用', '当前工作空间': '当前工作空间', '拖动窗口卡片到此处即可移动': '拖动窗口卡片到此处即可移动', '切换': '切换', '新建桌面': '新建桌面',
    '任务栏显示': '任务栏显示', '快捷键：Web 键 + Tab': '快捷键：Web 键 + Tab', '工作空间名称': '工作空间名称', '取消': '取消', '保存': '保存',
    '工作空间切换与管理': '工作空间切换与管理', '打开工作空间切换面板': '打开工作空间切换面板', '日常': '日常', '桌面': '桌面', '默认工作空间': '默认工作空间',
    '“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？': '“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？',
    '删除工作空间“{name}”？': '删除工作空间“{name}”？', '尚未使用': '尚未使用', '刚刚': '刚刚', '{count} 分钟前': '{count} 分钟前', '{count} 小时前': '{count} 小时前'
  },
  tw: {
    '工作空间': '工作空間', '打开工作空间总览': '開啟工作空間總覽', '管理': '管理', '新建工作空间': '新增工作空間',
    '工作空间总览': '工作空間總覽', '按场景整理窗口，切换时保留应用当前状态': '依情境整理視窗，切換時保留應用程式目前狀態', '关闭总览': '關閉總覽',
    '拖动以调整顺序': '拖曳以調整順序', '调整工作空间顺序': '調整工作空間順序', '个应用': '個應用程式', '重命名': '重新命名', '删除工作空间': '刪除工作空間',
    '拖动窗口“{name}”到另一个工作空间': '將視窗「{name}」拖曳到另一個工作空間', '空工作空间': '空白工作空間', '主要应用': '主要應用程式', '没有主要应用': '沒有主要應用程式',
    '最近使用': '最近使用', '当前工作空间': '目前工作空間', '拖动窗口卡片到此处即可移动': '將視窗卡片拖曳至此即可移動', '切换': '切換', '新建桌面': '新增桌面',
    '任务栏显示': '工作列顯示', '快捷键：Web 键 + Tab': '快速鍵：Web 鍵 + Tab', '工作空间名称': '工作空間名稱', '取消': '取消', '保存': '儲存',
    '工作空间切换与管理': '工作空間切換與管理', '打开工作空间切换面板': '開啟工作空間切換面板', '日常': '日常', '桌面': '桌面', '默认工作空间': '預設工作空間',
    '“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？': '「{name}」中有 {count} 個視窗。刪除後視窗會移至「{destination}」，要繼續嗎？',
    '删除工作空间“{name}”？': '要刪除工作空間「{name}」嗎？', '尚未使用': '尚未使用', '刚刚': '剛剛', '{count} 分钟前': '{count} 分鐘前', '{count} 小时前': '{count} 小時前'
  },
  en: {
    '工作空间': 'Workspace', '打开工作空间总览': 'Open workspace overview', '管理': 'Manage', '新建工作空间': 'New workspace',
    '工作空间总览': 'Workspace overview', '按场景整理窗口，切换时保留应用当前状态': 'Organize windows by scene and keep apps running when you switch', '关闭总览': 'Close overview',
    '拖动以调整顺序': 'Drag to reorder', '调整工作空间顺序': 'Reorder workspaces', '个应用': 'apps', '重命名': 'Rename', '删除工作空间': 'Delete workspace',
    '拖动窗口“{name}”到另一个工作空间': 'Drag “{name}” to another workspace', '空工作空间': 'Empty workspace', '主要应用': 'Key apps', '没有主要应用': 'No featured apps',
    '最近使用': 'Last used', '当前工作空间': 'Current workspace', '拖动窗口卡片到此处即可移动': 'Drop a window card here to move it', '切换': 'Switch', '新建桌面': 'New desktop',
    '任务栏显示': 'Taskbar shows', '快捷键：Web 键 + Tab': 'Shortcut: Web key + Tab', '工作空间名称': 'Workspace name', '取消': 'Cancel', '保存': 'Save',
    '工作空间切换与管理': 'Switch and manage workspaces', '打开工作空间切换面板': 'Open workspace switcher', '日常': 'Everyday', '桌面': 'Desktop', '默认工作空间': 'Default workspace',
    '“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？': '“{name}” has {count} windows. They will move to “{destination}” if you delete it. Continue?',
    '删除工作空间“{name}”？': 'Delete workspace “{name}”?', '尚未使用': 'Not used yet', '刚刚': 'Just now', '{count} 分钟前': '{count} min ago', '{count} 小时前': '{count} hr ago'
  },
  jp: {
    '工作空间': 'ワークスペース', '打开工作空间总览': 'ワークスペース一覧を開く', '管理': '管理', '新建工作空间': '新しいワークスペース',
    '工作空间总览': 'ワークスペース一覧', '按场景整理窗口，切换时保留应用当前状态': 'シーンごとにウィンドウを整理し、切り替えてもアプリの状態を保持します', '关闭总览': '一覧を閉じる',
    '拖动以调整顺序': 'ドラッグして並べ替え', '调整工作空间顺序': 'ワークスペースの順序を変更', '个应用': '個のアプリ', '重命名': '名前を変更', '删除工作空间': 'ワークスペースを削除',
    '拖动窗口“{name}”到另一个工作空间': '「{name}」を別のワークスペースにドラッグ', '空工作空间': '空のワークスペース', '主要应用': '主なアプリ', '没有主要应用': '主なアプリはありません',
    '最近使用': '最近使用', '当前工作空间': '現在のワークスペース', '拖动窗口卡片到此处即可移动': 'ウィンドウをここにドラッグして移動', '切换': '切り替え', '新建桌面': '新しいデスクトップ',
    '任务栏显示': 'タスクバーの表示', '快捷键：Web 键 + Tab': 'ショートカット：Web キー + Tab', '工作空间名称': 'ワークスペース名', '取消': 'キャンセル', '保存': '保存',
    '工作空间切换与管理': 'ワークスペースの切り替えと管理', '打开工作空间切换面板': 'ワークスペース切り替えパネルを開く', '日常': '日常', '桌面': 'デスクトップ', '默认工作空间': '既定のワークスペース',
    '“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？': '「{name}」にはウィンドウが {count} 個あります。削除すると「{destination}」に移動します。続行しますか？',
    '删除工作空间“{name}”？': 'ワークスペース「{name}」を削除しますか？', '尚未使用': '未使用', '刚刚': 'たった今', '{count} 分钟前': '{count} 分前', '{count} 小时前': '{count} 時間前'
  }
}
const nextWorkspaceName = computed(() => {
  const names = new Set(model.value.workspaces.map((workspace) => workspace.name))
  let number = 2
  while (names.has(`桌面 ${number}`)) number += 1
  return `桌面 ${number}`
})

function refresh() {
  languageRevision.value += 1
  model.value = workspaceManager.getSnapshot()
  if (taskbarButton) {
    const workspace = workspaceManager.getActiveWorkspace()
    taskbarButton.title = `${t('工作空间切换与管理')} · ${displayWorkspaceName(workspace?.name || '日常')}`
    taskbarButton.setAttribute('aria-label', t('打开工作空间切换面板'))
    taskbarButton.setAttribute('aria-expanded', popoverVisible.value ? 'true' : 'false')
    taskbarButton.classList.toggle('is-open', popoverVisible.value)
  }
}

function t(source) {
  languageRevision.value
  const language = window.WebWindowsI18n?.getLanguage?.() || 'zh'
  if (sceneCopy[language] && Object.hasOwn(sceneCopy[language], source)) return sceneCopy[language][source]
  return window.WebWindowsI18n?.translate?.(source) || source
}

function format(source, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value ?? '')), t(source))
}

function displayWorkspaceName(name) {
  languageRevision.value
  if (name === '日常') return t('日常')
  const numbered = /^桌面 (\d+)$/.exec(name)
  return numbered ? `${t('桌面')} ${numbered[1]}` : name
}

function open() {
  closePopover()
  refresh()
  visible.value = true
  requestAnimationFrame(() => overlay.value?.focus())
}

function close() {
  visible.value = false
}

function closePopover() {
  popoverVisible.value = false
  refresh()
}

function togglePopover() {
  refresh()
  popoverVisible.value = !popoverVisible.value
  refresh()
}

function toggle() {
  if (visible.value) close()
  else open()
}

function switchTo(workspaceId, windowId) {
  workspaceManager.switchWorkspace(workspaceId)
  if (windowId) {
    const element = document.getElementById(`win-${windowId}`)
    if (element?.style.display === 'none') {
      element.style.display = ''
      element.dataset.wwMinimized = '0'
      workspaceManager.persistWindow(element)
    }
    window.focusTargetWindow?.(windowId)
  }
  closePopover()
  close()
}

function create() {
  const workspace = workspaceManager.createWorkspace()
  workspaceManager.switchWorkspace(workspace.id)
  refresh()
  closePopover()
}

function rename(workspace) {
  renamingWorkspaceId.value = workspace.id
  renameValue.value = workspace.name
  nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}

function cancelRename() {
  renamingWorkspaceId.value = null
  renameValue.value = ''
}

function saveRename() {
  const name = renameValue.value.trim()
  if (!renamingWorkspaceId.value || !name) return
  workspaceManager.renameWorkspace(renamingWorkspaceId.value, name)
  cancelRename()
  refresh()
}

function remove(workspace) {
  if (model.value.workspaces.length <= 1) return
  const hasWindows = workspace.windows.length > 0
  const message = hasWindows
    ? format('“{name}”中有 {count} 个窗口。删除后窗口会移至“{destination}”，继续吗？', {
      name: displayWorkspaceName(workspace.name),
      count: workspace.windows.length,
      destination: displayWorkspaceName(model.value.workspaces.find((item) => item.id === model.value.defaultWorkspaceId && item.id !== workspace.id)?.name || '默认工作空间'),
    })
    : format('删除工作空间“{name}”？', { name: displayWorkspaceName(workspace.name) })
  if (!window.confirm(message)) return
  workspaceManager.removeWorkspace(workspace.id, { confirmed: true })
  refresh()
}

function workspaceWindows(workspace) {
  return workspace.windows.map((id) => model.value.windows[id]).filter(Boolean)
}

function workspaceAppCount(workspace) {
  const ids = new Set(workspaceWindows(workspace).map((win) => win.appId || win.id))
  return ids.size
}

function workspaceSceneApps(workspace) {
  const apps = []
  const seen = new Set()
  workspaceWindows(workspace).forEach((win) => {
    const id = win.appId || win.id
    if (seen.has(id)) return
    seen.add(id)
    apps.push({ id, title: win.title || id, iconUrl: win.iconUrl || '' })
  })
  ;(workspace.shortcuts || []).forEach((id) => {
    if (seen.has(id)) return
    const element = document.getElementById(id)
    if (!element) return
    seen.add(id)
    apps.push({
      id,
      title: element.querySelector('label')?.textContent?.trim() || element.title || id,
      iconUrl: element.querySelector('img')?.getAttribute('src') || ''
    })
  })
  return apps
}

function recentUsage(timestamp) {
  const value = Date.parse(timestamp || '')
  if (!Number.isFinite(value)) return t('尚未使用')
  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000))
  if (minutes < 1) return t('刚刚')
  if (minutes < 60) return format('{count} 分钟前', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return format('{count} 小时前', { count: hours })
  return new Intl.DateTimeFormat(currentLocale(), { month: 'short', day: 'numeric' }).format(value)
}

function miniWindowStyle(win, index) {
  const width = Math.max(22, Math.min(60, (Number.parseFloat(win.geometry?.width) || 900) / 18))
  const height = Math.max(18, Math.min(48, (Number.parseFloat(win.geometry?.height) || 640) / 20))
  const left = Math.max(3, Math.min(92 - width / 2, (Number.parseFloat(win.geometry?.left) || 120) / 14 + (index % 2) * 9))
  const top = Math.max(6, Math.min(82 - height / 2, (Number.parseFloat(win.geometry?.top) || 100) / 10 + Math.floor(index / 2) * 8))
  return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, zIndex: win.zIndex || index + 1 }
}

function startWindowDrag(windowId, event) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/x-webwindows-window', windowId)
}

function startWorkspaceDrag(workspaceId, event) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/x-webwindows-workspace', workspaceId)
}

function dropOnWorkspace(workspaceId, index, event) {
  const windowId = event.dataTransfer.getData('application/x-webwindows-window')
  if (windowId) {
    workspaceManager.moveWindowToWorkspace(windowId, workspaceId)
    refresh()
    return
  }
  const sourceWorkspaceId = event.dataTransfer.getData('application/x-webwindows-workspace')
  if (sourceWorkspaceId) workspaceManager.reorderWorkspace(sourceWorkspaceId, index)
  refresh()
}

function onKeydown(event) {
  const webKey = event.metaKey || event.getModifierState?.('OS')
  if (webKey && event.key === 'Tab') {
    event.preventDefault()
    toggle()
  }
}

function onToggleEvent() {
  toggle()
}

function onDocumentPointerdown(event) {
  if (!popoverVisible.value) return
  if (event.target.closest?.('.ww-workspace-quick-panel, #ww-workspace-launcher')) return
  closePopover()
}

function mountTaskbarButton() {
  const taskbar = document.querySelector('.taskbar')
  const datetime = taskbar?.querySelector('#taskbar-datetime')
  if (!datetime || document.getElementById('ww-workspace-launcher')) return
  taskbarButton = document.createElement('button')
  taskbarButton.id = 'ww-workspace-launcher'
  taskbarButton.className = 'ww-workspace-launcher'
  taskbarButton.type = 'button'
  taskbarButton.title = t('工作空间切换与管理')
  taskbarButton.setAttribute('aria-label', t('打开工作空间切换面板'))
  taskbarButton.setAttribute('aria-haspopup', 'dialog')
  taskbarButton.setAttribute('aria-expanded', 'false')
  taskbarButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="4" width="12" height="10" rx="2"></rect><rect x="8.5" y="9" width="12" height="11" rx="2"></rect></svg><span class="ww-workspace-launcher-indicator"></span>'
  taskbarButton.addEventListener('click', togglePopover)
  taskbar.append(taskbarButton)
  refresh()
}

onMounted(() => {
  mountTaskbarButton()
  window.addEventListener('keydown', onKeydown, true)
  document.addEventListener('pointerdown', onDocumentPointerdown)
  window.addEventListener('webwindows:workspace-overview-toggle', onToggleEvent)
  window.addEventListener('webwindows:language-changed', refresh)
  Object.values(workspaceManager.events).forEach((eventName) => window.addEventListener(eventName, refresh))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, true)
  document.removeEventListener('pointerdown', onDocumentPointerdown)
  window.removeEventListener('webwindows:workspace-overview-toggle', onToggleEvent)
  window.removeEventListener('webwindows:language-changed', refresh)
  Object.values(workspaceManager.events).forEach((eventName) => window.removeEventListener(eventName, refresh))
  taskbarButton?.removeEventListener('click', togglePopover)
  taskbarButton?.remove()
  taskbarButton = null
})
</script>

<style>
.ww-workspace-inactive {
  visibility: hidden !important;
  pointer-events: none !important;
  transition-delay: 180ms !important;
}

.ww-workspace-overview {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: grid;
  place-items: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  color: #f4f8ff;
  background: rgba(5, 22, 45, .54);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  animation: ww-workspace-fade-in 180ms ease-out both;
}

.ww-workspace-panel {
  width: min(1120px, 100%);
  max-height: min(820px, 100%);
  overflow: auto;
  padding: clamp(18px, 3vw, 32px);
  border: 1px solid rgba(177, 216, 255, .38);
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(14, 43, 77, .91), rgba(13, 30, 55, .86));
  box-shadow: 0 24px 80px rgba(0, 0, 0, .42);
  box-sizing: border-box;
}

.ww-workspace-heading,
.ww-workspace-card-heading,
.ww-workspace-card-footer,
.ww-workspace-settings {
  display: flex;
  align-items: center;
}

.ww-workspace-heading {
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.ww-workspace-heading p { margin: 0 0 5px; color: #91c9ff; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; }
.ww-workspace-heading h1 { margin: 0; font-size: clamp(23px, 3vw, 34px); }
.ww-workspace-heading span { display: block; margin-top: 7px; color: rgba(235, 245, 255, .76); font-size: 13px; }
.ww-workspace-close { width: 38px; height: 38px; border: 1px solid rgba(255,255,255,.25); border-radius: 50%; color: inherit; background: rgba(255,255,255,.08); font-size: 24px; cursor: pointer; }
.ww-workspace-launcher { position: relative; display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; margin: 0 3px; padding: 0; border: 1px solid transparent; border-radius: 8px; color: #fff; background: transparent; cursor: pointer; transition: background 140ms ease, border-color 140ms ease; }
.ww-workspace-launcher:hover, .ww-workspace-launcher.is-open { border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.17); }
.ww-workspace-launcher svg { width: 19px; height: 19px; fill: none; stroke: #e8f6ff; stroke-width: 1.7; }
.ww-workspace-launcher-indicator { position: absolute; right: 4px; bottom: 4px; width: 5px; height: 5px; border: 1px solid rgba(20,55,82,.9); border-radius: 50%; background: #58c5ff; }

/* Place the workspace shortcut after the clock at the far right of the taskbar. */
.taskbar > #ww-workspace-launcher { position: absolute; right: 4px; top: 5px; margin: 0; }
.taskbar > #taskbar-datetime { right: 44px; }
.taskbar > .taskbar-right { right: 120px; }

.ww-workspace-quick-panel { position: fixed; z-index: 2147482999; right: 12px; bottom: 52px; width: min(286px, calc(100vw - 24px)); max-height: min(440px, calc(100vh - 68px)); overflow: auto; box-sizing: border-box; padding: 10px; border: 1px solid rgba(185,220,255,.44); border-radius: 15px; color: #f4f8ff; background: linear-gradient(150deg, rgba(18,48,82,.97), rgba(11,29,53,.96)); box-shadow: 0 16px 48px rgba(0,0,0,.38); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); animation: ww-workspace-pop-in 140ms ease-out both; }
.ww-workspace-quick-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 3px 4px 9px; border-bottom: 1px solid rgba(255,255,255,.13); font-size: 13px; }
.ww-workspace-quick-heading button { border: 0; padding: 4px 7px; border-radius: 6px; color: #b9e3ff; background: transparent; font: inherit; font-size: 11px; cursor: pointer; }
.ww-workspace-quick-heading button:hover { background: rgba(255,255,255,.1); }
.ww-workspace-quick-list { display: grid; gap: 4px; max-height: 300px; overflow-y: auto; padding: 7px 0; }
.ww-workspace-quick-item { display: flex; min-width: 0; align-items: center; gap: 9px; padding: 8px; border: 1px solid transparent; border-radius: 8px; color: inherit; background: transparent; text-align: left; font: inherit; cursor: pointer; }
.ww-workspace-quick-item:hover { background: rgba(255,255,255,.09); }
.ww-workspace-quick-item.is-active { border-color: rgba(93,190,255,.48); background: rgba(36,133,215,.23); }
.ww-workspace-quick-mark { display: grid; width: 18px; height: 18px; flex: 0 0 18px; place-items: center; border: 1px solid rgba(220,239,255,.43); border-radius: 5px; color: #8fd4ff; font-size: 12px; }
.ww-workspace-quick-label { min-width: 0; flex: 1; overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ww-workspace-quick-count { color: rgba(225,241,255,.6); font-size: 11px; }
.ww-workspace-quick-create { width: 100%; border: 1px dashed rgba(172,219,255,.32); border-radius: 8px; padding: 8px; color: #d8efff; background: rgba(255,255,255,.035); text-align: left; font: inherit; font-size: 12px; cursor: pointer; }
.ww-workspace-quick-create:hover { border-color: #70c5ff; background: rgba(44,142,219,.18); }

.ww-workspace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: 14px;
}

.ww-workspace-card,
.ww-workspace-create {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 17px;
  background: rgba(255,255,255,.075);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.ww-workspace-card.is-active { border-color: #52b8ff; background: rgba(30, 128, 218, .2); box-shadow: 0 0 0 1px rgba(82,184,255,.25), 0 0 22px rgba(42,151,255,.18); }
.ww-workspace-card:hover { transform: translateY(-2px); }
.ww-workspace-card-heading { min-height: 31px; gap: 6px; }
.ww-workspace-reorder, .ww-workspace-action { border: 0; color: rgba(240,248,255,.86); background: transparent; cursor: grab; }
.ww-workspace-reorder { padding: 4px; font-size: 17px; }
.ww-workspace-action { padding: 4px 6px; font-size: 16px; cursor: pointer; }
.ww-workspace-action.danger { color: #ffc1c1; font-size: 20px; }
.ww-workspace-action:disabled { opacity: .35; cursor: default; }
.ww-workspace-name { overflow: hidden; font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.ww-workspace-count { margin-left: auto; color: rgba(232,243,255,.63); font-size: 11px; white-space: nowrap; }

.ww-workspace-preview {
  position: relative;
  display: block;
  width: 100%;
  height: 148px;
  margin-top: 9px;
  overflow: hidden;
  border: 1px solid rgba(180,220,255,.36);
  border-radius: 11px;
  background: radial-gradient(circle at 70% 20%, rgba(94,170,255,.55), transparent 45%), linear-gradient(135deg, #174a7e, #0b2747 72%);
  cursor: pointer;
}
.ww-workspace-preview-wallpaper { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; opacity: .58; }
.ww-workspace-preview-apps { position: absolute; z-index: 1; right: 7px; bottom: 6px; left: 7px; display: flex; gap: 5px; overflow: hidden; pointer-events: none; }
.ww-workspace-preview-app { display: grid; width: 42px; min-width: 0; justify-items: center; gap: 2px; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.8); }
.ww-workspace-preview-app img { width: 20px; height: 20px; object-fit: contain; }
.ww-workspace-preview-app small { max-width: 100%; overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }

.ww-workspace-mini-window {
  position: absolute;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 42px;
  min-height: 18px;
  padding: 5px 6px;
  border: 1px solid rgba(255,255,255,.78);
  border-radius: 6px;
  color: #24466b;
  background: rgba(247,251,255,.94);
  box-shadow: 0 3px 9px rgba(0,0,0,.26);
  font-size: 9px;
  text-align: left;
  cursor: grab;
}

.ww-workspace-mini-window img { width: 12px; height: 12px; object-fit: contain; }
.ww-workspace-mini-window span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ww-workspace-mini-window.minimized { opacity: .48; }
.ww-workspace-empty { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(237,246,255,.66); font-size: 12px; pointer-events: none; }
.ww-workspace-scene-meta { display: flex; min-height: 28px; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 2px 1px; }
.ww-workspace-scene-icons { display: flex; min-width: 0; align-items: center; gap: 4px; color: rgba(232,243,255,.54); font-size: 10px; }
.ww-workspace-scene-icons img { width: 17px; height: 17px; object-fit: contain; }
.ww-workspace-recent { overflow: hidden; color: rgba(232,243,255,.58); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.ww-workspace-card-footer { justify-content: space-between; gap: 8px; min-height: 31px; padding: 4px 1px 0; color: rgba(232,243,255,.62); font-size: 11px; }
.ww-workspace-current { color: #8ed1ff; font-weight: 650; }
.ww-workspace-card-footer button { border: 0; padding: 5px 9px; border-radius: 7px; color: #eaf7ff; background: rgba(48,147,227,.45); cursor: pointer; }

.ww-workspace-create { display: grid; align-content: center; justify-items: center; min-height: 214px; gap: 7px; border-style: dashed; color: rgba(240,248,255,.93); cursor: pointer; }
.ww-workspace-create:hover { border-color: #73caff; background: rgba(36,137,220,.16); }
.ww-workspace-create > span { color: #8fd3ff; font-size: 40px; font-weight: 300; line-height: 1; }
.ww-workspace-create small { color: rgba(232,243,255,.62); }

.ww-workspace-rename-backdrop { position: fixed; z-index: 1; inset: 0; display: grid; place-items: center; padding: 16px; border-radius: inherit; background: rgba(3,13,27,.54); }
.ww-workspace-rename-dialog { display: grid; width: min(360px, 100%); gap: 12px; padding: 20px; border: 1px solid rgba(180,220,255,.38); border-radius: 14px; color: #f4f8ff; background: linear-gradient(145deg, #16395e, #102942); box-shadow: 0 18px 50px rgba(0,0,0,.4); }
.ww-workspace-rename-dialog label { font-size: 14px; font-weight: 650; }
.ww-workspace-rename-dialog input { width: 100%; box-sizing: border-box; padding: 10px 11px; border: 1px solid rgba(174,215,255,.4); border-radius: 8px; outline: none; color: #fff; background: rgba(3,15,29,.52); font: inherit; }
.ww-workspace-rename-dialog input:focus { border-color: #62bdff; box-shadow: 0 0 0 2px rgba(66,170,245,.2); }
.ww-workspace-rename-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ww-workspace-rename-actions button { padding: 7px 12px; border: 1px solid rgba(220,239,255,.22); border-radius: 7px; color: #eaf7ff; background: rgba(255,255,255,.08); font: inherit; cursor: pointer; }
.ww-workspace-rename-actions button[type="submit"] { border-color: transparent; background: rgba(48,147,227,.65); }
.ww-workspace-rename-actions button:disabled { opacity: .45; cursor: default; }

.ww-workspace-settings { flex-wrap: wrap; gap: 12px 20px; margin-top: 19px; padding: 13px 15px; border: 1px solid rgba(255,255,255,.17); border-radius: 12px; background: rgba(0,0,0,.14); font-size: 12px; }
.ww-workspace-settings strong { margin-right: 2px; color: #d7ebff; }
.ww-workspace-settings label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.ww-workspace-settings input { accent-color: #40aaf5; }
.ww-workspace-shortcut { margin-left: auto; color: rgba(232,243,255,.55); }

.ww-workspace-menu-parent { position: relative; display: flex; align-items: center; justify-content: space-between; }
.ww-workspace-submenu { position: absolute; z-index: 2; top: -5px; left: calc(100% - 2px); display: none; min-width: 180px; padding: 5px; border: 1px solid #cbd7e4; border-radius: 9px; background: rgba(250,253,255,.97); box-shadow: 0 6px 20px rgba(0,0,0,.2); }
.ww-workspace-menu-parent:hover .ww-workspace-submenu,
.ww-workspace-menu-parent:focus-within .ww-workspace-submenu { display: grid; }
.ww-workspace-submenu-item { width: 100%; border: 0; border-radius: 5px; padding: 8px 9px; color: #1d334a; background: transparent; font: inherit; text-align: left; cursor: pointer; }
.ww-workspace-submenu-item:hover { background: rgba(0,120,212,.12); }
.ww-workspace-submenu-separator { height: 1px; margin: 4px 5px; background: rgba(0,0,0,.12); }

@keyframes ww-workspace-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ww-workspace-pop-in { from { opacity: 0; transform: translateY(5px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (max-width: 700px) {
  .ww-workspace-overview { padding: 10px; }
  .ww-workspace-panel { padding: 15px; border-radius: 16px; }
  .ww-workspace-grid { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
  .ww-workspace-shortcut { width: 100%; margin-left: 0; }
}

@media (max-width: 820px), (max-width: 1000px) and (max-height: 500px) {
  .ww-workspace-launcher { display: none; }
  .taskbar > #taskbar-datetime { right: 10px; }
  .taskbar > .taskbar-right { right: 79px; }
}
</style>
