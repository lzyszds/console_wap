<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/like";
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
const textString = "navigation.dashboard.taskParams.tiktok.children.like.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "", //任务ID
  type: "tiktok", //应用类型
  notes_name: "", //备注名称
  bloggerId: "", //博主ID
  regulation: "0", //单独设置id
  pending_execution_time: "10", //点赞间隔
  duration_stay_start: "5", //点赞间隔开始
  duration_stay_end: "10", //点赞间隔结束
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
  taskName: "likes",
  grouping_name: "",
  keyword: "",
});

const editParams = [
  {
    label: () => t(btnString + "addTask"),
    icon: "mage:plus",
    callback: () => handleCreate("add"),
    type: "add",
  },
  {
    label: () => t(btnString + "edit"),
    icon: "iconamoon:edit-light",
    callback: (item) => handleCreate("edit", item),
  },
  {
    label: () => t(btnString + "deleteTask"),
    icon: "iconamoon:trash-light",
    callback: (item) => handleDelFn.call(this, [item], deleteData, getTableData),
    type: "delete",
  },
];

const tableTitle = [
  { prop: "id", label: "ID" },
  {
    prop: "bloggerId",
    label: () => getLabel("bloggerId"),
    template: (row) => convertString(row.bloggerId),
  },
  {
    prop: "pending_execution_time",
    label: () => getLabel("pending_execution_time"),
    width: 180,
  },
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
  dialogFormVisible.value = true;

  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      regulation: (value) => (value ? value : "0"),
      bloggerId: (value) => {
        try {
          return value.indexOf("[") == 0 ? JSON.parse(value) : value;
        } catch (e) {
          return value;
        }
      },
    });
    formData.duration_stay_start = row.pending_execution_time.split(",")[0];
    formData.duration_stay_end = row.pending_execution_time.split(",")[1];
  }
};

const onSubmit = async () => {
  formData.pending_execution_time = [
    formData.duration_stay_start,
    formData.duration_stay_end,
  ].join(",");
  //将每个值转换成响应的value
  // handleValue("bloggerId", formData);
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
  const data = await tiktok[listQuery.taskName]({
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
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <!-- <UploadBlogId :label="getLabel('bloggerId')" prop="bloggerId"></UploadBlogId> -->
      <a-form-item :label="getLabel('bloggerId')">
        <UploadInput
          prop="bloggerId"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <a-form-item :label="getLabel('pending_execution_time')">
        <a-input-number v-model:value="formData.duration_stay_start" min="0" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" min="0" />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
