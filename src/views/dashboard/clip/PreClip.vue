<script setup>
import { ref, reactive, onMounted, provide, computed, nextTick } from "vue";
import {
  addScflType,
  editScflType,
  uploadScfl,
  getScflTypeList,
} from "@/api/clip/preClip";

import { useLocalStorage, useSessionStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue"; // Import message
import { useRouter } from "vue-router";

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.aiClip.children.preClip.tableHeader.";
const router = useRouter();
const { width } = useWindowSize();

//使用本地存储来管理素材列表信息数据。
const matInfoData = useLocalStorage("matInfoData", {});

//上传文件的上传状态
const uploadLoading = ref(false);
//存储上传的文件
let videoFile = ref([]); // Use ref
//用来给多文件上传递归的索引
let upload_i = ref(0); // Use ref

const dialogform = reactive({
  visible: false, //弹窗是否显示
  action: "add", //弹窗操作类型
  isHead: false, //是否是片头
  updateVisible: false, //上传素材弹窗是否显示
});

const token = useLocalStorage("token", "");
const headers = ref({
  "Authori-zation": token.value,
});

const formData = reactive({
  id: "",
  uname: "",
});

// 初始化任务列表和选择列表的引用，用于在Vue组件中跟踪和管理数据

let appList = ref([]);
let appListSelect = ref([]);

// 初始化任务列表和总数量的引用，用于数据展示和分页计算
let renwuList = ref([]);
let groupList = ref([]);
let total = ref(0);

// 定义查询条件的响应式对象，用于动态更新查询参数
let listQuery = reactive({
  page: 1, // 当前页码
  pageSize: 10, // 每页数量
  id_no: "", // 身份证号码
  status: "", // 状态
  title: "", // 标题
});

// 初始化表格的唯一键和加载状态的引用
let tableKey = ref(0);
let listLoading = ref(false);

const columns = computed(() => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    sorter: true, // Enable sorting for this column
    align: "center",
    width: 80,
  },
  {
    title: "分类名称",
    dataIndex: "uname",
    key: "uname",
    align: "center",
  },
  {
    title: "素材数量",
    dataIndex: "num",
    key: "num",
    align: "center",
  },
  {
    title: "创建时间",
    dataIndex: "create_time",
    key: "create_time",
    align: "center",
    width: 120,
  },
  {
    title: "操作",
    key: "operate",
    align: "center",
    width: 300,
  },
]);

const fileList = computed(() => {
  return videoFile.value.map((file) => ({
    uid: file.uid,
    name: file.name,
    status: "done", // or 'uploading', 'error'
    response: file.response, // Assuming response is part of the file object
    url: file.url,
  }));
});

//获取任务列表
async function handleGetScflList() {
  // 设置加载状态为true，显示加载中的指示器
  listLoading.value = true;
  // 调用后端接口获取任务列表数据
  let response = await getScflTypeList(listQuery);
  // 检查响应状态码，确保请求成功
  if (response.data.status == 200) {
    // 清空当前任务列表
    // renwuList = []; // No need to clear
    // 更新任务列表数据
    renwuList.value = response.data.data.list;
    // 更新总数量，用于分页计算
    total.value = Number(response.data.data.total);
    // 设置加载状态为false，隐藏加载中的指示器
    listLoading.value = false;
  } else {
    message.error(response.data.msg);
  }
}
// 初始化时调用函数获取任务列表数据
handleGetScflList();

function changePagination(page, pageSize) {
  listQuery.page = page;
  listQuery.pageSize = pageSize;
  handleGetScflList();
}

const handleCreate = async (act, row, index) => {
  dialogform.visible = true;
  dialogform.isHead = index == "head" ? true : false;
  dialogform.action = act;
  clearFormData();

  if (act == "edit") {
    formData.id = row.id;
    formData.uname = row.uname;
  }
};

const onSubmit = async () => {
  let response;
  let params = {
    uname: formData.uname,
  };
  if (dialogform.action == "add") {
    response = await addScflType(params);
  }

  if (dialogform.action == "edit") {
    response = await editScflType(Object.assign(params, { id: formData.id }));
  }
  await handleGetScflList();

  dialogform.visible = false;
  message.success(response.data.msg);
};

const upload = ref();

