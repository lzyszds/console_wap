<script setup>

import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/update";

import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.tiktok.children.update.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  type: "tiktok",
  notes_name: "",
  update_value: [],
  imagesContent: "",
  account_num: "2",
  resource_library_type: "2",
  avatar_type: "2",
  name: "",
  bio: "",
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const updateList = [
  //键值 为 1 是头像 2 昵称 3简介
  { label: getLabel("imagesContent"), value: "1", key: "imagesContent" },
  { label: getLabel("name"), value: "2", key: "name" },
  { label: getLabel("bio"), value: "3", key: "bio" },
];

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "tiktok",
  taskName: "update",
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
      prop: "update_value",
      label: () => getLabel("update_value"),
      template: (row) => {
        return row.update_value
          .split(",")
          .map((item) => {
            return updateList.find((_) => _.value == item).label;
          })
          .join(",");
      },
    },
    { prop: "imagesContent", type: "image", label: () => getLabel("imagesContent") },
    { prop: "name", label: () => getLabel("name") },
    { prop: "bio", label: () => getLabel("bio") },
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
      update_value: (value) => value.split(","),
    });
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    checkParameter,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

function checkParameter() {
  const update_value = formData.update_value;
  console.log(update_value);

  if (update_value.length == 0) {
    message.error(getLabel("update_value") + t(publicString + "empty"));
    return false;
  } else {
    for (const item of updateList) {
      if (update_value.includes(item.value)) {
        if (formData[item.key] == "") {
          message.error(item.label + t(publicString + "empty"));
          return false;
        }
      }
    }
  }
  return true;
}

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);
</script>

<template>
  <ListCard></ListCard>
  <RecordPop>
    <template #listForm>
      <!-- 更新项 -->
      <a-form-item :label="getLabel('update_value')">
        <a-select
          v-model:value="formData.update_value"
          mode="multiple"
          :max-tag-count="2"
          :options="updateList"
        >
        </a-select>
      </a-form-item>
      <!-- 头像 -->
      <a-form-item :label="getLabel('imagesContent')">
        <ImageSelect
          prop="imagesContent"
          :disabled="!formData.update_value.includes('1')"
        ></ImageSelect>
      </a-form-item>
      <!-- 昵称 -->
      <a-form-item :label="getLabel('name')">
        <AInput
          v-model:value="formData.name"
          :disabled="!formData.update_value.includes('2')"
        />
      </a-form-item>
      <!-- 简介 -->
      <a-form-item :label="getLabel('bio')">
        <AInput
          v-model:value="formData.bio"
          :disabled="!formData.update_value.includes('3')"
        />
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
