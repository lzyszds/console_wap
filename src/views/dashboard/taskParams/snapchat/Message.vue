<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/snapchat/message";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.snapchat.children.message.";

const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "",
  notes_name: "",
  device_number_arr: "",
  chatNumber: 0, //私信数量
  chatType: "0", // 0:文本，1:图片 2:图文
  text: "", //文本消息
  imagesContent: "", //图片内容
  upload_content_arr: "",
  duration_interval: [6, 10], //间隔时间
  duration_interval_start: 6,
  duration_interval_end: 10,
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
  platform: "snapchat",
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
      prop: "chatNumber",
      label: getLabel("chatNumber"),
    },
    {
      prop: "imagesContent",
      label: getLabel("imagesContent"),
    },
    { prop: "text", label: getLabel("msgChat") },

    { prop: "create_time", label: getLabel("create_time") },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: "160",
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

    formData.duration_interval_start = Number(formData.duration_interval.split(",")[0]);
    formData.duration_interval_end = Number(formData.duration_interval.split(",")[1]);
  }
  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  formData.duration_interval = [
    formData.duration_interval_start,
    formData.duration_interval_end,
  ].join(",");

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
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 聊天类型 -->
      <a-form-item :label="getLabel('chatType.title')">
        <a-radio-group v-model:value="formData.chatType" button-style="solid">
          <a-radio-button value="0">{{ getLabel("chatType.text") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("chatType.image") }}</a-radio-button>
          <a-radio-button value="2">{{ getLabel("chatType.text_image") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 文本内容 -->
      <a-form-item :label="getLabel('msgChat')" v-if="formData.chatType != 1">
        <UploadInput prop="text" />
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('imagesContent')" v-if="formData.chatType != 0">
        <ImageSelect prop="imagesContent"></ImageSelect>
      </a-form-item>

      <a-form-item :label="getLabel('chatNumber')">
        <a-input-number v-model:value="formData.chatNumber" :min="1" />
      </a-form-item>

      <a-form-item :label="getLabel('duration_interval')">
        <a-input-number v-model:value="formData.duration_interval_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_interval_end" :min="1" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
