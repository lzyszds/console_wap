<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/snapchat/post";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";
import UploadInput from "@/components/paramsform/UploadInput";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.snapchat.children.post.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  notes_name: "",
  device_number_arr: "",
  wayType: "gs", // 发帖类型 gs是故事 jgd是聚光灯
  upload_content_arr: "",
  videoContent: "", //媒体内容
  mediaSuffic: "", //媒体后缀
  txt: "", //文本内容
  isAddMusic: 0, //是否添加音乐
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
  taskName: "releaseTask",
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
      prop: "wayType",
      label: t(textString + "tableHeader.wayType.title"),
      width: 180,
      template: (row) =>
        row.wayType == "gs"
          ? t(textString + "tableHeader.wayType.gs")
          : t(textString + "tableHeader.wayType.jgd"),
    },
    {
      prop: "videoContent",
      label: t(textString + "tableHeader.videoContent"),
      type: "video",
    },
    { prop: "mediaSuffic", label: t(textString + "tableHeader.mediaSuffic"), width: 180 },
    { prop: "txt", label: t(textString + "tableHeader.txt"), width: 180 },
    {
      prop: "isAddMusic",
      label: t(textString + "tableHeader.isAddMusic.title"),
      width: 180,
      template: (row) =>
        row.isAddMusic == 0
          ? t(textString + "tableHeader.isAddMusic.yes")
          : t(textString + "tableHeader.isAddMusic.no"),
    },
    {
      prop: "status",
      label: t(textString + "tableHeader.status"),
      width: 180,
      platformTask: "snapchat_releaseTask",
    },
    { prop: "create_time", label: t(textString + "tableHeader.create_time"), width: 180 },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: "110",
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
    formData.upload_content_arr = formData.videoContent;
  }

  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  formData.mediaSuffic = formData.videoContent.split(".").pop();

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
      <!-- 养号方式 -->
      <a-form-item :label="t(textString + 'tableHeader.wayType.title')">
        <a-radio-group v-model:value="formData.wayType" button-style="solid">
          <a-radio-button value="gs">{{
            t(textString + "tableHeader.wayType.gs")
          }}</a-radio-button>
          <a-radio-button value="jgd">{{
            t(textString + "tableHeader.wayType.jgd")
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('videoContent')">
        <VideoSelect prop="videoContent"></VideoSelect>
      </a-form-item>

      <!-- 文本内容 -->
      <a-form-item :label="t(textString + 'tableHeader.txt')">
        <UploadInput prop="txt" />
      </a-form-item>

      <!-- 是否添加音乐 -->
      <a-form-item :label="t(textString + 'tableHeader.isAddMusic.title')">
        <a-radio-group v-model:value="formData.isAddMusic" button-style="solid">
          <a-radio-button :value="0">
            {{ t(textString + "tableHeader.isAddMusic.yes") }}
          </a-radio-button>
          <a-radio-button :value="1">
            {{ t(textString + "tableHeader.isAddMusic.no") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
