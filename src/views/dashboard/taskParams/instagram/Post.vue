<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/instagram/post";
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
const textString = "navigation.dashboard.taskParams.instagram.children.post.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

const defaultFormData = {
  id: "",
  notes_name: "",
  device_number_arr: "",
  regulation: "0", //规则
  wayType: "image", // 发帖类型  image是图片 video是视频
  videoContent: "", //媒体内容
  imagesContent: "", //图片内容
  mediaSuffic: "", //媒体后缀
  upload_content_arr: "", //上传内容
  txt: "", //文本内容
  address: "", //地址
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
    { prop: "id", label: "ID", width: 80 },
    {
      prop: "wayType",
      label: getLabel("wayType.title"),
      template: (row) => {
        if (row.wayType == "video") {
          return getLabel("wayType.video");
        } else {
          return getLabel("wayType.image");
        }
      },
    },
    {
      prop: "upload_content_arr",
      label: getLabel("videoContent"),
      type: "image/video",
    },
    {
      prop: "txt",
      label: getLabel("txt"),
      template: (row) => convertString(row.txt),
    },
    {
      prop: "address",
      label: getLabel("address"),
      template: (row) => convertString(row.address),
    },
    { prop: "create_time", label: getLabel("create_time"), getLabel },
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
    if (row.upload_type == "image") {
      formData.imagesContent = row.upload_content_arr.split(",");
    } else {
      formData.videoContent = row.upload_content_arr;
    }
  }
  dialogFormVisible.value = true;
};

//提交之前数据处理
function postBefore() {
  //转换上传内容参数
  if (formData.wayType == "video") {
    formData.upload_content_arr = formData.videoContent;
  } else {
    formData.upload_content_arr = formData.imagesContent;
  }
}

//提交表单
const onSubmit = async () => {
  //提交之前数据处理
  postBefore();
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    // checkParameter: () =>
    //   checkParameterBefore(formData, ["upload_content_arr", "txt", "address"]),
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
      <a-form-item :label="getLabel('wayType.title')">
        <a-radio-group v-model:value="formData.wayType" button-style="solid">
          <a-radio-button value="video">{{ getLabel("wayType.video") }}</a-radio-button>
          <a-radio-button value="image">{{ getLabel("wayType.image") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('videoContent')">
        <ImageSelect
          prop="imagesContent"
          v-if="formData.wayType == 'image'"
        ></ImageSelect>
        <VideoSelect prop="videoContent" v-else></VideoSelect>
      </a-form-item>

      <!--  -->
      <a-form-item :label="getLabel('txt')">
        <a-textarea v-model:value="formData.txt" />
      </a-form-item>

      <a-form-item :label="getLabel('address')">
        <a-input v-model:value="formData.address" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
