<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/instagram/message";
import UploadInput from "@/components/paramsform/UploadInput.vue";
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
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.instagram.children.message.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

const defaultFormData = {
  id: "",
  notes_name: "",
  device_number_arr: "",
  regulation: "0", //规则
  chatType: "0", // 0: 账号，1：粉丝，2：关注
  cententType: "0", // 0:文本，1:图文
  text: "", //文本消息
  imagesContent: "", //图片内容
  upload_content_arr: "", //上传内容

  accounts: "", //账号
  chatNumber: [1, 6], //私信数量
  chatNumber_start: 1,
  chatNumber_end: 6,
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
  platform: "instagram",
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
    { prop: "id", label: "ID", width: 80 },
    {
      prop: "chatType",
      label: getLabel("chatType.title"),
      width: 120,
      template: (row) => {
        return row.chatType == 0
          ? getLabel("chatType.account")
          : row.chatType == 1
          ? getLabel("chatType.fans")
          : getLabel("chatType.follow");
      },
    },
    {
      prop: "cententType",
      label: getLabel("cententType.title"),
      width: 120,
      template: (row) => {
        return row.chatType == 0
          ? getLabel("cententType.text")
          : getLabel("cententType.text_image");
      },
    },
    {
      prop: "chatNumber",
      label: getLabel("chatNumber"),
      width: 120,
      template: (row) => convertString(row.chatNumber),
    },
    {
      prop: "accounts",
      label: getLabel("accounts"),
      width: 120,
      template: (row) => convertString(row.accounts),
    },
    {
      prop: "imagesContent",
      label: getLabel("imagesContent"),
      type: "image",
      
    },
    {
      prop: "text",
      label: getLabel("msgChat"),
      template: (row) => convertString(row.text),
    },
    { prop: "create_time", label: getLabel("create_time"), width: 180 },
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
    });
  }
  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    checkParameter: () => {
      return true;
    },
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
    formData.device_number_arr = [];
  });
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 私信类型 -->
      <a-form-item :label="getLabel('chatType.title')">
        <a-radio-group v-model:value="formData.chatType" button-style="solid">
          <a-radio-button value="0">{{ getLabel("chatType.account") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("chatType.fans") }}</a-radio-button>
          <a-radio-button value="2">{{ getLabel("chatType.follow") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 私信规则 -->
      <a-form-item :label="getLabel('cententType.title')">
        <a-radio-group v-model:value="formData.cententType" button-style="solid">
          <a-radio-button value="0">{{ getLabel("cententType.text") }}</a-radio-button>
          <a-radio-button value="1">{{
            getLabel("cententType.text_image")
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 私信内容 -->
      <a-form-item :label="getLabel('msgChat')">
        <a-textarea v-model:value="formData.text" />
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('imagesContent')" v-if="formData.cententType == 1">
        <ImageSelect prop="imagesContent"></ImageSelect>
      </a-form-item>

      <!-- 私信数量 -->
      <a-form-item :label="getLabel('chatNumber')" v-if="formData.chatType != 0">
        <a-input-number v-model:value="formData.chatNumber_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.chatNumber_end" :min="1" />
      </a-form-item>

      <!-- 账号 -->
      <a-form-item :label="getLabel('accounts')" v-else>
        <UploadInput prop="accounts" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
