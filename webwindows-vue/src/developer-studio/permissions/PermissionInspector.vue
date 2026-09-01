<script setup>
import { computed } from "vue";

const props = defineProps({
  manifest: { type: Object, default: null },
  permissionRegistry: { type: Object, default: null },
  brokerMethods: { type: Object, default: null },
  runtimeCompatibility: { type: Object, default: null },
  decisions: { type: Array, default: () => [] }
});

const items = computed(() => {
  const declarable = new Set(props.permissionRegistry?.sourceDeclaration?.declarablePermissionIds || []);
  return (props.permissionRegistry?.permissions || [])
    .filter((permission) => permission.sourceDeclarable === true && declarable.has(permission.id))
    .map((permission) => {
      const methods = (props.brokerMethods?.methods || []).filter((method) => method.requiredPermission === permission.id);
      const latest = [...props.decisions].reverse().find((decision) => decision.permission === permission.id);
      const capabilityId = methods[0]?.requiredRuntimeCapability;
      const baseline = (props.runtimeCompatibility?.hostRuntimes || [])
        .filter((runtime) => runtime.capabilities?.[capabilityId])
        .map((runtime) => `${runtime.id}: ${runtime.capabilities[capabilityId].status}`);
      return {
        ...permission,
        methods,
        latest,
        declared: Array.isArray(props.manifest?.permissions) && props.manifest.permissions.includes(permission.id),
        consent: methods[0]?.consent || permission.prompt || "未指定",
        capability: latest?.capabilityState || (baseline.length ? baseline.join(" · ") : "未指定")
      };
    });
});
</script>

<template>
  <div class="permission-inspector">
    <p class="inspector-note">Declaration、review policy、Host grant 与 Runtime capability 是独立事实。</p>
    <article v-for="permission in items" :key="permission.id" class="permission-card">
      <h3>{{ permission.displayName || permission.id }}</h3>
      <code>{{ permission.id }}</code>
      <p>{{ permission.description }}</p>
      <dl>
        <div><dt>风险</dt><dd>{{ permission.risk }}</dd></div>
        <div><dt>同意方式</dt><dd>{{ permission.consent }}</dd></div>
        <div><dt>已声明</dt><dd>{{ permission.declared ? '是' : '否' }}</dd></div>
        <div><dt>策略</dt><dd>{{ permission.latest?.policyDecision || '未评估' }}</dd></div>
        <div><dt>授权</dt><dd>{{ permission.latest?.grantState || '未评估' }}</dd></div>
        <div><dt>运行时能力</dt><dd>{{ permission.capability }}</dd></div>
        <div><dt>生效结果</dt><dd>{{ permission.latest ? permission.latest.finalDecision : '未评估' }}</dd></div>
        <div><dt>策略版本</dt><dd>{{ permission.latest?.policyVersion || '—' }}</dd></div>
      </dl>
      <h4>Broker 方法</h4>
      <code v-for="method in permission.methods" :key="method.id" class="permission-method">{{ method.id }}</code>
    </article>
    <div v-if="!items.length" class="problems-empty">当前权限注册表没有可声明的预览权限。</div>
  </div>
</template>
