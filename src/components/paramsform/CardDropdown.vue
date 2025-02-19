<script setup>
const props = defineProps({
  menuData: {
    type: Array,
    default: () => [],
  },
  row: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <a-dropdown :trigger="['contextmenu']">
    <slot></slot>
    <template #overlay>
      <MenuItems :menuItems="menuData" :row="row" />
    </template>
  </a-dropdown>
</template>
