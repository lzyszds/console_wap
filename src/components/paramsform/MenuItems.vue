<script setup>
const props = defineProps({
  menuItems: {
    type: Array,
    required: true,
  },
  row: {
    type: Object,
    default: () => ({}),
  },
});

</script>

<template>
  <a-menu>
    <template v-for="item in menuItems" :key="item.id">
      <a-menu-item @click="item.callback(row)">
        <LzyIcon :name="item.icon" height="16" align="sub" style="margin-right: 2px" />
        <span v-if="typeof item.label == 'function'">{{ item.label() }}</span>
        <span v-else>{{ item.label }}</span>
      </a-menu-item>
    </template>
  </a-menu>
</template>

<style scoped>
.ant-dropdown-menu-title-content {
  display: flex;
  align-items: center;
}
</style>
