<template>
  <teleport to="body">
    <div
      v-show="visible"
      ref="menuEl"
      class="context-menu"
      :style="{ left: x + 'px', top: y + 'px' }"
      role="menu"
      @contextmenu.prevent
    >
      <template v-for="(it, idx) in normalized" :key="idx">
        <!-- 用 'in' 做类型守卫，TS 能识别 -->
        <hr v-if="'type' in it && it.type === 'separator'" class="context-menu-separator" />
        <div
          v-else
          class="context-menu-item"
          role="menuitem"
          @click="pick(it)"
        >
          <span v-if="'icon' in it && it.icon" class="menu-icon" style="padding-right:10px">
            {{ (it as ActionItem).icon }}
          </span>
          <span>{{ (it as ActionItem).label }}</span>
        </div>
      </template>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch, ref, nextTick } from 'vue'

type SeparatorItem = { type: 'separator' }
type ActionItem = { id: string; label: string; icon?: string; danger?: boolean }
type Item = SeparatorItem | ActionItem

const props = defineProps<{
  x: number
  y: number
  visible: boolean
  items: Item[]
}>()

const emit = defineEmits<{
  (e: 'select', it: ActionItem): void
  (e: 'close'): void
}>()

const menuEl = ref<HTMLElement | null>(null)
const normalized = computed<Item[]>(() => (props.items || []).filter(Boolean) as Item[])

function onClickOutside(e: MouseEvent) {
  if (!menuEl.value) return
  const t = e.target as Node | null
  if (t && menuEl.value.contains(t)) return
  emit('close')
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function pick(it: Item) {
  // 分隔符不触发 select
  if ('type' in it && it.type === 'separator') return
  emit('select', it as ActionItem)
}

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      await nextTick()
      document.addEventListener('mousedown', onClickOutside, true)
      document.addEventListener('keydown', onEsc, true)
    } else {
      document.removeEventListener('mousedown', onClickOutside, true)
      document.removeEventListener('keydown', onEsc, true)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside, true)
  document.removeEventListener('keydown', onEsc, true)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 2147483646;
  width: 220px;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,.2);
  padding: 8px 0;
  font-family: 'Segoe UI','Microsoft YaHei',sans-serif;
}
.context-menu-item { padding: 10px 20px; cursor: pointer; }
.context-menu-item:hover { background: rgba(0,120,212,.1); font-weight: 500; }
.context-menu-separator { height:1px; margin:4px 10px; background: rgba(0,0,0,.1); border:none; }
</style>
