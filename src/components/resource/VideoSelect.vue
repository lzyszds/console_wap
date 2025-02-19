<script setup>
import { getVideoList } from "@/api/resource/video";
const videosList = ref([]);
const { prop } = defineProps({
  prop: {
    type: String,
    required: true,
  },
});

const { formData } = inject("dialogConfig");

getVideoList().then((result) => {
  videosList.value = result.data.data.list.map((item) => {
    return {
      id: item.id,
      filename: item.url,
      url: item.url,
    };
  });
});

// 获取资源索引
function getResourceIndex(arr, val) {
  if (!arr) return "";
  if (typeof arr == "string") arr = arr.split(",");
  const index = arr.findIndex((item) => item == val);
  if (index == -1) return "";
  return index + 1;
}
</script>

<template>
  <a-select
    v-model:value="formData[prop]"
    :dropdown-match-select-width="false"
    :placement="placement"
    class="video-select"
    optionLabelProp="value"
    popupClassName="video-select-popup"
  >
    <a-select-option
      v-for="item in videosList"
      :key="item.id"
      :value="item.filename"
      :data-index="getResourceIndex(formData[prop], item.filename)"
    >
      <video :src="item.url" alt="" />
    </a-select-option>
  </a-select>
</template>

<style scoped>
.video-select {
  width: 100%;
  :deep(.ant-select-selector) {
    width: 100%;
  }
}
</style>

<style>
.video-select-popup {
  .rc-virtual-list-holder {
    .rc-virtual-list-holder-inner {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 5px;
      justify-content: center;
      padding: 10px;
      overflow: hidden;
      overflow-y: scroll;
      max-height: 180px;

      .ant-select-item-option-content {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
      }
      .ant-select-item {
        padding: 0px;
        border-radius: 15px;
        overflow: hidden;
        border: 2px solid transparent;
      }

      .ant-select-item-option-selected {
        position: relative;
        border: 2px solid var(--theme-color);
        
        &::before {
          content: attr(data-index);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          z-index: 99;
          font-size: 13px;
          line-height: 15px;
          border-radius: 50%;
          background: var(--theme-color);
          width: auto;
          min-width: 15px;
          text-align: center;
        }
      }

      video {
        width: 100px;
        height: 100px;
        border-radius: 10px;
      }
    }
  }
}
</style>
