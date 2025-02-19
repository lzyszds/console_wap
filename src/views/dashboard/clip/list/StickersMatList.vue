<script setup>
import { nextTick, ref, computed } from "vue";
import { useLocalStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { uploadStickers, getStickersList, delStickers } from "@/api/clip/stickerMat";

import { speeding } from "@/utils";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue"; // Import message and Modal

const { t, locale } = useI18n();
//存储当前组件的数据 相当于路由参数
const matInfoData = useLocalStorage("matInfoData", {});

const dataList = ref([]);
getDataListFn();

const selectListArr = ref([]); // 选中的素材列表

const uploadLoading = ref(false); //上传文件的上传状态

let upload_i = 0; //用来给多文件上传递归的索引

let videoFile = ref([]);
const headers = ref({});
const { width } = useWindowSize();

async function getDataListFn() {
  dataList.value = (
    await getStickersList({
      stickers_id: matInfoData.value.id,
      page: 1,
      pageSize: 1000,
    })
  ).data.data.list;
}

const fileList = computed(() => {
  return videoFile.value.map((file) => ({
    uid: file.uid,
    name: file.name,
    status: "done", // or 'uploading', 'error'
    response: file.response, // Assuming you have response
    url: file.url,
  }));
});

//删除素材
const deleteMat = () => {
  if (selectListArr.value.length === 0) {
    Modal.warning({
      title: "提示",
      content: "请选择要删除的素材",
      okText: "确定",
    });
    return;
  }
  /* 是否删除 */
  Modal.confirm({
    title: "是否删除素材",
    content: "提示",
    okText: "确定",
    cancelText: "取消",
    onOk: async () => {
      await Promise.all(
        selectListArr.value.map((item) => {
          return delStickers({
            id: item.id,
          });
        })
      );
      await speeding(1000);
      message.success("删除成功");
      getDataListFn();
      selectListArr.value = [];
    },
  });
};
//选中素材
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
const allSelect = () => {
  selectListArr.value = dataList.value.map((item) => item);
};
const dialogVisible = ref(false);
//上传的dom
const upload = ref();

const beforeUpload = (file) => {
  if (file.type.indexOf("image") === -1) {
    message.error("只能上传图片");
    return false;
  }
  videoFile.value.push(file);
  return false;
};
const handleRemove = (file) => {
  const index = videoFile.value.indexOf(file);
  if (index !== -1) {
    videoFile.value.splice(index, 1);
  }
};
//上传预剪
const uploadFile = async () => {
  if (!videoFile.value) return;
  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i], // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadStickers, //上传方法
    params: {
      stickers_id: matInfoData.value.id,
    },
    success: async (data) => {
      // onSuccess(data, videoFile[upload_i]);
      if (upload_i < videoFile.value.length - 1) {
        upload_i++;
        uploadFile();
      } else {
        upload_i = 0;
        message.success("上传成功");
        uploadLoading.value = false;
        dialogVisible.value = false;
        //清空
        videoFile.value = [];
        // upload.value.clearFiles(); // Ant Design Vue doesn't have clearFiles()
        getDataListFn();
      }
    },
    error: (e) => {
      console.log(`lzy  e:`, e);
      message.error(e.msg || "Upload failed"); //Provide fallback message
      uploadLoading.value = false;
    },
    uploading: (data) => {
      console.log(`lzy  data:`, data);
    },
  });
};
//上传成功 - NOT USED, handled in uploadByPieces' success
const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    message.success("上传成功");
    const imagesDocDir = lowDb.get("systemConfig").imagesDocPath;
    fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
    dialogFormVisible.value = false;
    // upload.value.clearFiles();  // Ant Design Vue doesn't have clearFiles
    handleGetImagesList(); // This function is not defined in the code
  } else {
    message.error(response.msg);
  }
};

function handleClose() {
  dialogVisible.value = false;
}
</script>
<template>
  <div class="zycard-container">
    <div class="header">
      <p>【{{ matInfoData.uname }}】{{ t("navigation.btn.listTitle") }}</p>
      <div class="tools">
        <a-button type="danger" v-show="selectListArr.length != 0">
          {{
            t("navigation.btn.selectListArr1") +
            selectListArr.length +
            t("navigation.btn.selectListArr2")
          }}
        </a-button>
        <a-button type="primary" @click="dialogVisible = true">
          {{ t("navigation.btn.sourceMaterialAdd") }}
        </a-button>
        <a-button type="primary" @click="allSelect">
          {{ t("navigation.btn.allSelect") }}
        </a-button>
        <a-button type="primary" @click="clearSelect">
          {{ t("navigation.btn.cancelSelect") }}
        </a-button>
        <a-button type="primary" danger @click="deleteMat">
          {{ t("navigation.btn.sourceMaterialDelect") }}
        </a-button>
      </div>
      <!-- 删除按钮 -->
    </div>
    <div class="content">
      <div
        v-for="item in dataList"
        :key="item.id"
        @click="selectVideo(item)"
        :class="{ active: selectListArr.includes(item), listitem: true }"
      >
        <div class="card-video">
          <img class="card-video-player" :src="item.media_url" />
          <p class="resDetBrief">
            {{ t("navigation.dashboard.aiClip.uploadTime") }}：{{ item.create_time }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- 上传素材弹层 -->
  <a-modal
    v-model:open="dialogVisible"
    :title="t('navigation.btn.uploadSourceMaterial')"
    :width="width < 500 ? '100%' : '30%'"
    @cancel="handleClose"
    @ok="uploadFile"
    :ok-button-props="{ loading: uploadLoading, disabled: videoFile.length === 0 }"
  >
    <a-card
      class="introduce"
      :bordered="false"
      v-html="t('navigation.dashboard.aiClip.children.stickerMat.uploadDesc')"
    >
    </a-card>
    <a-upload-dragger
      :multiple="true"
      :file-list="videoFile"
      @remove="handleRemove"
      :before-upload="beforeUpload"
      :headers="headers"
      accept="image/*"
    >
      <p class="ant-upload-drag-icon">
        <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
      </p>
      <p class="ant-upload-hint" v-html="t('navigation.btn.uploadFileMsg')"></p>
    </a-upload-dragger>

    <template #footer>
      <div>
        <a-button @click="dialogVisible = false">
          {{ t("navigation.btn.close") }}
        </a-button>
        <a-button
          type="primary"
          @click="uploadFile"
          :loading="uploadLoading"
          :disabled="videoFile.length === 0"
        >
          {{ t("navigation.btn.save") }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>
<style scoped></style>
