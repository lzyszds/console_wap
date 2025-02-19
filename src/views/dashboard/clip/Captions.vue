<template>
  <div class="zycard-container">
    <div class="filter-container">
      <a-button type="primary" @click="lookCaption('add')">
        {{ t("navigation.btn.captionAdd") }}
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
        <!-- 内容 -->
        <template v-if="column.dataIndex === 'content'">
          <a-tag
            v-for="item in record.content.split(',')"
            :key="item"
            style="margin-right: 5px"
          >
            {{ item }}
          </a-tag>
        </template>
        <!-- 操作 -->
        <template v-if="column.dataIndex === 'operate'">
          <a-button type="primary" size="small" @click="lookCaption('edit', record)">
            {{ t("navigation.btn.captionEdit") }}
          </a-button>
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

    <!-- 上传素材弹层 -->
    <a-modal
      v-model:open="dialogform.addVisible"
      :title="
        (dialogform.action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')) +
        ' ' +
        t(tableHeader + 'content')
      "
      :width="width < 800 ? '100%' : '70%'"
      @cancel="handleClose"
      @ok="onSubmit"
      :maskClosable="false"
    >
      <a-form layout="vertical">
        <a-form-item :label="t(dialogTitle)" name="uname">
          <a-input v-model:value="formData.uname" type="text" placeholder="" />
        </a-form-item>
        <a-form-item
          v-for="(item, index) in renwuListChilder"
          :key="index"
          :label="tableHeader.content + (index + 1)"
          :name="'content' + index"
        >
          <div style="display: flex; gap: 10px; width: 100%">
            <a-input v-model:value="renwuListChilder[index]" @keyup.enter="onSubmit">
              <template #addonAfter>
                <a-button type="primary" @click="delSingleCaption(index)" size="small">
                  <lzy-icon name="gg:close" height="15px" align="0"></lzy-icon>
                </a-button>
              </template>
            </a-input>
          </div>
        </a-form-item>
        <a-form-item>
          <a-button @click="renwuListChilder.push('')">
            {{ t(btnString + "add") }} {{ t(tableHeader + "content") }}
          </a-button>
        </a-form-item>
      </a-form>
      <template #footer>
        <div>
          <a-button @click="dialogform.addVisible = false">
            {{ t(btnString + "close") }}
          </a-button>
          <a-button type="primary" @click="onSubmit">
            {{ t(btnString + "save") }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { addCaptions, getCaptionsList, editCaptions } from "@/api/clip/captions";
import { useStore } from "@/store/index.js";
import LzyIcon from "@/components/LzyIcon.vue";
import { useI18n } from "vue-i18n";
import { useWindowSize } from "@vueuse/core";
import { message, Modal } from "ant-design-vue";

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const tableHeader = "navigation.dashboard.aiClip.children.captions.tableHeader.";
const dialogTitle = "navigation.dashboard.aiClip.children.captions.dialog.title";

const router = useRouter();
const store = useStore();

const dialogform = reactive({
  visible: false, //弹窗是否显示
  action: "add", //弹窗操作类型
  addVisible: false, //上传素材弹窗是否显示
});
const { width } = useWindowSize();

const formData = reactive({
  id: "",
  uname: "",
  content: "",
});

let renwuList = ref([]);
const renwuListChilder = ref(["", ""]);

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
      title: t(tableHeader + "uname"),
      dataIndex: "uname",
      key: "uname",
      align: "center",
      width: 150,
    },
    {
      title: t(tableHeader + "content"),
      dataIndex: "content",
      key: "content",
      align: "center",
    },
    {
      title: t(tableHeader + "create_time"),
      dataIndex: "create_time",
      key: "create_time",
      align: "center",
      width: 150,
    },
    {
      title: t(tableHeader + "operate"),
      dataIndex: "operate",
      key: "operate",
      align: "center",
      width: 250,
    },
  ];
});

//获取任务列表
async function handleGetCaptionsList() {
  listLoading.value = true;
  let response = await getCaptionsList(listQuery);
  if (response.data.status == 200) {
    //this.categoryList = response.data.data
    renwuList.value = response.data.data.list;
    listQuery.total = Number(response.data.data.total);
    listLoading.value = false;
  } else {
    message.error({
      content: response.data.msg,
    });
  }
}
handleGetCaptionsList();

function changePagination(e) {
  listQuery.page = e;
  handleGetCaptionsList();
}

const onSubmit = async () => {
  let content = "",
    response;
  renwuListChilder.value.forEach((item, index) => {
    if (item == "") return;
    content += item + (index == renwuListChilder.value.length - 1 ? "" : ",");
  });
  let params = {
    content: content,
    uname: formData.uname,
  };
  if (dialogform.action == "add") {
    response = await addCaptions(params);
  }

  if (dialogform.action == "edit") {
    response = await editCaptions(Object.assign(params, { id: formData.id }));
  }
  dialogform.addVisible = false;
  handleGetCaptionsList();
  message.success(response.data.msg);
};

//打开弹窗
const lookCaption = async (act, row) => {
  dialogform.action = act;
  if (act == "add") {
    clearFormData();
  } else {
    formData.id = row.id;
    formData.uname = row.uname;
    renwuListChilder.value = !row.content ? [""] : row.content.split(",");
  }
  dialogform.addVisible = true;
};

const delSingleCaption = (index) => {
  if (renwuListChilder.value.length == 1) return;
  renwuListChilder.value.splice(index, 1);
};

//清空表单数据
const clearFormData = () => {
  formData.id = "";
  formData.uname = "";
  formData.content = "";
  renwuListChilder.value = [""];
};

function handleClose() {}
</script>

<style scoped>
/* 覆盖 Ant Design Vue 的样式 */
.captions-container .ant-input-group-addon {
  padding: 0 10px;
  background-color: #fff; /* 或者您想要的背景颜色 */
  border: 1px solid #d9d9d9;
  border-radius: 4px; /* 如果需要圆角 */
}
/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: end;
}
</style>
