<template>
  <div class="zycard-container">
    <div class="header">
      <a-button type="primary" @click="dialogFormVisible = true">
        {{ t(btnString + "addImage") }}
      </a-button>
      <div class="tools">
        <a-button type="danger" v-show="selectListArr.length != 0">
          {{ t(btnString + "selectListArr1") }}
          {{ selectListArr.length }}
          {{ t(btnString + "selectListArr2") }}
        </a-button>
        <a-button type="primary" @click="allSelect">
          {{ t(btnString + "allSelect") }}
        </a-button>
        <a-button type="primary" @click="clearSelect">
          {{ t(btnString + "cancelSelect") }}
        </a-button>
        <a-button type="primary" @click="handleDownload">
          {{ t(btnString + "download") }}
        </a-button>
        <a-button type="primary" danger @click="deleteMat">
          {{ t(btnString + "delImage") }}
        </a-button>
      </div>
      <!-- 删除按钮 -->
    </div>
    <div class="content">
      <div
        v-for="item in dataList"
        :key="item.id"
        @click="selectVideo(item)"
        :class="{
          active: selectListArr.includes(item),
          listitem: true,
        }"
      >
        <img class="card-video-player" :src="item.url" />
        <p style="margin: 0; margin-top: 10px">
          {{ t(btnString + "uploadTime") }}
          {{ item.atime }}
        </p>
      </div>
    </div>
  </div>
  <!-- 新增弹层 -->
  <a-modal
    v-model:open="dialogFormVisible"
    :width="width < 768 ? '100%' : '30%'"
    @cancel="handleClose"
    @ok="onSubmit"
    :ok-button-props="{ disabled: videoFile.length === 0 }"
    :title="t(btnString + 'addImage')"
    accept="image/*"
  >
    <a-upload-dragger
      :multiple="true"
      :file-list="videoFile"
      @remove="handleRemove"
      :before-upload="beforeUpload"
      :headers="headers"
    >
      <p class="ant-upload-drag-icon">
        <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
      </p>
      <p class="ant-upload-hint" v-html="t('navigation.btn.uploadFileMsg')"></p>
    </a-upload-dragger>


    <template #footer>
      <div>
        <a-button @click="dialogFormVisible = false">{{
          t(btnString + "close")
        }}</a-button>
        <a-button type="primary" @click="onSubmit">{{ t(btnString + "save") }}</a-button>
      </div>
    </template>
  </a-modal>

  <!-- 推送弹窗 -->
  <a-modal
    v-model:open="sendData.dialog"
    title="t(btnString + 'pushResources')"
    :width="500"
    @ok="sendSave"
  >
    <div class="select-container">
      <span>{{ t(btnString + "pushMessage") }}</span>
      <a-select v-model:value="selectDeviceValue" mode="multiple">
        <a-select-option
          v-for="item in devicesList"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
    </div>
    <template #footer>
      <div>
        <a-button @click="sendData.dialog = false">{{ t(btnString + "close") }}</a-button>
        <a-button type="primary" @click="sendSave">{{ t(btnString + "save") }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from "vue";
import { uploadByPieces } from "@/utils/upload";

import {
  getImagesList,
  deleteImages,
  addImages,
  downloadImages,
} from "@/api/resource/images";
import { useStorage, useWindowSize } from "@vueuse/core";

import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue"; // Import message and Modal
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.resourceManagement.children.images.";

const token = useStorage("token", "");
let headers = ref({
  "Authori-zation": token.value,
});
const { width } = useWindowSize();

const dataList = ref([]);

const selectListArr = ref([]); // 选中的混剪列表

const upload = ref(null); // 上传组件

let listQuery = reactive({
  page: 1,
  pageSize: 99999,
});

const sendData = reactive({
  dialog: false,
  upIndex: 0,
});

//获取图片数据
async function getDataListFn() {
  let response = await getImagesList(listQuery);
  if (response.data.status == 200) {
    dataList.value = response.data.data.list.map((res) => {
      return res;
    });
  } else {
    message.error(response.data.msg); // Use Ant Design Vue's message
  }
}
getDataListFn();

//删除图片
const deleteMat = () => {
  if (selectListArr.value.length === 0) {
    Modal.warning({
      // Use Ant Design Vue's Modal
      title: "提示",
      content: "请选择要删除的图片",
      okText: "确定",
    });
    return;
  }
  /* 是否删除 */
  Modal.confirm({
    // Use Ant Design Vue's Modal
    title: "是否删除图片",
    content: "提示",
    okText: "确定",
    cancelText: "取消",
    onOk: async () => {
      try {
        await Promise.all(
          selectListArr.value.map((item) => {
            return deleteImages({ id: item.id });
          })
        );
        message.success("删除成功"); // Use Ant Design Vue's message
        getDataListFn();
        selectListArr.value = [];
      } catch (e) {
        message.error("删除失败"); // Use Ant Design Vue's message
      }
    },
  });
};
//选中图片
const selectVideo = (item) => {
  if (selectListArr.value.includes(item)) {
    selectListArr.value = selectListArr.value.filter((i) => i !== item);
  } else {
    selectListArr.value.push(item);
  }
};
//全部取消
const clearSelect = () => {
  selectListArr.value = [];
};
//全部选择
const allSelect = async () => {
  selectListArr.value = dataList.value.map((item) => item);
};
const dialogFormVisible = ref(false);

const videoFile = ref([]); // Use ref for videoFile
let upload_i = 0;
async function onSubmit() {
  
  await uploadByPieces({
    file: videoFile.value[upload_i], // Access .value for refs
    pieceSize: 3, // 分片大小
    success: async (data) => {
      //成功一个就将成功的图片存在资源文件夹中
      if (upload_i < videoFile.value.length - 1) {
        upload_i++;
        await onSubmit();
      } else {
        upload_i = 0;
        message.success("上传成功"); // Use Ant Design Vue's message
        getDataListFn();
        dialogFormVisible.value = false;

        //清空上传的资源
        videoFile.value = []; // Clear the array correctly
        // upload.value.clearFiles(); // Ant Design Vue doesn't have clearFiles, handle removal in beforeUpload
      }
    },
    error: (e) => {
      console.log(`lzy  e:`, e);
      message.error(e.msg); // Use Ant Design Vue's message
    },
    upload: addImages, //上传方法
    uploading: (chunk, allChunk) => {
      // this.videoIng = true;
      let st = Math.floor((chunk / allChunk) * 100);
      // this.progress = st;//进度条
    },
  });
}

const beforeUpload = (file) => {
  if (file.type.indexOf("image") === -1) {
    message.error("请上传图片格式的文件"); // Use Ant Design Vue's message
    return false; // Prevent upload
  }
  videoFile.value.push(file);
  return false; // Prevent Ant Design Vue's default upload
};
const handleRemove = (file) => {
  const index = videoFile.value.indexOf(file);
  if (index !== -1) {
    videoFile.value.splice(index, 1);
  }
};

const handleDownload = async () => {
  if (selectListArr.value.length === 0) {
    Modal.warning({
      // Use Ant Design Vue's Modal
      title: "提示",
      content: "请选择要下载的图片",
      okText: "确定",
    });
    return;
  }
  for (const item of selectListArr.value) {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const selectDeviceValue = ref([]);
const devicesList = ref([]);

function sendSave() {}
function handleClose() {}
</script>

<style scoped>
</style>
