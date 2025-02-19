<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/line/post";
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
const textString = "navigation.dashboard.taskParams.line.children.post.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  type: "line",
  notes_name: "",
  upload_type: "0", //上传类型
  upload_content_arr: "", //文件实际内容
  videoContent: "",
  imagesContent: [], //多图片上传
  title: "", //帖子标题
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
  platform: "line",
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
      label: t(textString + "tableHeader.upload_content_arr"),
      type: "image/video",
    },
    {
      prop: "title",
      label: t(textString + "tableHeader.title"),
      template: (row) => convertString(row.title),
      width: 180,
    },
    {
      prop: "status",
      label: t(textString + "tableHeader.status"),
      width: 180,
      platformTask: "line_releaseTask",
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
    });

    if (row.upload_type == "1") {
      formData.imagesContent = row.upload_content_arr.split(",");
    } else {
      formData.videoContent = row.upload_content_arr;
    }
  }
  dialogFormVisible.value = true;
};

const isCondition = ["upload_content_arr", "title", "upload_type"];
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
    checkParameter: ({ checkWhole }) => {
      for (let i = 0; i < isCondition.length; i++) {
        checkWhole(isCondition[i], t(textString + "tableHeader" + isCondition[i]));
      }
      return true;
    },
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
          <a-radio-button value="0">{{ getLabel("video") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("image") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 上传内容 -->
      <a-form-item :label="getLabel('upload_content_arr')">
        <ImageSelect
          prop="imagesContent"
          v-if="formData.upload_type == '1'"
          isMultiple
        ></ImageSelect>
        <VideoSelect prop="videoContent" v-else></VideoSelect>
      </a-form-item>

      <!-- 标题 -->
      <a-form-item :label="getLabel('title')">
        <a-input v-model:value="formData.title" />
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
