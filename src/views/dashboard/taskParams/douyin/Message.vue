<script setup>
import { ref, reactive, provide } from "vue";
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/message";
import { taskRun } from "@/api/task/run";
import { douyin } from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  handleNotInitData,
  setMessage,
} from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.message.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "", //id
  notes_name: "", //备注名称
  type: "douyin", //应用平台类型
  message_num: 10, //私信数量
  message_content: "", //私信内容
  duration_stay: [5, 10], //间隔时长
  duration_stay_start: 5,
  duration_stay_end: 10,
  is_repeat: 0, //是否重复
  private_message: "0", //私信人（朋友、关注、粉丝）
  regulation: "0", //规则
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
let renwuList = ref([]); //分组列表

let listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "douyin",
  taskName: "message",
  grouping_name: "",
  keyword: "",
});

const private_message_list = [
  { label: getLabel("private_message_list.0"), value: "0" },
  { label: getLabel("private_message_list.1"), value: "1" },
];

const editParams = [
  {
    label: () => t(btnString + "addParams"),
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
    danger: (item) => item.length > 0,
    type: "info",
  },
];

const tableTitle = [
  { prop: "id", label: "ID" },
  { prop: "message_num", label: () => getLabel("message_num") },
  {
    prop: "message_content",
    label: () => getLabel("message_content"),
  },
  { prop: "message_time", label: () => getLabel("message_time") },
  {
    prop: "private_message",
    label: () => getLabel("private_message"),
    template: (row) =>
      row.private_message == 0 ? getLabel("private_message_list.0") : "",
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
async function getTableData() {
  getTaskListDataFn(getDataList, listQuery).then((res) => {
    if (res != null) {
      renwuList.value = res.list;
      listQuery.total = Number(res.total);
    } else {
      renwuList.value = [];
    }
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
    });
    formData.duration_stay_start = row.message_time.split(",")[0];
    formData.duration_stay_end = row.message_time.split(",")[1];
  }
};

const onSubmit = async () => {
  formData.message_time = [
    formData.duration_stay_start,
    formData.duration_stay_end,
  ].join(",");

  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (!formData.message_content) {
        setMessage("error", getLabel("message_content") + t(publicString + "empty"));
        return false;
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <!-- 私信内容 -->
      <a-form-item :label="getLabel('message_content')">
        <UploadInput
          prop="message_content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 私信数量 -->
      <a-form-item :label="getLabel('message_num')">
        <a-input-number v-model:value="formData.message_num" :min="1" />
      </a-form-item>

      <!-- 间隔时长 -->
      <a-form-item :label="getLabel('message_time')">
        <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
      </a-form-item>

      <!-- 私信人 -->
      <a-form-item :label="getLabel('private_message')">
        <a-select
          v-model:value="formData.private_message"
          :placeholder="t(btnString + 'selectMessage')"
          :options="private_message_list"
        />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
<style scoped></style>
