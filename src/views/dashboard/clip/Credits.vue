<script setup>
import {
  addCreditsType,
  getCreditsTypeList,
  editCreditsType,
  uploadCredits,
} from "@/api/clip/credits";
import { useSessionStorage, useLocalStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import CreditsList from "./list/CreditsList.vue";


const router = useRouter();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const tableHeader = "navigation.dashboard.aiClip.children.credits.tableHeader.";
const dialogTitle = "navigation.dashboard.aiClip.children.credits.dialog.title";
const { t } = useI18n();
const { width } = useWindowSize();

const matInfoData = useLocalStorage("matInfoData", {});

const dialogform = reactive({
  visible: false, //弹窗是否显示
  action: "add", //弹窗操作类型
  isHead: false, //是否是片头
  updateVisible: false, //上传素材弹窗是否显示
  materialListVisible: false, //素材列表弹窗是否显示
});
const token = useLocalStorage("token", "");
let headers = ref({
  "Authori-zation": token.value,
});

const formData = reactive({
  id: "",
  content: "",
  type: 1,
});

let renwuList = ref([]);
let groupList = ref([]);
const uploadLoading = ref(false); //上传文件的上传状态

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  id_no: "",
  status: "",
  title: "",
  total: 0,
});

let listLoading = ref(false);
let videoFile = ref([]); // Use ref for videoFile

const columns = computed(() => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    sorter: true,
    align: "center",
    width: 80,
  },
  {
    title: t(tableHeader + "uname"),
    dataIndex: "uname",
    key: "uname",
    align: "center",
  },
  {
    title: t(tableHeader + "type"),
    dataIndex: "type",
    key: "type",
    align: "center",
  },
  {
    title: t(tableHeader + "num"),
    dataIndex: "num",
    key: "num",
    align: "center",
  },
  {
    title: t(tableHeader + "create_time"),
    dataIndex: "create_time",
    key: "create_time",
    align: "center",
    width: 120,
  },
  {
    title: t(tableHeader + "operate"),
    key: "operate",
    align: "center",
    width: 320,
  },
]);

//获取任务列表
async function handlegetCreditsTypeList() {
  listLoading.value = true;
  let response = await getCreditsTypeList(listQuery);
  if (response.data.status == 200) {
    //this.categoryList = response.data.data
    renwuList.value = response.data.data.list;
    formData.total = Number(response.data.data.total);
    listLoading.value = false;
  } else {
    message.error(response.data.msg);
  }
}
handlegetCreditsTypeList();

function changePagination(page, pageSize) {
  listQuery.page = page;
  listQuery.pageSize = pageSize;
  handlegetCreditsTypeList();
}

const handleCreate = async (act, row) => {
  dialogform.visible = true;
  dialogform.action = act;
  clearFormData();

  if (act == "edit") {
    formData.id = row.id;
    formData.content = row.uname;
    formData.type = row.type;
  }
};

const onSubmit = async () => {
  let response;
  let params = {
    uname: formData.content,
    type: formData.type,
  };
  if (dialogform.action == "add") {
    response = await addCreditsType(params);
  }
  if (dialogform.action == "edit") {
    response = await editCreditsType(Object.assign(params, { id: formData.id }));
  }
  await handlegetCreditsTypeList();

  dialogform.visible = false;
  message.success(response.data.msg);
};

const upload = ref();

const beforeUpload = (file) => {
  if (file.type !== "video/mp4") {
    message.error(t(btnString + "uploadChild.message"));
    return false; // Prevent upload
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

const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    message.success(t(btnString + "uploadChild.success"));
    const imagesDocDir = lowDb.get("systemConfig").imagesDocPath;
    fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
    dialogFormVisible.value = false;
    // upload.value.clearFiles(); // Ant Design Vue doesn't have clearFiles
    handlegetCreditsTypeList();
  } else {
    message.error(response.msg);
  }
};
let upload_i = 0;
//上传
const uploadFile = async () => {
  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i], // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadCredits, //上传方法
    params: {
      credits_id: formData.id,
    },
    success: async (data) => {
      // onSuccess(data, videoFile[upload_i]);
      if (upload_i < videoFile.value.length - 1) {
        upload_i++;
        uploadFile();
      } else {
        upload_i = 0;
        uploadLoading.value = false;
        dialogform.updateVisible = false;
        message.success(t(btnString + "uploadChild.success"));
        await handlegetCreditsTypeList();
        videoFile.value = [];
      }
    },
    error: (e) => {
      message.error(e.msg);
      uploadLoading.value = false;
    },
    uploading: (data) => {},
  });
};

const toMatList = async (data, act) => {
  if (act == "uploda") {
    dialogform.updateVisible = true;
    formData.id = data.id;
    videoFile.value = [];
  } else {
    matInfoData.value = data;
    router.push('/aiClip/credits/creditsList');
  }
};

