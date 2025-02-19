<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
} from "@/api/task/whatsApp/addFriend";

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

import UploadInput from "@/components/paramsform/UploadInput";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.whatsapp.children.addFriend.";
const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //分组
  type: "whatsApp", //应用类型
  regulation: "0", //规则
  way: 0, //关注方式
  callType: 0, //拨打类型
  hangUpTime: 10, //挂断时间
  hangUpTime_start: 5, //挂断时间/秒
  hangUpTime_end: 10, //挂断时间/秒
  contactsUploadList: "", //通讯录上传列表
  num: 2, //数量
  time: 10, //间隔时长
  time_start: 5, //间隔时长/秒
  time_end: 10, //间隔时长/秒
  randomMessage: "", //随机信息
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
  platform: "whatsApp",
  taskName: "addFriend",
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
      prop: "way",
      label: getLabel("wayType.title"),
      template: ({ way }) =>
        way == 0 ? getLabel("wayType.lxr") : getLabel("wayType.txl"),
      width: 180,
    },
    {
      prop: "callType",
      label: getLabel("callType.title"),
      template: (row) =>
        row.callType == 0 ? getLabel("callType.yuyin") : getLabel("callType.video"),
      width: 180,
    },
    {
      prop: "hangUpTime",
      label: getLabel("hangUpTime"),
      template: (row) => convertString(row.hangUpTime),
      width: 100,
    },
    {
      prop: "contactsUploadList",
      label: getLabel("contactsUploadList"),
      template: (row) => convertString(row.contactsUploadList),
      width: 180,
    },
    { prop: "num", label: getLabel("num"), width: 180 },
    { prop: "time", label: getLabel("time"), width: 180 },
    {
      prop: "randomMessage",
      label: getLabel("randomMessage"),
      width: 180,
    },
    { prop: "create_time", label: getLabel("create_time"), width: 180 },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: "150",
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
      way: (value) => Number(value),
    });

    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
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
      if (formData.way == 0) {
        if (formData.contactsUploadList == "") {
          /* "联系人不能为空" */
          setMessage("error", getLabel("wayType.lxr") + t(publicString + "empty"));
          return false;
        }
      }

      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//编辑表单前
function assignBefore(row) {
  formData.hangUpTime_start = row.hangUpTime.split(",")[0];
  formData.hangUpTime_end = row.hangUpTime.split(",")[1];
  formData.time_start = row.time.split(",")[0];
  formData.time_end = row.time.split(",")[1];
}

//提交前
function postBefore() {
  formData.hangUpTime = `${formData.hangUpTime_start},${formData.hangUpTime_end}`;
  formData.time = `${formData.time_start},${formData.time_end}`;
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
      <a-form-item :label="getLabel('wayType.title')">
        <a-radio-group v-model:value="formData.way" button-style="solid">
          <a-radio-button :value="0">
            {{ getLabel("wayType.lxr") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 手机号上传 -->
      <a-form-item :label="getLabel('contactsUploadList')" v-if="formData.way == 0">
        <UploadInput
          prop="contactsUploadList"
          :placeholder="getLabel('uploadTips1') + '\n' + getLabel('uploadTips2')"
        ></UploadInput>
      </a-form-item>

      <!-- 数量 -->
      <a-form-item :label="getLabel('num')">
        <a-input-number v-model:value="formData.num" :min="0" />
      </a-form-item>

      <!-- 时间间隔 -->
      <a-form-item :label="getLabel('time')">
        <a-input-number v-model:value="formData.time_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.time_end" :min="1" />
      </a-form-item>

      <!-- 随机信息 -->
      <a-form-item :label="getLabel('randomMessage')">
        <UploadInput prop="randomMessage"></UploadInput>
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
<style scoped ></style>
