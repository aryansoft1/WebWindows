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
        consent: methods[0]?.consent || permission.prompt || "unspecified",
        capability: latest?.capabilityState || (baseline.length ? baseline.join(" · ") : "unspecified")
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
        <div><dt>Risk</dt><dd>{{ permission.risk }}</dd></div>
        <div><dt>Consent</dt><dd>{{ permission.consent }}</dd></div>
        <div><dt>Declared</dt><dd>{{ permission.declared ? 'yes' : 'no' }}</dd></div>
        <div><dt>Policy</dt><dd>{{ permission.latest?.policyDecision || 'not-evaluated' }}</dd></div>
        <div><dt>Grant</dt><dd>{{ permission.latest?.grantState || 'not-evaluated' }}</dd></div>
        <div><dt>Runtime capability</dt><dd>{{ permission.capability }}</dd></div>
        <div><dt>Effective</dt><dd>{{ permission.latest ? permission.latest.finalDecision : 'not-evaluated' }}</dd></div>
        <div><dt>Policy version</dt><dd>{{ permission.latest?.policyVersion || '—' }}</dd></div>
      </dl>
      <h4>Broker methods</h4>
      <code v-for="method in permission.methods" :key="method.id" class="permission-method">{{ method.id }}</code>
    </article>
    <div v-if="!items.length" class="problems-empty">当前 registry 没有可声明的 Preview permission。</div>
  </div>
</template>
