<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  manifest: { type: Object, default: null },
  diagnostics: { type: Array, default: () => [] }
});
const emit = defineEmits(["update:manifest", "open-json"]);
const mode = ref("form");
const editable = computed(() => props.manifest && typeof props.manifest === "object" && !Array.isArray(props.manifest));

function update(path, value) {
  if (!editable.value) return;
  const next = JSON.parse(JSON.stringify(props.manifest));
  let target = next;
  path.slice(0, -1).forEach((key) => {
    if (!target[key] || typeof target[key] !== "object") target[key] = {};
    target = target[key];
  });
  target[path.at(-1)] = value;
  emit("update:manifest", next);
}
</script>

<template>
  <div class="manifest-inspector">
    <div class="inspector-mode-tabs">
      <button type="button" :class="{ active: mode === 'form' }" @click="mode = 'form'">表单</button>
      <button type="button" :class="{ active: mode === 'json' }" @click="mode = 'json'; emit('open-json')">JSON</button>
    </div>
    <div v-if="mode === 'json'" class="inspector-note">
      Manifest JSON 在中央编辑器中编辑；表单和 JSON 使用同一份项目文件。
      <button type="button" @click="emit('open-json')">打开 manifest.json</button>
    </div>
    <div v-else-if="!editable" class="inspector-note error">修复 JSON 错误后才能使用可视化表单。</div>
    <form v-else class="manifest-form" @submit.prevent>
      <label>ID<input :value="manifest.id" @input="update(['id'], $event.target.value)"></label>
      <label>名称<input :value="manifest.name" @input="update(['name'], $event.target.value)"></label>
      <label>版本<input :value="manifest.version" @input="update(['version'], $event.target.value)"></label>
      <label>描述<textarea :value="manifest.description" @input="update(['description'], $event.target.value)"></textarea></label>
      <label>分类<input :value="manifest.category" @input="update(['category'], $event.target.value)"></label>
      <label>入口<input :value="manifest.entry" @input="update(['entry'], $event.target.value)"></label>
      <label>图标<input :value="manifest.icon" @input="update(['icon'], $event.target.value)"></label>
      <fieldset>
        <legend>Window</legend>
        <label>宽度<input :value="manifest.window?.width" @input="update(['window', 'width'], $event.target.value)"></label>
        <label>高度<input :value="manifest.window?.height" @input="update(['window', 'height'], $event.target.value)"></label>
        <label class="check"><input type="checkbox" :checked="manifest.window?.singleton" @change="update(['window', 'singleton'], $event.target.checked)"> 单实例</label>
      </fieldset>
      <fieldset>
        <legend>Placement</legend>
        <label class="check"><input type="checkbox" :checked="manifest.placement?.startMenu" @change="update(['placement', 'startMenu'], $event.target.checked)"> 开始菜单</label>
        <label class="check"><input type="checkbox" :checked="manifest.placement?.allFunctions" @change="update(['placement', 'allFunctions'], $event.target.checked)"> 全部功能</label>
        <label class="check"><input type="checkbox" :checked="manifest.placement?.desktop" @change="update(['placement', 'desktop'], $event.target.checked)"> 桌面</label>
        <label class="check"><input type="checkbox" :checked="manifest.placement?.taskbar" @change="update(['placement', 'taskbar'], $event.target.checked)"> 任务栏</label>
      </fieldset>
      <p class="inspector-note">catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。</p>
    </form>
    <div class="inspector-summary">{{ diagnostics.length }} 个 Manifest 问题</div>
  </div>
</template>
