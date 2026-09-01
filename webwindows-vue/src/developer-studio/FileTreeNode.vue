<script setup>
import { ref } from "vue";

defineOptions({ name: "FileTreeNode" });
defineProps({
  node: { type: Object, required: true },
  selectedPath: { type: String, default: "" }
});
const emit = defineEmits(["select"]);
const expanded = ref(true);

function iconForNode(node) {
  if (node.kind === "directory") return "▰";
  const extension = node.name.split(".").pop()?.toLowerCase();
  return ({ html: "<>", css: "#", js: "JS", json: "{}", svg: "◇" })[extension] || "·";
}

function iconClassForNode(node) {
  if (node.kind === "directory") return "directory";
  return `file-${node.name.split(".").pop()?.toLowerCase() || "text"}`;
}
</script>

<template>
  <div class="tree-node">
    <div
      class="tree-row"
      :class="{ selected: selectedPath === node.path }"
      :title="node.path"
      @click="emit('select', node)"
      @dblclick="node.kind === 'directory' && (expanded = !expanded)"
    >
      <span class="tree-toggle" @click.stop="node.kind === 'directory' && (expanded = !expanded)">
        {{ node.kind === "directory" ? (expanded ? "⌄" : "›") : "" }}
      </span>
      <span class="tree-icon" :class="iconClassForNode(node)">{{ iconForNode(node) }}</span>
      <span>{{ node.name }}</span>
    </div>
    <div v-if="node.kind === 'directory' && expanded" class="tree-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :selected-path="selectedPath"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
