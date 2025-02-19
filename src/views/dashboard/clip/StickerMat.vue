<script setup>
import {
  addStickersType,
  editStickersType,
  uploadStickers,
  getStickersTypeList,
} from "@/api/clip/stickerMat";

import { useLocalStorage, useSessionStorage, useWindowSize } from "@vueuse/core";
import { uploadByPieces } from "@/utils/upload";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
const { t, locale } = useI18n();
const { width } = useWindowSize();
const router = useRouter();

//使用本地存储来管理素材列表信息数据。
const matInfoData = useLocalStorage("matInfoData", {});

//使用会话存储来管理组件索引。
const componentIndex = useSessionStorage("componentIndex", "1-1");

//上传文件的上传状态
const uploadLoading = ref(false);
//存储上传的文件
let videoFile = ref([]); // Use ref for videoFile
//用来给多文件上传递归的索引
let upload_i = ref(0);

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

// 初始化任务列表和总数量的引用，用于数据展示和分页计算
let renwuList = ref([]);
let groupList = ref([]);

// 定义查询条件的响应式对象，用于动态更新查询参数
let listQuery = reactive({
  page: 1, // 当前页码
  pageSize: 10, // 每页数量
  id_no: "", // 身份证号码
  status: "", // 状态
  title: "", // 标题
  total: 0,
});

// 初始化表格的唯一键和加载状态的引用
let tableKey = ref(0);
let listLoading = ref(false);

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
    response: file.response, // Assuming you have response
    url: file.url,
    // ... other properties you need
  }));
});

//获取任务列表
async function handleGetStickersList() {
  // 设置加载状态为true，显示加载中的指示器
  listLoading.value = true;
  // 调用后端接口获取任务列表数据
  let response = await getStickersTypeList(listQuery);
  // 检查响应状态码，确保请求成功
  if (response.data.status == 200) {
    // 清空当前任务列表
    // renwuList = []; // No need to clear, just assign
    // 更新任务列表数据
    renwuList.value = response.data.data.list;
    // 更新总数量，用于分页计算
    listQuery.total = Number(response.data.data.total);
    // 设置加载状态为false，隐藏加载中的指示器
    listLoading.value = false;
  } else {
    message.error(response.data.msg);
  }
}
// 初始化时调用函数获取任务列表数据
handleGetStickersList();

//更新分页信息并重新获取列表数据
function changePagination(page, pageSize) {
  listQuery.page = page;
  listQuery.pageSize = pageSize;
  handleGetStickersList();
}

//添加或修改
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
    response = await addStickersType(params);
  }

  if (dialogform.action == "edit") {
    response = await editStickersType(Object.assign(params, { id: formData.id }));
  }
  await handleGetStickersList();

  dialogform.visible = false;
  message.success(response.data.msg);
};

const upload = ref();
const beforeUpload = (file) => {
  if (file.type.indexOf("image") === -1) {
    message.error("请上传图片");
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

const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    message.success("上传成功");
    const imagesDocDir = lowDb.get("systemConfig").imagesDocPath;
    fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
    dialogform.updateVisible.value = false;
    // upload.value.clearFiles(); // Ant Design Vue doesn't have clearFiles
    handleGetStickersList();
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
    router.push("/aiClip/stickerMat/stickerMatList");
  }
};

//上传贴纸
const uploadFile = async () => {
  uploadLoading.value = true;
  await uploadByPieces({
    file: videoFile.value[upload_i.value].raw, // 视频实体
    pieceSize: 3, // 分片大小
    upload: uploadStickers, //上传方法
    params: {
      stickers_id: formData.id,
    },
    success: async (data) => {
      // onSuccess(data, videoFile.value[upload_i.value]);
      if (upload_i.value < videoFile.value.length - 1) {
        upload_i.value++;
        uploadFile();
      } else {
        await nextTick();
        upload_i.value = 0;
        uploadLoading.value = false;
        dialogform.updateVisible = false;
        message.success("上传成功");
        await handleGetStickersList();
        videoFile.value = [];
      }
    },
    error: (e) => {
      message.error(e.msg);
      uploadLoading.value = false;
    },
    uploading: () => {},
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
        {{ t("navigation.btn.stickerMatAdd") }}
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
    :title="dialogform.action == 'add' ? '添加' : '修改'"
    :width="width < 500 ? '100%' : '70%'"
    :ok-button-props="{ disabled: !formData.uname }"
    @ok="onSubmit"
    @cancel="handleClose"
  >
    <a-form :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="贴纸素材分类名称：" name="uname">
        <a-input
          type="text"
          v-model:value="formData.uname"
          @keyup.enter.prevent="onSubmit"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <div>
        <a-button @click="dialogform.visible = false">关闭</a-button>
        <a-button type="primary" @click="onSubmit" :disabled="!formData.uname"
          >保存</a-button
        >
      </div>
    </template>
  </a-modal>

  <!-- 上传素材弹层 -->
  <a-modal
    v-model:open="dialogform.updateVisible"
    :title="action == 'add' ? '添加' : '修改'"
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
    <a-upload
      ref="upload"
      :multiple="true"
      :file-list="fileList"
      :remove="handleRemove"
      :before-upload="beforeUpload"
      :headers="headers"
      :show-upload-list="false"
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
        <a-button @click="dialogform.updateVisible = false">关闭</a-button>
        <a-button
          type="primary"
          @click="uploadFile"
          :loading="uploadLoading"
          :disabled="videoFile.length === 0"
          >保存</a-button
        >
      </div>
    </template>
  </a-modal>
</template>
<style scoped></style>
