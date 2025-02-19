<script setup>
import { getCreditsList, uploadCredits, delCredits } from "@/api/clip/credits";
import { useLocalStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";
const { t, locale } = useI18n();
const matInfoData = useLocalStorage("matInfoData", {});
const { width } = useWindowSize();
const dataList = ref([]);
getDataListFn();

async function getDataListFn() {
  dataList.value = (
    await getCreditsList({
      credits_id: matInfoData.value.id,
      page: 1,
      pageSize: 1000,
    })
  ).data.data.list;
}

const selectListArr = ref([]); // 选中的素材列表

const uploadLoading = ref(false); //上传文件的上传状态

let upload_i = 0; //用来给多文件上传递归的索引

let videoFile = ref([]);

//删除素材
const deleteMat = () => {
  if (selectListArr.value.length === 0) {
    Modal.warning({
      // Use Ant Design Vue's Modal
      title: "提示",
      content: "请选择要删除的素材",
      okText: "确定",
    });
    return;
  }
  /* 是否删除 */
  Modal.confirm({
    // Use Ant Design Vue's Modal
    title: "是否删除素材",
    content: "提示",
    okText: "确定",
    cancelText: "取消",
    onOk: async () => {
      try {
        await Promise.all(
          selectListArr.value.map((item) => {
            return delCredits({
              id: item.id,
            });
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
  selectListArr.value = dataList.value;
};
const dialogVisible = ref(false);

// beforeUpload
const beforeUpload = (file) => {
  if (file.type.indexOf("video") === -1) {
    message.error("请上传视频格式的文件"); // Use Ant Design Vue's message
    return false; // Prevent upload
  }
  videoFile.value.push(file);
  return false; // Prevent Ant Design Vue's default upload
};

// remove
const handleRemove = (file) => {
  const index = videoFile.value.indexOf(file);
  if (index !== -1) {
    videoFile.value.splice(index, 1);
  }
};

//上传
const uploadFile = async () => {
  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i], // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadCredits, //上传方法
    params: {
      credits_id: matInfoData.value.id,
    },
    success: async (data) => {
      if (upload_i < videoFile.value.length - 1) {
        upload_i++;
        uploadFile();
      } else {
        upload_i = 0;
        message.success("上传成功");
        uploadLoading.value = false;
        dialogVisible.value = false;
        getDataListFn();
        videoFile.value = [];
      }
    },
    error: (e) => {
      message.error(e);
      uploadLoading.value = false;
    },
    uploading: (data) => {},
  });
};

function handleClose() {}
</script>
<template>
  <div class="zycard-container">
    <div class="header">
      <p>【{{ matInfoData.uname }}】 {{ t("navigation.btn.listTitle") }}</p>
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
    </div>
    <div class="content">
      <div
        v-for="item in dataList"
        :key="item.id"
        @click="selectVideo(item)"
        :class="{ active: selectListArr.includes(item), listitem: true }"
        v-if="dataList.length > 0"
      >
        <div class="card-video">
          <video class="card-video-player" :src="item.file_path" controls muted></video>
          <p class="resDetBrief">
            {{ t("navigation.dashboard.aiClip.uploadTime") }} ：{{ item.create_time }}
          </p>
        </div>
      </div>
      <div class="listitem no-data" v-else>
        {{ t("navigation.dashboard.aiClip.noData") }}
      </div>
    </div>

    <!-- 上传素材弹层 -->
    <a-modal
      v-model:open="dialogVisible"
      :title="t('navigation.btn.uploadSourceMaterial')"
      :width="width < 768 ? '100%' : '30%'"
      @cancel="handleClose"
      @ok="uploadFile"
      :ok-button-props="{ disabled: videoFile.length === 0 }"
      :maskClosable="false"
    >
      <div
        class="introduce"
        v-html="t('navigation.dashboard.aiClip.children.credits.uploadDesc')"
      ></div>
      <a-upload-dragger
        :multiple="true"
        :file-list="videoFile"
        :before-upload="beforeUpload"
        @remove="handleRemove"
        :headers="headers"
        v-loading="uploadLoading"
        element-loading-text="上传中..."
      >
        <p class="ant-upload-drag-icon">
          <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
        </p>
        <p class="ant-upload-hint" v-html="t('navigation.btn.uploadFileMsg')"></p>
      </a-upload-dragger>

      <template #footer>
        <div>
          <a-button @click="dialogVisible = false">{{
            t("navigation.btn.close")
          }}</a-button>
          <a-button
            type="primary"
            :disabled="videoFile.length === 0"
            @click="uploadFile"
            >{{ t("navigation.btn.save") }}</a-button
          >
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>

/* 没有数据时的样式 */
.no-data {
  text-align: center;
  color: #999;
  height: auto;
  border: none;
}
/* 上传弹窗的提示文字 */
.introduce {
  margin-bottom: 20px;
  line-height: 30px;
  background: #f8f8f8;
  border-radius: 12px;
  color: #666;
}
</style>
