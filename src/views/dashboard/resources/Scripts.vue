<template>
  <div class="scripts-container">
    <div class="filter-container">
      <a-button style="" type="primary" @click="handleCreate('add', '')">
        {{ i18nTexts.addScript }}
      </a-button>
      <a-button
        type="primary"
        danger
        @click="handleDel('all')"
        :type="rowArr.length ? 'danger' : 'info'"
      >
        {{ i18nTexts.delScript }}
      </a-button>
    </div>

    <!-- 内容列表 -->
    <a-table
      :key="tableKey"
      :loading="listLoading"
      :data-source="renwuList"
      :columns="columns"
      bordered
      :row-selection="rowSelection"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'id'">
          <span>{{ record.id }}</span>
        </template>
        <template v-if="column.dataIndex === 'script_content'">
          <span>{{ record.script_content }}</span>
        </template>
        <template v-if="column.dataIndex === 'script_grouping_id'">
          <span>{{ record.script_grouping_id }}</span>
        </template>
        <template v-if="column.dataIndex === 'script_grouping_name'">
          <span>{{ record.script_grouping_name }}</span>
        </template>
        <template v-if="column.dataIndex === 'type'">
          <span>{{ record.type }}</span>
        </template>
        <template v-if="column.dataIndex === 'create_time'">
          <span>{{ record.create_time }}</span>
        </template>
        <template v-if="column.key === 'operate'">
          <a-button type="primary" size="small" danger @click="handleDel(record)">
            {{ i18nTexts.delbtn }}
          </a-button>
          <a-button
            style="margin-left: 10px"
            type="primary"
            size="small"
            @click="handleCreate('edit', record)"
          >
            {{ i18nTexts.edit }}
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
      />
    </div>
  </div>

  <!-- 弹层 -->
  <a-modal
    v-model:open="dialogFormVisible"
    :title="action == 'add' ? i18nTexts.add : i18nTexts.edit"
    :width="width < 500 ? '100%' : '50%'"
    @cancel="handleClose"
    @ok="onSubmit"
  >
    <a-form
      :model="formData"
      label-align="left"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item :label="i18nTexts.formLable.appPlatform" name="type">
        <a-select
          v-model:value="formData.type"
          :placeholder="i18nTexts.formLable.selectMessage"
        >
          <a-select-option v-for="item in appList" :key="item.value" :value="item.value">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="i18nTexts.formLable.selectScriptType" name="type">
        <a-select
          v-model:value="formData.script_grouping_id"
          :placeholder="i18nTexts.formLable.selectMessage"
        >
          <a-select-option
            v-for="item in script_List"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="i18nTexts.formLable.scriptContent" name="script_content">
        <a-textarea v-model:value="formData.script_content" placeholder="" />
      </a-form-item>
    </a-form>
    <template #footer>
      <div>
        <a-button @click="dialogFormVisible = false">{{ i18nTexts.close }}</a-button>
        <a-button type="primary" @click="onSubmit()">{{ i18nTexts.save }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  addScript,
  editScript,
  getScriptList,
  deleteScript,
  getScriptTypeList,
} from "@/api/resource/scripts";
import {
  handleClose,
  getTaskListDataFn,
  getAppListUtils,
  useResetableForm,
  onSubmitForm,
  handleDelFn,
} from "@/utils";
import { useI18n } from "vue-i18n";
import { useWindowSize } from "@vueuse/core";
import { computed } from "vue";
const { t } = useI18n();
const textString = "navigation.dashboard.resourceManagement.children.scripts.";
const i18nTexts = {
  addScript: t("navigation.btn.addScript"),
  delScript: t("navigation.btn.delScript"),
  delbtn: t("navigation.btn.delete"),
  add: t("navigation.btn.add"),
  edit: t("navigation.btn.edit"),
  save: t("navigation.btn.save"),
  close: t("navigation.btn.close"),
  formLable: {
    appPlatform: t(textString + "formLabel.appPlatform"),
    selectScriptType: t(textString + "formLabel.selectScriptType"),
    scriptContent: t(textString + "formLabel.scriptContent"),
    selectMessage: t(textString + "formLabel.selectMessage"),
  },
};

const { width } = useWindowSize();

const defaultFormData = {
  id: "",
  script_grouping_id: "",
  script_content: "",
  type: "",
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const action = ref("add");
const dialogFormVisible = ref(false);
const rowArr = ref([]);
const appList = ref([
  {
    value: "tiktok",
    name: "Tiktok",
  },
  {
    value: "douyin",
    name: "douyin",
  },
  {
    value: "whatsApp",
    name: "WhatsApp",
  },
  {
    value: "line",
    name: "line",
  },
  {
    value: "snapchat",
    name: "snapchat",
  },
  {
    value: "instagram",
    name: "instagram",
  },
]);
const renwuList = ref([]);
const tableKey = ref(0);
const listLoading = ref(false);
const script_List = ref([]);

const listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  id_no: "",
  status: "",
  title: "",
});

// Columns definition
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    sorter: true,
    align: "center",
    width: 80,
  },
  {
    title: t(textString + "tableHeader.scriptContent"),
    dataIndex: "script_content",
    key: "script_content",
    align: "center",
    width: 600,
  },
  {
    title: t(textString + "tableHeader.scriptGroupingId"),
    dataIndex: "script_grouping_id",
    key: "script_grouping_id",
    align: "center",
  },
  {
    title: t(textString + "tableHeader.scriptGroupingName"),
    dataIndex: "script_grouping_name",
    key: "script_grouping_name",
    align: "center",
  },
  {
    title: t(textString + "tableHeader.appType"),
    dataIndex: "type",
    key: "type",
    align: "center",
  },
  {
    title: t(textString + "tableHeader.createTime"),
    dataIndex: "create_time",
    key: "create_time",
    align: "center",
    width: 120,
  },
  {
    title: t(textString + "tableHeader.operate"),
    key: "operate",
    align: "center",
    width: 200,
  },
];

// Row selection configuration
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    rowArr.value = selectedRows;
  },
};

//获取任务列表
function getTableData() {
  handleGetAppList();
  getTaskListDataFn(getScriptList, listQuery).then((res) => {
    if (res != null) {
      renwuList.value = res.list;
      listQuery.total = Number(res.total);
    } else {
      renwuList.value = [];
    }
    listLoading.value = false;
  });
}

getTableData();

function changePagination(page, pageSize) {
  listQuery.page = page;
  listQuery.pageSize = pageSize;
  getTableData();
}

//获取应用平台类型
async function handleGetAppList() {
  getAppListUtils(getScriptTypeList, {
    // grouping_name: formData.type,
  }).then((res) => {
    script_List.value = res;
  });
}

const handleCreate = async (act, row) => {
  action.value = act;

  dialogFormVisible.value = true;
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row);
  }
};

const onSubmit = async () => {
  const { script_grouping_id, id, ...fdata } = formData;
  onSubmitForm({
    form: { ...fdata, grouping_id: script_grouping_id, script_id: formData.id },
    formID: "script_id",
    action: action.value,
    addDateForm: addScript,
    editDateForm: editScript,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//选择任务
const handleSelectionChange = (val) => {
  rowArr.value = val;
};

const handleDel = async (row) => {
  handleDelFn(row == "all" ? rowArr.value : [row], deleteScript, getTableData, (val) => {
    return { script_id: val.id };
  });
};

onMounted(() => {});
</script>

<style scoped>
.scripts-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
}
.filter-container {
  margin-bottom: 20px;
}
</style>
