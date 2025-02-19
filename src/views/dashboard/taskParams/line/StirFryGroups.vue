<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
} from "@/api/task/line/stirFryGroups";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.line.children.stirFryGroups.";

const defaultFormData = {
  id: "",
  type: "line",
  notes_name: "", //参数名称
  grouping_name: "", //群名称
  message_content: "", //随机消息
  duration_interval: "3,5", //随机时间间隔
  duration_interval_start: "3", //随机时间间隔 开始
  duration_interval_end: "5", //随机时间间隔 结束

  duration_chat: "10,15", //聊天时间间隔
  duration_chat_start: "10", //聊天时间间隔 开始
  duration_chat_end: "15", //聊天时间间隔 结束
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "line",
  taskName: "stirFryGroups",
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

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  editParams,
  tableTitle: [
    { prop: "id", label: "ID"},
    {
      prop: "grouping_name",
      label: t(textString + "tableHeader.grouping_name"),
      template: (row) => convertString(row.grouping_name),
    },
    { prop: "message_content", label: t(textString + "tableHeader.message_content") },
    { prop: "duration_interval", label: t(textString + "tableHeader.duration_interval") },
    { prop: "duration_chat", label: t(textString + "tableHeader.duration_chat") },
    {
      prop: "status",
      label: t(textString + "tableHeader.status"),
      width: 180,
      platformTask: "line_stirFryGroups",
    },
    { prop: "create_time", label: t(textString + "tableHeader.create_time"), width: 180 },
  ],
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
      stirFryGroups_value: (value) => value.split(","),
    });
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    checkParameter,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//编辑表单前
function assignBefore(row) {
  formData.duration_interval_start = row.duration_interval.split(",")[0];
  formData.duration_interval_end = row.duration_interval.split(",")[1];
  formData.duration_chat_start = row.duration_chat.split(",")[0];
  formData.duration_chat_end = row.duration_chat.split(",")[1];
}

//提交前
function postBefore() {
  formData.duration_interval = [
    formData.duration_interval_start,
    formData.duration_interval_end,
  ].join(",");
  formData.duration_chat = [
    formData.duration_chat_start,
    formData.duration_chat_end,
  ].join(",");
}

function checkParameter({ checkWhole }) {
  postBefore();
  let checkArr = [checkWhole("grouping_name", t(textString + "form.grouping_name"))];

  if (!checkArr.every((item) => item)) return false;
  else return true;
}

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <a-form-item class="bloggerID" :label="t(textString + 'tableHeader.grouping_name')">
        <a-textarea v-model:value="formData.grouping_name" />
      </a-form-item>
      <a-form-item
        class="bloggerID"
        :label="t(textString + 'tableHeader.message_content')"
      >
        <a-textarea
          v-model:value="formData.message_content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <a-form-item :label="t(textString + 'tableHeader.duration_interval')">
        <div class="input-group">
          <a-input-number v-model:value="formData.duration_interval_start" :min="1" />
          ~
          <a-input-number v-model:value="formData.duration_interval_end" :min="1" />
        </div>
      </a-form-item>
      <a-form-item :label="t(textString + 'tableHeader.duration_chat')">
        <div class="input-group">
          <a-input-number v-model:value="formData.duration_chat_start" :min="1" />
          ~
          <a-input-number v-model:value="formData.duration_chat_end" :min="1" />
        </div>
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
