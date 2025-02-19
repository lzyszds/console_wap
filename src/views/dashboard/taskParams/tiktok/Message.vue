<script setup>
import { taskRun } from "@/api/task/run";
import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/message";
import _ from "lodash";
import { tiktok } from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.tiktok.children.message.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "", //id
  notes_name: "", //备注
  type: "tiktok", //应用平台类型
  message_num: 10, //私信数量
  message_content: "", //私信内容
  message_time: 10, //间隔时间
  duration_stay_start: 5, //间隔时间 开始
  duration_stay_end: 10, //间隔时间 结束
  is_repeat: 0, //是否重复
  private_message: "", //私信人（朋友、关注、粉丝）
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
let renwuList = ref([]); //分组列表

let listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "tiktok",
  taskName: "message",
  grouping_name: "",
  keyword: "",
});
const editParams = [
  {
    label: () => t(btnString + "addTask"),
    icon: "mage:plus",
    callback: () => handleCreate("add"),
    type: "add",
  },
  {
    label: () => t(btnString + "edit"),
    icon: "iconamoon:edit-light",
    callback: (item) => handleCreate("edit", item),
  },
  {
    label: () => t(btnString + "deleteTask"),
    icon: "iconamoon:trash-light",
    callback: (item) => handleDelFn.call(this, [item], deleteData, getTableData),
    type: "delete",
  },
];

const tableTitle = [
  { prop: "id", label: "ID"},
  { prop: "message_num", label: () => getLabel("message_num"), width: 100 },
  {
    prop: "message_content",
    label: () => getLabel("message_content"),
    template: (row) => convertString(row.message_content),
  },
  { prop: "message_time", label: () => getLabel("message_time"), width: 100 },
  {
    prop: "private_message",
    label: () => getLabel("private_message"),
    width: 100,
    template: (row) => {
      return row.private_message == 0 ? getLabel("private_message_list.0") : "";
    },
  },
  { prop: "create_time", label: () => getLabel("create_time") },
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
async function getTableData() {
  const res = await getTaskListDataFn(getDataList, listQuery);
  if (res != null) {
    renwuList.value = res.list;
    listQuery.total = Number(res.total);
  } else {
    renwuList.value = [];
  }
}

getTableData();

const handleCreate = async (act, row) => {
  action.value = act;
  dialogFormVisible.value = true;
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    //将每个值转换成响应的value 用于表单赋值
    assignFormData(row, {
      private_message: (value) => value + "",
      //字符串数据转换成数组，如果转换失败则返回原数据
      message_content: (value) => {
        try {
          return value.indexOf("[") == 0 ? JSON.parse(value) : value;
        } catch (e) {
          return value;
        }
      },
    });
    formData.duration_stay_start = row.message_time.split(",")[0];
    formData.duration_stay_end = row.message_time.split(",")[1];
  }
};

const onSubmit = async () => {
  formData.message_time = [formData.duration_stay_start, formData.duration_stay_end].join(
    ","
  );
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      return true;
      // return checkParameterBefore(formData, ["message_content"]);
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

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
  const data = await tiktok[listQuery.taskName]({
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
      <a-form-item label="私信人">
        <a-select
          v-model:value="formData.private_message"
          placeholder="请选择"
          :options="[{ label: getLabel('private_message_list.0'), value: '0' }]"
        >
        </a-select>
      </a-form-item>
      <a-form-item label="私信内容">
        <a-textarea
          v-model:value="formData.message_content"
          show-count
          :maxlength="300"
        />
      </a-form-item>
      <a-form-item label="私信数量">
        <a-input v-model:value="formData.message_num" />
      </a-form-item>
      <a-form-item label="间隔时长/秒">
        <a-input-number v-model:value="formData.duration_stay_start" min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" min="1" />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
    </template>
  </RecordPop>
</template>
<style scoped></style>
