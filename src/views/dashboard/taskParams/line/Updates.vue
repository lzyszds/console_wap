<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/line/update";
import _ from "lodash";
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
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.line.children.update.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  type: "line",
  notes_name: "", //参数名称
  regulation: "0", //规则
  update_value: [], //修改项
  name: "", //名称
  imagesContent: "", //头像
  bio: "", //个性签名
  upload_content_arr: "", //上传内容
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

//键值 为 1 是头像 2 昵称 3简介
const updateList = [
  {
    label: t(textString + "tableHeader.imagesContent"),
    value: "1",
    key: "imagesContent",
  },
  { label: t(textString + "tableHeader.name"), value: "2", key: "name" },
  { label: "bio", value: "3", key: "bio" },
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
  platform: "line",
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
      label: t(textString + "tableHeader.update_value"),
      template: (row) => {
        return row.update_value.split(",").map((item) => {
          return updateList.find((_) => _.value == item).label;
        });
      },
      width: 180,
    },
    {
      prop: "regulation",
      label: t(textString + "tableHeader.regulation"),
      width: 180,
      template: (row) =>
        row.regulation == "0"
          ? t(textString + "tableHeader.whole")
          : t(textString + "tableHeader.order"),
    },
    {
      prop: "imagesContent",
      label: t(textString + "tableHeader.imagesContent"),
      width: 180,
    },
    { prop: "name", label: t(textString + "tableHeader.name"), width: 180 },
    { prop: "bio", label: t(textString + "tableHeader.bio"), width: 180 },
    {
      prop: "status",
      label: t(textString + "tableHeader.status"),
      width: 180,
      platformTask: "line_update",
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
      update_value: (value) => value.split(","),
    });
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    checkParameter,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//编辑表单前
function assignBefore(row) {
  formData.imagesContent = row.imagesContent.split(",");
  formData.upload_content_arr = row.imagesContent;
}

//提交前
function postBefore() {
  try {
    formData.imagesContent = formData.imagesContent.join(",");
  } catch (e) {}
}

function checkParameter() {
  const update_value = formData.update_value;

  if (update_value.length == 0) {
    setMessage(
      "error",
      t(textString + "tableHeader.update_value") + t(publicString + "empty")
    );
    return false;
  } else {
    for (let item of updateList) {
      if (update_value.includes(item.value)) {
        if (formData[item.key] == "") {
          setMessage("error", item.label + t(publicString + "empty"));
          return false;
        }
      }
    }
  }
  postBefore();
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
      <a-form-item :label="t(textString + 'tableHeader.update_value')">
        <a-select
          v-model:value="formData.update_value"
          placeholder="请选择"
          mode="multiple"
        >
          <a-select-option
            v-for="item in updateList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- 头像 -->
      <a-form-item :label="getLabel('imagesContent')">
        <ImageSelect
          prop="imagesContent"
          :disabled="!formData.update_value.includes('1')"
        ></ImageSelect>
      </a-form-item>
      <!-- 名称 -->
      <a-form-item
        :label="t(textString + 'tableHeader.name')"
        v-if="formData.update_value.includes('2')"
      >
        <a-input v-model:value="formData.name" placeholder="请输入名称" />
      </a-form-item>
      <!-- 简介 -->
      <a-form-item
        class="bloggerID"
        :label="t(textString + 'tableHeader.bio')"
        v-if="formData.update_value.includes('3')"
      >
        <div class="idsItem">
          <a-textarea v-model:value="formData.bio" />
        </div>
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
