<script setup>
// 导入国际化工具
import { useI18n } from "vue-i18n";

// 注入对话框配置
const dialogConfig = inject("dialogConfig");
const paramsData = inject("paramsData");

const { dialogFormVisible, formData, action } = dialogConfig;

let cardTitle = paramsData ? paramsData.cardTitle : "";

const props = defineProps({
  columns: {
    type: Array,
    default: () => [6, 18],
  },
  /* 是否隐藏备注名称 */
  noNotesName: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();
// 定义国际化字符串前缀
const publicString = "navigation.public.";
const btnString = "navigation.btn.";

// 表单布局配置
const labelCol = { span: props.columns[0] };
const wrapperCol = { span: props.columns[1] };
</script>

<template>
  <AModal v-model:open="dialogFormVisible" :wrap-style="{ overflow: 'hidden' }">
    <template #title>
      <div>
        {{ action == "add" ? t("navigation.btn.add") : t("navigation.btn.edit") }}
      </div>
    </template>

    <AForm
      :model="formData"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :label-align="left"
    >
      <AFormItem :label="t(publicString + 'notesName')" v-if="!noNotesName">
        <AInput v-if="cardTitle" v-model:value="formData[cardTitle]" />
        <AInput v-else v-model:value="formData.notes_name" />
      </AFormItem>
      <slot name="listForm"> </slot>
    </AForm>

    <template #footer>
      <a-button @click="dialogFormVisible = false">取消</a-button>
      <slot name="toolBar"></slot>
    </template>
  </AModal>
</template>

<style scoped></style>
