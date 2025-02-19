<script setup>
import { getTxtFile } from "@/utils";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";

const { formData } = inject("dialogConfig");
const props = defineProps({
  //绑定的数据
  prop: {
    type: String,
    default: "bloggerId",
  },
  //最大数量
  maxSize: {
    type: Number,
    default: 200,
  },
  //提示
  placeholder: {
    type: String,
    default: "多个值请使用英文逗号分隔 ,,,",
  },
});

const getTxtFileFn = async (file) => {
  getTxtFile(file).then((res) => {
    if (res) {
      formData[props.prop] = res;
    }
  });

  return false;
};

watch(
  () => formData[props.prop],
  (newVal, oldVal) => {
    //博主最多200个
    const arr = newVal.split(",");
    if (arr.length > props.maxSize) {
      message.error(props.label + t(publicString + "message.limitation"));
      formData[props.prop] = arr.slice(0, props.maxSize).join(",");
    }
  }
);
</script>

<template>
  <div class="idsItem">
    <a-textarea :placeholder="props.placeholder" v-model:value="formData[props.prop]" />
    <a-upload accept=".txt" :before-upload="getTxtFileFn" :max-count="1">
      <a-button type="primary">{{ t(btnString + "upload") }}</a-button>
      <!-- 将上传列表清空 -->
      <template #itemRender="{ file, actions }"> </template>
    </a-upload>
  </div>
</template>

<style scoped>
.idsItem {
  display: flex;
  gap: 10px;

  .ant-upload-wrapper {
    display: flex;
    align-items: center;
  }
}
</style>