const beforeUpload = (file) => {
  // Add your validation logic here if needed (e.g., checking file type)
  videoFile.value.push(file);
  return false; // Prevent default Ant Design Vue upload behavior
};

const handleRemove = (file) => {
  const index = videoFile.value.indexOf(file);
  if (index !== -1) {
    videoFile.value.splice(index, 1);
  }
};

const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    message.success("上传成功");
    const imagesDocDir = lowDb.get("systemConfig").imagesDocPath;
    fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
    dialogform.updateVisible = false;
    // upload.value.clearFiles(); // No clearFiles in Ant Design Vue
    handleGetScflList();
  } else {
    message.error(response.msg);
  }
};

const toMatList = async (data, act) => {
  if (act == "uploda") {
    dialogform.updateVisible = true;
    formData.id = data.id;
    videoFile.value = []; // Clear on upload open
  } else {
    matInfoData.value = data;
    router.push("/aiClip/preClip/preClipList");
  }
};

//上传预剪
const uploadFile = async () => {
  if (videoFile.value.length === 0) {
    return; // No files to upload
  }

  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i.value], // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadScfl, //上传方法
    params: {
      scfl_id: formData.id,
    },
    success: async (data) => {
      // onSuccess(data, videoFile[upload_i.value]);
      if (upload_i.value < videoFile.value.length - 1) {
        upload_i.value++;
        uploadFile();
      } else {
        upload_i.value = 0;
        message.success("上传成功");
        uploadLoading.value = false;
        dialogform.updateVisible = false;
        await handleGetScflList();
        videoFile.value = [];
      }
    },
    error: (e) => {
      message.error(e.message || "Upload failed");
      uploadLoading.value = false;
    },
    uploading: (data) => {
      console.log(`lzy  data:`, data);
    },
  });
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
      <a-button type="primary" @click="handleCreate('add', '')">
        {{ t("navigation.btn.preClipAdd") }}
      </a-button>
    </div>

    <!-- 内容列表 -->
    <a-table
      :key="tableKey"
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
        <template v-if="column.dataIndex === 'num'">
          <span>{{ record.num }}</span>
        </template>
        <template v-if="column.dataIndex === 'create_time'">
          <span>{{ record.create_time }}</span>
        </template>
        <template v-if="column.key === 'operate'">
          <a-button type="primary" size="small" @click="toMatList(record, 'uploda')">
            {{ t("navigation.btn.uploadSourceMaterial") }}
          </a-button>
          <a-button type="primary" size="small" @click="toMatList(record, 'get')">
            {{ t("navigation.btn.sourceMaterial") }}
          </a-button>
          <a-button type="primary" size="small" @click="handleCreate('edit', record)">
            {{ t("navigation.btn.edit") }}
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        v-if="total > 0"
        v-model:current="listQuery.page"
        :page-size="listQuery.pageSize"
        :total="total"
        show-quick-jumper
        show-size-changer
        @change="changePagination"
        size="small"
      />
    </div>
  </div>

  <!-- 弹层 -->
  <a-modal
    v-model:open="dialogform.visible"
    :title="dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
    :width="width < 500 ? '100%' : '40%'"
    :ok-button-props="{ disabled: !formData.uname }"
    @ok="onSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item :label="t(textString + 'label')" name="uname">
        <a-input
          type="text"
          v-model:value="formData.uname"
          placeholder=""
          @keyup.enter.prevent="onSubmit"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <div>
        <a-button @click="dialogform.visible = false">
          {{ t(btnString + "close") }}
        </a-button>
        <a-button type="primary" @click="onSubmit" :disabled="!formData.uname">
          {{ t(btnString + "save") }}
        </a-button>
      </div>
    </template>
  </a-modal>

  <!-- 上传素材弹层 -->
  <a-modal
    v-model:open="dialogform.updateVisible"
    :title="dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
    :width="width < 500 ? '100%' : '30%'"
    @cancel="handleClose"
    @ok="uploadFile"
    :ok-button-props="{ loading: uploadLoading, disabled: videoFile.length === 0 }"
  >
    <a-card
      class="introduce"
      :bordered="false"
      v-html="t('navigation.dashboard.aiClip.children.preClip.uploadDesc')"
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
</template>

<style scoped></style>
