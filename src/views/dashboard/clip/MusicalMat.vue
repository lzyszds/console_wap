<script setup>
import {
  addAudioType,
  editAudioType,
  getAudioList,
  uploadAudio,
  getAudioTypeList,
} from "@/api/clip/musicMat";
import { message, Modal } from "ant-design-vue";
import { useLocalStorage, useSessionStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.aiClip.children.musicalMat.tableHeader.";

const router = useRouter();

const componentIndex = useSessionStorage("componentIndex", "1-1");
const matInfoData = useLocalStorage("matInfoData", {});
//上传文件的上传状态
const uploadLoading = ref(false);
const { width } = useWindowSize();

const dialogform = reactive({
  visible: false, //弹窗是否显示
  action: "add", //弹窗操作类型
  isHead: false, //是否是片头
  updateVisible: false, //上传素材弹窗是否显示
});

const token = useLocalStorage("token", "");
let headers = ref({
  "Authori-zation": token.value,
});
const formData = reactive({
  id: "",
  uname: "",
});

let appList = ref([]);
let appListSelect = ref([]);

let renwuList = ref([]);
let groupList = ref([]);
let total = ref(0);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  id_no: "",
  status: "",
  title: "",
  total: 0,
});

let tableKey = ref(0);
let listLoading = ref(false);

// 表头
const columns = computed(() => {
  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
    },
    {
      title: t(textString + "uname"),
      dataIndex: "uname",
      key: "uname",
      align: "center",
    },
    {
      title: t(textString + "num"),
      dataIndex: "num",
      key: "num",
      align: "center",
    },
    {
      title: t(textString + "create_time"),
      dataIndex: "create_time",
      key: "create_time",
      align: "center",
      width: 150,
    },
    {
      title: t(textString + "operate"),
      dataIndex: "operate",
      key: "operate",
      align: "center",
      width: 300,
    },
  ];
});

//获取任务列表
async function handleGetAudioList() {
  listLoading.value = true;
  let response = await getAudioTypeList(listQuery);
  if (response.data.status == 200) {
    renwuList.value = response.data.data.list;
    listQuery.total = Number(response.data.data.total);
    listLoading.value = false;
  } else {
    message.error(response.data.msg);
  }
}
handleGetAudioList();

function changePagination(e) {
  listQuery.page = e;
  handleGetAudioList();
}

//获取分组
async function handleGetGroupList() {
  let response = await getAudioTypeList();
  groupList.value = [];
  groupList.value = [];
  if (response.data.status == 200) {
    groupList = response.data.data;
    for (let i = 0; i < groupList.length; i++) {
      let obj = {};
      obj.label = groupList[i].name;
      obj.value = groupList[i].id;
      groupList.value.push(obj);
    }
  } else {
    message.error(response.data.msg);
  }
}

const handleCreate = async (act, row, index) => {
  dialogform.visible = true;
  dialogform.isHead = index == "head" ? true : false;
  dialogform.action = act;

  await handleGetGroupList();

  if (act == "edit") {
    formData.id = row.id;
    formData.uname = row.uname;
  } else {
    clearFormData();
  }
};

const onSubmit = async () => {
  let response;
  let params = {
    uname: formData.uname,
  };
  if (dialogform.action == "add") {
    response = await addAudioType(params);
  }

  if (dialogform.action == "edit") {
    response = await editAudioType(Object.assign(params, { id: formData.id }));
  }
  handleGetAudioList();

  dialogform.visible = false;
  message.success(response.data.msg);
};

// const upload = ref();
let videoFile = ref([]);
let upload_i = 0;

