<script setup>
import UploadInput from "@/components/paramsform/UploadInput";
import { addData, editData, getDataList, deleteData } from "@/api/task/whatsApp/message";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
  setMessage,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.whatsapp.children.message.";
const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "", //id
  type: "whatsApp", //应用平台类型
  notes_name: "", //分组
  device_number_arr: "", //设备
  private_message: "1", //私信类型 0全部好友 1指定好友
  friend_id: "", //好友id
  regulation: "0", //规则 0全部 1单独
  message_time: 10, //间隔时间
  duration_stay_start: 5, //间隔时长/秒
  duration_stay_end: 10, //间隔时长/秒
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
  taskName: "message",
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
    { prop: "id", label: "ID" },
    { prop: "notes_name", label: () => getLabel("notes_name") },
    {
      prop: "private_message",
      label: getLabel("private_message.title"),
      template: (row) => {
        return row.private_message == 0
          ? getLabel("private_message.all")
          : getLabel("private_message.appoint");
      },
    },
    {
      prop: "friend_id",
      label: getLabel("friend_id"),
      template: (row) => convertString(row.friend_id),
    },
    {
      prop: "romdomMessage",
      label: getLabel("romdomMessage"),
    },
    {
      prop: "message_time",
      label: getLabel("message_time"),
    },
    { prop: "create_time", label: getLabel("create_time") },
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
      device_number_arr: (value) => value.split(","),
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
      if (formData.private_message == 1) {
        if (formData.friend_id == "") {
          setMessage("error", "好友id不能为空");
          return false;
        }
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

function assignBefore(row) {
  formData.duration_stay_start = row.message_time.split(",")[0];
  formData.duration_stay_end = row.message_time.split(",")[1];
}

function postBefore() {
  formData.message_time = formData.duration_stay_start + "," + formData.duration_stay_end;
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
      <a-form-item :label="getLabel('private_message.title')">
        <a-radio-group v-model:value="formData.private_message" button-style="solid">
          <!-- <a-radio-button value="0">全部好友</a-radio-button> -->
          <a-radio-button value="1">
            {{ getLabel("private_message.appoint") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="getLabel('friend_id')" v-if="formData.private_message == 1">
        <UploadInput prop="friend_id" />
      </a-form-item>

      <!-- 间隔时间 -->
      <a-form-item :label="getLabel('message_time')">
        <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
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
