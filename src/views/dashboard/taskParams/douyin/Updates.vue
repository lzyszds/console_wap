<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/update";

import { taskRun } from "@/api/task/run";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
} from "@/utils";

import UploadInput from "@/components/paramsform/UploadInput.vue";
import _ from "lodash";
import { douyin } from "@/utils/taskData";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.update.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "",
  type: "douyin",
  notes_name: "",
  update_value: [], //修改项
  name: "", //名称
  imagesContent: "", //头像
  bio: "", //bio
  sex: "1", //性别
  location: [], //地区
  birthday: "", //生日
  upload_content_arr: "", //上传内容
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const updateList = [
  //键值 为 1 是头像 2 昵称 3简介
  {
    label: t(textString + "tableHeader.imagesContent"),
    value: "1",
    key: "imagesContent",
  },
  { label: t(textString + "tableHeader.name"), value: "2", key: "name" },
  { label: t(textString + "tableHeader.bio"), value: "3", key: "bio" },
  { label: t(textString + "tableHeader.sex"), value: "4", key: "sex" },
  { label: t(textString + "tableHeader.birthday"), value: "5", key: "birthday" },
  { label: t(textString + "tableHeader.location"), value: "6", key: "location" },
];

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);

let listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "douyin",
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

const tableTitle = [
  { prop: "id", label: "ID"},
  {
    prop: "update_value",
    label: t(textString + "tableHeader.update_value"),
    template: (row) => {
      return row.update_value
        .split(",")
        .map((item) => {
          const findValue = updateList.find((_) => _.value == item);

          return findValue ? findValue.label : "";
        })
        .join(",");
    },
  },
  { prop: "imagesContent", type: "image", label: () => getLabel("imagesContent") },
  { prop: "name", label: () => getLabel("name") },
  { prop: "bio", label: () => getLabel("bio") },
  { prop: "sex", label: () => getLabel("sex") },
  { prop: "birthday", label: () => getLabel("birthday") },
  { prop: "location", label: () => getLabel("location") },
  { prop: "create_time", label: t(textString + "tableHeader.create_time"), width: 100 },
];

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  tableTitle,
  editParams,
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
      account_num: () => "2",
      resource_library_type: () => "2",
      avatar_type: () => "2",
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
  formData.location = row.location.split("-");
}

//提交前
function postBefore() {
  try {
    formData.imagesContent = formData.imagesContent.join(",");
  } catch (e) {}
  formData.location = formData.location.join("-");
  console.log(`lzy  formData.location:`, formData.location);
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
        if (item.key == "location") {
          for (let i = 0; i < formData.location.length; i++) {
            if (formData.location[i] == "") {
              setMessage("error", item.label + t(publicString + "empty"));
              return false;
            }
          }
        } else {
          if (formData[item.key] == "") {
            setMessage("error", item.label + t(publicString + "empty"));
            return false;
          }
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

const params = {
  platform: listQuery.platform,
  taskName: listQuery.taskName,
};

//启动任务
const handleTask = _.debounce(async (...arg) => {
  const [taskType, row] = arg;
  const data = await douyin[listQuery.taskName]({
    ...params,
    taskType,
    row,
  });
  taskRun({
    taskId: row.id,
    taskType,
    ...params,
    data,
  });
}, 300);
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <a-form-item
        :label="t(textString + 'tableHeader.update_value')"
        
        name="update_value"
      >
        <a-select
          v-model:value="formData.update_value"
          placeholder="请选择"
          mode="multiple"
          :options="updateList"
        />
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

      <a-form-item :label="t(textString + 'tableHeader.sex')" name="sex">
        <a-radio-group
          v-model:value="formData.sex"
          :disabled="!formData.update_value.includes('4')"
        >
          <a-radio value="1">男</a-radio>
          <a-radio value="2">女</a-radio>
          <a-radio value="3">不展示</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="t(textString + 'tableHeader.birthday')" name="birthday">
        <a-date-picker
          v-model:value="formData.birthday"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择日期"
          :disabled="!formData.update_value.includes('5')"
        />
      </a-form-item>

      <!-- 地区 -->
      <template v-show="formData.update_value.includes('6')">
        <a-form-item
          :label="
            t(textString + 'tableHeader.location') +
            '[' +
            t(textString + 'tableHeader.country') +
            ']'
          "
        >
          <a-input v-model:value="formData.location[0]" />
        </a-form-item>
        <a-form-item
          :label="
            t(textString + 'tableHeader.location') +
            '[' +
            t(textString + 'tableHeader.province') +
            ']'
          "
        >
          <a-input v-model:value="formData.location[1]" />
        </a-form-item>
        <a-form-item
          :label="
            t(textString + 'tableHeader.location') +
            '[' +
            t(textString + 'tableHeader.city') +
            ']'
          "
        >
          <a-input v-model:value="formData.location[2]" />
        </a-form-item>
      </template>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