const clearFormData = () => {
  formData.id = "";
  formData.grouping_id = "";
  formData.content = "";
  formData.appId = "";
};

function handleClose() {
  dialogform.visible = false;
  dialogform.updateVisible = false;
}

onMounted(() => {});
</script>
<template>
  <div class="zycard-container">
    <div class="filter-container">
      <a-button type="primary" @click="handleCreate('add')">
        {{ t("navigation.btn.creditsAdd") }}
      </a-button>
    </div>
    <!-- 内容列表 -->
    <a-table
      :loading="listLoading"
      :data-source="renwuList"
      :columns="columns"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'id'">
          <span>{{ record.id }}</span>
        </template>
        <template v-if="column.dataIndex === 'uname'">
          <span>{{ record.uname }}</span>
        </template>
        <template v-if="column.dataIndex === 'type'">
          <span>
            {{ record.type == 1 ? t(tableHeader + "titles") : t(tableHeader + "end") }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'num'">
          <span>{{ record.num }}</span>
        </template>
        <template v-if="column.dataIndex === 'create_time'">
          <span>{{ record.create_time }}</span>
        </template>
        <template v-if="column.key === 'operate'">
          <a-button type="primary" size='small'  @click="toMatList(record, 'uploda')">
            {{ t("navigation.btn.uploadSourceMaterial") }}
          </a-button>
          <a-button type="primary" size='small'  @click="toMatList(record, 'get')">
            {{ t("navigation.btn.sourceMaterial") }}
          </a-button>
          <a-button type="primary" size='small'  @click="handleCreate('edit', record)">
            {{ t("navigation.btn.edit") }}
          </a-button>
        </template>
      </template>
    </a-table>

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
  </div>

  <!-- 弹层 -->
  <a-modal
    v-model:open="dialogform.visible"
    :title="dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
    :width="width < 500 ? '100%' : '40%'"
    @cancel="handleClose"
    :ok-button-props="{ disabled: !formData.content }"
    @ok="onSubmit"
  >
    <a-form
      :model="formData"
      label-align="left"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-item :label="t(tableHeader + 'type')" name="type">
        <a-radio-group v-model:value="formData.type" button-style="solid">
          <a-radio-button :value="1">{{ t(tableHeader + "titles") }}</a-radio-button>
          <a-radio-button :value="2">{{ t(tableHeader + "end") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t(tableHeader + 'content')" name="content">
        <a-input
          type="text"
          v-model:value="formData.content"
          @keydown.enter.prevent="onSubmit"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <div>
        <a-button @click="dialogform.visible = false">
          {{ t(btnString + "close") }}
        </a-button>
        <a-button type="primary" @click="onSubmit" :disabled="!formData.content">
          {{ t(btnString + "save") }}
        </a-button>
      </div>
    </template>
  </a-modal>

  <!-- 上传素材弹层 -->
  <a-modal
    v-model:open="dialogform.updateVisible"
    :title="action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
    :width="width < 500 ? '100%' : '50%'"
    @cancel="handleClose"
    @ok="uploadFile"
    :ok-button-props="{ loading: uploadLoading, disabled: videoFile.length === 0 }"
  >
    <a-card
      class="introduce"
      style="padding: 10px"
      :bordered="false"
      v-html="t('navigation.dashboard.aiClip.children.credits.uploadDesc')"
    >
    </a-card>
    <a-upload-dragger
      :multiple="true"
      :file-list="videoFile"
      @remove="handleRemove"
      :before-upload="beforeUpload"
      :headers="headers"
      accept="video/*"
    >
      <p class="ant-upload-drag-icon">
        <lzy-icon name="ep:upload-filled" width="100" height="100"></lzy-icon>
      </p>
      <p class="ant-upload-hint" v-html="t('navigation.btn.uploadFileMsg')"></p>
    </a-upload-dragger>

    <template #footer>
      <div>
        <a-button @click="dialogform.updateVisible = false">
          {{ t(btnString + "close") }}
        </a-button>
        <a-button
          type="primary"
          @click="uploadFile"
          :loading="uploadLoading"
          :disabled="videoFile.length === 0"
        >
          {{ t(btnString + "save") }}
        </a-button>
      </div>
    </template>
  </a-modal>

  <!-- 素材列表 -->
  <a-modal
    v-model:open="dialogform.materialListVisible"
    :title="t('navigation.btn.sourceMaterial')"
    :width="width < 500 ? '100%' : '80%'"
  >
    <CreditsList></CreditsList>

    <template #footer>
      <a-button @click="dialogform.materialListVisible = false">
        {{ t(btnString + "close") }}
      </a-button>
    </template>
  </a-modal>
</template>
<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
