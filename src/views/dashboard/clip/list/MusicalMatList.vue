<script setup>
import { delAudio, uploadAudio, getAudioList } from "@/api/clip/musicMat";

import { useLocalStorage, useWindowSize } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue"; // Import message and Modal
const { t, locale } = useI18n();
const matInfoData = useLocalStorage("matInfoData", {});

const dataList = ref([]);
getDataListFn();

async function getDataListFn() {
  dataList.value = (
    await getAudioList({
      audio_id: matInfoData.value.id,
      page: 1,
      pageSize: 1000,
    })
  ).data.data.list;
}

const selectListArr = ref([]); // 选中的素材列表

const uploadLoading = ref(false); //上传文件的上传状态

let upload_i = 0; //用来给多文件上传递归的索引

let videoFile = ref([]);

const headers = ref({}); // Assuming you might have headers

const fileList = computed(() => {
  return videoFile.value.map((file) => ({
    uid: file.uid,
    name: file.name,
    status: "done", // or 'uploading', 'error', based on your upload progress
    response: file.response, // Assuming 'response' is available
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
    onOk: () => {
      delAudio({
        id: selectListArr.value.map((item) => item.id).join(","),
      })
        .then(async (res) => {
          if (res.status == 200) {
            message.success("删除成功");
            getDataListFn();
          }
        })
        .catch(() => {
          console.log("取消删除");
        });
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
  if (file.type.indexOf("audio") === -1) {
    message.error("请上传音频");
    return false; // Prevent upload
  }
  videoFile.value = [file]; // Keep only one file
  return false; // Prevent default Ant Design Vue upload
};

//上传
const uploadFile = async () => {
  uploadLoading.value = true;
  // Check if videoFile.value exists and has at least one element
  if (videoFile.value && videoFile.value.length > 0) {
    await uploadByPieces({
      file: videoFile.value[0].raw, // 视频实体, use the first element
      pieceSize: 3, // 分片大小
      upload: uploadAudio, //上传方法
      params: {
        audio_id: matInfoData.value.id,
      },
      success: async (data) => {
        message.success("上传成功");
        uploadLoading.value = false;
        dialogVisible.value = false;
        await getDataListFn();
        videoFile.value = [];
      },
      error: (e) => {
        console.log(`lzy  e:`, e);
        message.error(e.msg || "Upload failed"); // Provide a fallback message
        uploadLoading.value = false;
      },
      uploading: (data) => {
        console.log(`lzy  data:`, data);
      },
    });
  } else {
    message.warning("请选择文件上传");
    uploadLoading.value = false; // Ensure loading is set to false
  }
};

//上传成功 - NOT USED with uploadByPieces, handled in uploadByPieces' success
const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    message.success("上传成功");
    const imagesDocDir = lowDb.get("systemConfig").imagesDocPath;
    fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
    dialogFormVisible.value = false;
    // upload.value.clearFiles(); // Ant Design Vue doesn't have clearFiles
    handleGetImagesList(); // This function is not defined in the provided code
  } else {
    message.error(response.msg);
  }
};
const { width } = useWindowSize();

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
        <a-button type="danger" @click="deleteMat">
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
        <div class="audio">
          <lzy-icon name="gg:music" height="100px" width="100%"></lzy-icon>
          <audio :src="item.media_url" controls></audio>
        </div>
        <p class="resDetBrief">
          {{ t("navigation.dashboard.aiClip.uploadTime") }}：{{ item.create_time }}
        </p>
      </div>
    </div>
  </div>

  <!-- 上传素材弹层 -->
  <a-modal
    v-model:visible="dialogVisible"
    :title="t('navigation.btn.uploadSourceMaterial')"
    :width="width < 500 ? '100%' : '30%'"
    @cancel="handleClose"
    @ok="uploadFile"
    :ok-button-props="{
      loading: uploadLoading,
      disabled: !videoFile || videoFile.length === 0,
    }"
  >
    <a-card
      class="introduce"
      :bordered="false"
      v-html="t('navigation.dashboard.aiClip.children.musicalMat.uploadDesc')"
    >
    </a-card>
    <a-upload
      ref="upload"
      :multiple="true"
      :headers="headers"
      :before-upload="beforeUpload"
      :show-upload-list="false"
      :file-list="fileList"
    >
      <template #trigger>
        <div class="a-upload-drag">
          <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
          <div class="a-upload__text" v-html="t('navigation.btn.uploadFileMsg')"></div>
        </div>
      </template>
    </a-upload>

    <template #footer>
      <div>
        <a-button @click="dialogVisible = false">{{
          t("navigation.btn.close")
        }}</a-button>
        <a-button
          type="primary"
          @click="uploadFile"
          :loading="uploadLoading"
          :disabled="!videoFile || videoFile.length === 0"
          >{{ t("navigation.btn.save") }}</a-button
        >
      </div>
    </template>
  </a-modal>
</template>

<style scoped></style>
