<script setup>
import { ref, reactive, provide } from "vue";
import { addData, editData, getDataList, deleteData } from "@/api/task/instagram/update";
import _ from "lodash";
import UploadInput from "@/components/paramsform/UploadInput.vue";

import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.instagram.children.update.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

const defaultFormData = {
  id: "",
  notes_name: "",
  update_value: [], //修改项
  regulation: "0",
  realName: "", //真实姓名
  imagesContent: "", //头像
  upload_content_arr: "", //上传内容
  gender: "male", // 性别（格式：male-男性，female-女性，unspecified-不想回答）
  bio: "", //简介 不超过150个字
  links: "", //网站网址
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);
const updateList = [
  { label: getLabel("realName"), value: 1, key: "realName" },
  { label: getLabel("bio"), value: 2, key: "bio" },
  { label: getLabel("gender.title"), value: 3, key: "gender" },
  { label: getLabel("imagesContent"), value: 4, key: "imagesContent" },
  { label: getLabel("links"), value: 5, key: "links" },
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
  platform: "instagram",
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
    { prop: "id", label: "ID", width: 80 },
    {
      prop: "update_value",
      label: getLabel("update_value"),
      template: (row) => {
        return JSON.parse(row.update_value).map((item) => {
          return updateList.find((_) => _.value == item).label;
        }).join(",");
      },
    },
    {
      prop: "imagesContent",
      label: getLabel("imagesContent"),
      type: "image",
    },
    { prop: "realName", label: getLabel("realName")  },
    { prop: "bio", label: "bio" },
    {
      prop: "gender",
      label: getLabel("gender.title"),
    },
    {
      prop: "links",
      label: getLabel("links"),
    },

    { prop: "create_time", label: getLabel("create_time")  },
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
      update_value: (value) => JSON.parse(value),
    });
    formData.upload_content_arr = row.imagesContent.split(",");
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  try {
    formData.imagesContent = formData.imagesContent.join(",");
  } catch (e) {}

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

  if (update_value.length == 0) {
    setMessage("warning", getLabel("update_value") + " " + t(publicString + "empty"));
    return false;
  } else {
    for (let i = 0; i < update_value.length; i++) {
      const item = updateList[i];
      if (update_value.includes(item.value)) {
        if (formData[item.key] == "") {
          setMessage("warning", t(item.label) + " " + t(publicString + "empty"));
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
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 修改项 -->
      <a-form-item :label="getLabel('update_value')">
        <a-select v-model:value="formData.update_value" mode="multiple">
          <a-select-option
            v-for="item in updateList"
            :key="item.label"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 真实姓名 -->
      <a-form-item :label="getLabel('realName')" v-if="formData.update_value.includes(1)">
        <AInput v-model:value="formData.realName" />
      </a-form-item>

      <!-- 简介 -->
      <a-form-item :label="getLabel('bio')" v-if="formData.update_value.includes(2)">
        <AInput v-model:value="formData.bio" />
      </a-form-item>

      <!-- 性别 -->
      <a-form-item
        :label="getLabel('gender.title')"
        v-if="formData.update_value.includes(3)"
      >
        <a-radio-group v-model:value="formData.gender" button-style="solid">
          <a-radio-button value="male">{{ getLabel("gender.male") }}</a-radio-button>
          <a-radio-button value="female">{{ getLabel("gender.female") }}</a-radio-button>
          <a-radio-button value="unspecified">
            {{ getLabel("gender.unspecified") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 头像 -->
      <a-form-item :label="getLabel('imagesContent')">
        <ImageSelect
          prop="imagesContent"
          :disabled="!formData.update_value.includes(4)"
        ></ImageSelect>
      </a-form-item>

      <!-- 链接 -->
      <a-form-item :label="getLabel('links')" v-if="formData.update_value.includes(5)">
        <AInput v-model:value="formData.links" />
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
