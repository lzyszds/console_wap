<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/comment";
import { taskRun } from "@/api/task/run";
import _ from "lodash";
import { tiktok } from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.tiktok.children.comment.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const selectDeviceData = reactive({});

const defaultFormData = {
  id: "",
  notes_name: "",
  type: "tiktok",
  device_number_arr: "",
  regulation: "0",
  keyword: "",
  content: "",
  task_num: "10",
  selectArr: [],
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);
let listLoading = ref(false); //任务列表加载状态

let listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "tiktok",
  taskName: "CommentTask",
  grouping_name: "",
  keyword: "",
});

const editParams = [
  {
    label: () => t(btnString + "addParams"),
    icon: "mage:plus",
    callback: () => handleCreate("add"),
    type: "add",
  },
  {
    label: () => t(btnString + "editParams"),
    icon: "iconamoon:edit-light",
    callback: (item) => handleCreate("edit", item),
  },
  {
    label: () => t(btnString + "deleteParams"),
    icon: "iconamoon:trash-light",
    callback: (item) => handleDelFn.call(this, [item], deleteData, getTableData),
  },
];

const tableTitle = [
  { prop: "id", label: "ID" },
  {
    prop: "keyword",
    label: () => getLabel("keyword"),
    template: (row) => convertString(row.keyword),
  },
  {
    prop: "content",
    label: () => getLabel("content"),
    template: (row) => convertString(row.content),
  },
  { prop: "task_num", label: () => getLabel("task_num"), width: 120 },
  { prop: "create_time", label: () => getLabel("create_time") },
];

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  tableTitle,
  editParams,
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
});

//获取任务列表
function getTableData() {
  getTaskListDataFn(getDataList, listQuery).then((res) => {
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

const handleCreate = async (act, row) => {
  action.value = act;

  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      regulation: (value) => (value ? value : "0"),
    });
    if (formData.regulation == 1) {
      for (let item of formData.device_number_arr) {
        selectDeviceData[item] = {
          keyword: parseFilter(row, "keyword", item),
          content: parseFilter(row, "content", item),
        };
      }
      for (let item in formData) {
        if (!["id", "grouping_id", "device_number_arr", "regulation"].includes(item)) {
          formData[item] = defaultFormData[item];
        }
      }
    } else {
      for (let item in formData) {
        if (!["id", "grouping_id", "device_number_arr", "regulation"].includes(item)) {
          try {
            formData[item] = JSON.parse(row[item])[0].value;
          } catch (e) {}
        }
      }
    }
  }
  dialogFormVisible.value = true;
};

function parseFilter(row, key, item) {
  return JSON.parse(row[key]).filter((i) => i.deviceId == item)[0].value;
}

const onSubmit = async () => {
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);

const params = {
  platform: listQuery.platform,
  taskName: listQuery.taskName,
};

//启动任务
const handleTask = _.debounce(async (...arg) => {
  const [taskType, row] = arg;
  const data = await tiktok["comment"]({
    ...params,
    taskType,
    row,
  });
  taskRun({
    taskId: row.id,
    taskType,
    ...params,
    data,
  });
}, 300);

watch(
  () => formData.device_number_arr,
  (newVal) => {
    if (!newVal || newVal.length == 0) return;
    if (action.value != "add" && formData.regulation == "1") return;
    //先检查selectDeviceData是否有这个设备
    const deviceId = formData.device_number_arr;
    //清除多余的设备
    for (let item in selectDeviceData) {
      if (!deviceId.includes(item) && item != 0) {
        delete selectDeviceData[item];
      }
    }
    deviceId.forEach((item) => {
      if (!selectDeviceData[item]) {
        selectDeviceData[item] = {
          keyword: "",
          content: "",
        };
      }
    });
  }
);
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <a-form-item :label="getLabel('keyword')">
        <a-input v-model:value="formData.keyword" />
      </a-form-item>
      <a-form-item :label="getLabel('content')">
        <UploadInput
          prop="content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <a-form-item :label="getLabel('task_num')">
        <a-input-number v-model:value="formData.task_num" />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
    </template>
  </RecordPop>
</template>
<style scoped>
.el-form-item__content {
  & > div {
    width: 100%;
  }
}
</style>
