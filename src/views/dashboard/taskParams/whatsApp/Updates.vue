<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/whatsApp/update";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";
import { message } from "ant-design-vue";
import _ from "lodash";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.whatsapp.children.update.";

const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "", //id
  type: "whatsApp", //平台
  notes_name: "", //分组
  device_number_arr: "", //设备
  update_value: [], //修改项
  upload_content_arr: "", //上传内容
  regulation: "0", //规则
  imagesContent: "", //头像
  name: "", //名称
  userStatus: "", //状态
  pwdVerify: "", //密码验证
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);
const updateList = [
  { label: getLabel("updateList.upload_content_arr"), value: "1" },
  { label: getLabel("updateList.name"), value: "2" },
  { label: getLabel("updateList.userStatus"), value: "3" },
  { label: getLabel("updateList.pwdVerify"), value: "4" },
];

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);
let listLoading = ref(false); //任务列表加载状态

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "whatsApp",
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
    { prop: "notes_name", label: () => getLabel("notes_name") },
    {
      prop: "update_value",
      label: getLabel("update_value"),
      template: (row) => {
        return row.update_value
          .split(",")
          .map((res) => {
            return updateList.find((item) => item.value == res).label;
          })
          .toString();
      },
    },
    {
      prop: "upload_content_arr",
      label: getLabel("updateList.upload_content_arr"),
    },
    { prop: "name", label: getLabel("updateList.name") },
    {
      prop: "userStatus",
      label: getLabel("updateList.userStatus"),
    },
    {
      prop: "pwdVerify",
      label: getLabel("updateList.pwdVerify"),
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
function getTableData() {
  getTaskListDataFn(getDataList, listQuery).then((res) => {
    if (res != null) {
      renwuList.value = res.list;
      listQuery.total = Number(res.total);
    } else {
      renwuList.value = [];
    }
    listLoading.value = false;
  });
}

getTableData();

//弹窗操作
const handleCreate = async (act, row) => {
  action.value = act;
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      update_value: (value) => value.split(","),
    });

    formData.upload_content_arr = row.upload_content_arr.split(",");
  }
  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  try {
    formData.upload_content_arr = formData.imagesContent.join(",");
  } catch (e) {
    formData.upload_content_arr = formData.imagesContent;
  }
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
    message.error(getLabel("update_value") + t(publicString + "message.empty"));
    return false;
  } else {
    updateList.forEach((item) => {
      if (update_value.includes(item.value)) {
        if (formData[item.key] == "") {
          message.error(getLabel(item.key) + t(publicString + "message.empty"));
          return false;
        }
      }
    });
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
      <!-- 更新项 -->
      <a-form-item :label="getLabel('update_value')" >
        <a-select
          v-model:value="formData.update_value"
          placeholder="请选择"
          mode="multiple"
        >
          <a-select-option
            v-for="item in updateList"
            :key="item.label"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 头像 -->

      <a-form-item :label="getLabel('updateList.upload_content_arr')">
        <ImageSelect
          prop="imagesContent"
          :disabled="!formData.update_value.includes('1')"
        ></ImageSelect>
      </a-form-item>

      <!-- 名称 -->
      <a-form-item
        :label="getLabel('updateList.name')"
        
        v-if="formData.update_value.includes('2')"
      >
        <a-input v-model:value="formData.name" />
      </a-form-item>

      <!-- 用户状态 -->
      <a-form-item
        :label="getLabel('updateList.userStatus')"
        
        v-if="formData.update_value.includes('3')"
      >
        <a-input v-model:value="formData.userStatus" />
      </a-form-item>

      <!-- 密码验证 -->
      <a-form-item
        :label="getLabel('updateList.pwdVerify')"
        
        v-if="formData.update_value.includes('4')"
      >
        <a-input v-model:value="formData.pwdVerify" />
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
