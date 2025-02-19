<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
} from "@/api/task/whatsApp/stirFryGroups";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
  setMessage,
} from "@/utils";

import UploadInput from "@/components/paramsform/UploadInput";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.whatsapp.children.stirFryGroups.";
const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "", //id
  type: "whatsApp", //应用平台类型
  notes_name: "", //分组
  device_number_arr: "", //设备
  regulation: "0", //规则
  message_time: 10, //间隔时间
  message_time_start: 5, //间隔时间/秒
  message_time_end: 10, //间隔时间/秒
  stirfry_timer: 10, //炒群时长
  stirfry_timer_start: 5, //炒群时长/秒
  stirfry_timer_end: 10, //炒群时长/秒
  stirfry_groups_id: "", //炒群群名称id
  romdomMessage: "", //随机信息
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
  pageSize: 10,
  total: 0,
  platform: "whatsApp",
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
    { prop: "notes_name", label: () => getLabel("notes_name") },
    {
      prop: "stirfry_groups_id",
      label: getLabel("stirfry_groups_id"),
      template: (row) => convertString(row.stirfry_groups_id),
      width: 180,
    },
    {
      prop: "romdomMessage",
      label: getLabel("romdomMessage"),
      width: 180,
    },
    {
      prop: "message_time",
      label: getLabel("message_time"),
      width: 180,
    },
    {
      prop: "stirfry_timer",
      label: getLabel("stirfry_timer"),
      width: 180,
    },
    {
      prop: "create_time",
      label: getLabel("create_time"),
      width: 180,
    },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
});

//获取任务列表
async function getTableData() {
  const res = await getTaskListDataFn(getDataList, listQuery);
  if (res != null) {
    renwuList.value = res.list;
    listQuery.total = Number(res.total);
  } else {
    renwuList.value = [];
  }
}

getTableData();

const handleCreate = async (act, row) => {
  action.value = act;
  dialogFormVisible.value = true;
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      private_message: (value) => value + "",
    });
    assignBefore(row);
  }
};

const onSubmit = async () => {
  postBefore();
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (formData.stirfry_groups_id == "") {
        setMessage("error", getLabel("stirfry_groups_id") + t(publicString + "empty"));
        return false;
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};
//编辑表单前
function assignBefore(row) {
  formData.message_time_start = row.message_time.split(",")[0];
  formData.message_time_end = row.message_time.split(",")[1];
  formData.stirfry_timer_start = row.stirfry_timer.split(",")[0];
  formData.stirfry_timer_end = row.stirfry_timer.split(",")[1];
}

//提交前
function postBefore() {
  formData.message_time = `${formData.message_time_start},${formData.message_time_end}`;
  formData.stirfry_timer = `${formData.stirfry_timer_start},${formData.stirfry_timer_end}`;
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
      <!-- 炒群名称 -->
      <a-form-item :label="getLabel('stirfry_groups_id')">
        <UploadInput prop="stirfry_groups_id" />
      </a-form-item>

      <!-- 间隔时间 -->
      <a-form-item :label="getLabel('message_time')">
        <a-input-number v-model:value="formData.message_time_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.message_time_end" :min="1" />
      </a-form-item>

      <!-- 炒群时长 -->
      <a-form-item :label="getLabel('stirfry_timer')">
        <a-input-number v-model:value="formData.stirfry_timer_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.stirfry_timer_end" :min="1" />
      </a-form-item>

      <!-- 随机信息 -->
      <a-form-item :label="getLabel('romdomMessage')">
        <UploadInput prop="romdomMessage" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style  scoped></style>