// 上传之前的钩子
const beforeUpload = (file) => {
  if (file.type.indexOf("audio") === -1) {
    message.error("请上传音频格式的文件"); // Use Ant Design Vue's message
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

const toMatList = async (data, act) => {
  if (act == "uploda") {
    dialogform.updateVisible = true;
    formData.id = data.id;
    videoFile.value = [];
  } else {
    matInfoData.value = data;
    router.push("/aiClip/musicalMat/musicalMatList");
  }
};

//上传音乐
const uploadFile = async () => {
  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i], // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadAudio, //上传方法
    params: {
      audio_id: formData.id,
    },
    success: async (data) => {
      if (upload_i < videoFile.value.length - 1) {
        upload_i++;
        uploadFile();
      } else {
        upload_i = 0;
        message.success("上传成功");
        uploadLoading.value = false;
        dialogform.updateVisible = false;
        await handleGetAudioList();
        videoFile.value = []; //
      }
    },
    error: (e) => {
      message.error(e.msg);
      uploadLoading.value = false;
    },

    uploading: (chunk, allChunk) => {
      // this.videoIng = true;
      let st = Math.floor((chunk / allChunk) * 100);
      // this.progress = st;//进度条
    },
  });
};

const clearFormData = () => {
  formData.id = "";
  formData.grouping_id = "";
  formData.content = "";
  formData.appId = "";
};

function handleClose() {}

onMounted(() => {});
</script>
<template>
  <div class="zycard-container">
    <div class="filter-container">
      <a-button type="primary" @click="handleCreate('add', '')">
        {{ t("navigation.btn.musicAddType") }}
      </a-button>
    </div>

    <!-- 内容列表 -->
    <a-table
      :key="tableKey"
      :loading="listLoading"
      :data-source="renwuList"
      :columns="columns"
      :pagination="false"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 操作 -->
        <template v-if="column.dataIndex === 'operate'">
          <a-space>
            <a-button type="primary" size="small" @click="toMatList(record, 'uploda')">
              {{ t("navigation.btn.uploadSourceMaterial") }}
            </a-button>
            <a-button type="primary" size="small" @click="toMatList(record, 'get')">
              {{ t("navigation.btn.sourceMaterial") }}
            </a-button>
            <a-button type="primary" size="small" @click="handleCreate('edit', record)">
              {{ t("navigation.btn.edit") }}
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 分页 -->
    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        :total="listQuery.total"
        :current="listQuery.page"
        :page-size="listQuery.pageSize"
        show-quick-jumper
        show-size-changer
        @change="changePagination"
        @showSizeChange="changePagination"
        size="small"
      />
    </div>

    <!-- 添加和编辑分类弹层 -->
    <a-modal
      v-model:open="dialogform.visible"
      :title="dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
      :width="width < 800 ? '100%' : '70%'"
      @cancel="handleClose"
      @ok="onSubmit"
      :maskClosable="false"
    >
      <a-form layout="vertical" :model="formData">
        <a-form-item :label="t(textString + 'uname')" name="uname">
          <a-input
            v-model:value="formData.uname"
            type="text"
            placeholder=""
            @keyup.enter="onSubmit"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <div>
          <a-button @click="dialogform.visible = false">
            {{ t(btnString + "close") }}
          </a-button>
          <a-button type="primary" @click="onSubmit">
            {{ t(btnString + "save") }}
          </a-button>
        </div>
      </template>
    </a-modal>

    <!-- 上传素材弹层 -->
    <a-modal
      v-model:open="dialogform.updateVisible"
      :title="dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
      :width="width < 768 ? '100%' : '30%'"
      @cancel="handleClose"
      @ok="uploadFile"
      :ok-button-props="{ disabled: videoFile.length === 0 }"
      :maskClosable="false"
    >
      <div
        class="introduce"
        v-html="t('navigation.dashboard.aiClip.children.musicalMat.uploadDesc')"
      ></div>
      <a-upload-dragger
        :multiple="true"
        :file-list="videoFile"
        :before-upload="beforeUpload"
        @remove="handleRemove"
        :headers="headers"
        v-loading="uploadLoading"
        element-loading-text="上传中..."
        accept="audio/*"
      >
        <p class="ant-upload-drag-icon">
          <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
        </p>
        <p class="ant-upload-hint" v-html="t('navigation.btn.uploadFileMsg')"></p>
      </a-upload-dragger>

      <template #footer>
        <div>
          <a-button @click="dialogform.updateVisible = false">
            {{ t("navigation.btn.close") }}
          </a-button>
          <a-button type="primary" :disabled="videoFile.length === 0" @click="uploadFile">
            {{ t("navigation.btn.save") }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>

</style>
