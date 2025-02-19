<template>
  <p style="height: 58vh" v-html="t('navigation.notice.main')"></p>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
</script>

<style scoped></style>
