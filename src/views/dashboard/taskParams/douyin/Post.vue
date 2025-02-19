<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/post";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
  checkParameterBefore,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.post.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  type: "douyin",
  notes_name: "",
  upload_type: "0",
  upload_content_arr: "",
  videoContent: "",
  imagesContent: [], //多图片上传 暂时用单图片
  title: "", //帖子标题
  topic: "", //帖子话题
  call_who: "", //帖子@谁
  address: "", //输入地点
  regulation: "0", //规则
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
  platform: "douyin",
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
    { prop: "id", label: "ID" },
    {
      prop: "upload_content_arr",
      label: () => getLabel("upload_content_arr"),
      type: "image/video",
    },
    {
      prop: "title",
      label: () => getLabel("title"),
      template: (row) => convertString(row.title),
    },
    {
      prop: "topic",
      label: () => getLabel("topic"),
      template: (row) => convertString(row.topic),
    },
    {
      prop: "call_who",
      label: () => getLabel("call_who"),
      template: (row) => convertString(row.call_who),
    },
    {
      prop: "address",
      label: () => getLabel("address"),
      template: (row) => convertString(row.address),
    },
    { prop: "create_time", label: () => getLabel("create_time") },
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
    if (row.upload_type == "1") {
      formData.imagesContent = row.upload_content_arr.split(",");
    } else {
      formData.videoContent = row.upload_content_arr;
    }
  }

  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  //提交之前数据处理
  postBefore();
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () =>
      checkParameterBefore(formData, ["upload_content_arr", "title", "topic"]),
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//提交之前数据处理
function postBefore() {
  //需要转换的数据
  if (formData.upload_type == "1") {
    formData.upload_content_arr = formData.imagesContent.join(",");
  } else {
    formData.upload_content_arr = formData.videoContent;
  }
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
      <!-- 养号方式 -->
      <a-form-item :label="getLabel('upload_type')">
        <a-radio-group v-model:value="formData.upload_type" button-style="solid">
          <a-radio-button value="0">{{ getLabel("upload_type_list.0") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("upload_type_list.1") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('upload_content_arr')">
        <ImageSelect
          prop="imagesContent"
          v-if="formData.upload_type == '1'"
          is-multiple
        ></ImageSelect>
        <VideoSelect prop="videoContent" v-else></VideoSelect>
      </a-form-item>

      <!-- 标题 -->
      <a-form-item :label="getLabel('title')">
        <a-input v-model:value="formData.title" />
      </a-form-item>

      <!-- 话题 -->
      <a-form-item :label="getLabel('topic')">
        <a-input v-model:value="formData.topic" :placeholder="getLabel('topic_tips')" />
      </a-form-item>

      <!-- @ 谁 -->
      <a-form-item :label="getLabel('call_who')">
        <a-input
          v-model:value="formData.call_who"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 地址 -->
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
<style scoped></style>
