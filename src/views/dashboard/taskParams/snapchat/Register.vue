<script setup>
import { ref, reactive, watch, provide } from "vue";
import { getHuaShuTypeList } from "@/api/task/tiktok/huashu";
import { addData, editData, getDataList, deleteData } from "@/api/task/snapchat/yanghao";
import { ElInputNumber, ElMessage } from "element-plus";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  getHuaShuTypeListUtils,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";

import _ from "lodash";
import { taskRun } from "@/api/task/run";
import { snapchat} from "@/utils/taskData";

import Table from "@/components/Table";
import Dialog from "@/components/Dialog";
import { taskRun } from "@/api/task/run";
import UploadInput from "@/components/UploadInput";

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "", //id
  type: "snapchat", //平台
  notes_name: "", // 分组
  device_number_arr: "", //设备
  wayType: 0, // 养号类型
  friendPhone: "", // 好友手机号
  wsGroupName: "", // 设置群名称
  chatDuration: 0, // 聊天时长
  chatInterva: 0, // 聊天间隔时间/秒
  romdomMessage: "", // 随机信息
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const rowArr = ref([]);
const huashuList = ref([]);
const renwuList = ref([]);
const listLoading = ref(false);

const listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "snapchat",
  taskName: "yanghao",
  grouping_name: "",
  keyword: "",
});

const tableTitle = [
  { prop: "id", label: "ID"},
  { prop: "notes_name", label: () => getLabel("notes_name") },
  // {
  //   prop: "wayType",
  //   label: "养号类型",
  //   template: (row) => {
  //     return row.wayType == 0 ? "好友对话" : "群组对话";
  //   },
  // },
  // { prop: "friendPhone", label: "好友手机号", width: 100 },
  // { prop: "wsGroupName", label: "设置群名称", width: 100 },
  // { prop: "chatDuration", label: "聊天时长/秒", width: 100 },
  // { prop: "chatInterva", label: "聊天间隔/秒", width: 100 },
  // { prop: "romdomMessage", label: "随机信息" },
  { prop: "status", label: "任务状态", width: 100, platformTask: "snapchat_yanghao" },
  { prop: "create_time", label: "创建时间", width: 100 },
];

provide("tableConfig", {
  listQuery,
  tableData: renwuList,
  getTableData,
  tableTitle,
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: 110,
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

//获取话术类型
async function handleGetHuaShuTypeList() {
  huashuList.value = await getHuaShuTypeListUtils(getHuaShuTypeList);
}

const handleCreate = async (act, row) => {
  action.value = act;
  await handleGetHuaShuTypeList();
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      script_type: () => Number(row.script_type),
      device_number_arr: (value) => value.split(","),
    });
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  const { bloggerId, ...form } = formData;
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: Object.assign({}, form, form.wayType == 1 ? { bloggerId } : {}),
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//生成随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//任务数据 根据预加载进程中的数据格式进行修改
const taskData = async (row) => {
  return {
    wayType: row.wayType, // 养号类型
    friendPhone: row.friendPhone.replaceAll(/[\r\n]/g, ""), // 好友手机号
    wsGroupName: row.wsGroupName, // 设置群名称
    chatDuration: row.chatDuration, // 聊天时长
    chatInterva: row.chatInterva, // 聊天间隔时间/秒
    romdomMessage: row.romdomMessage.replaceAll(/[\r\n]/g, ""), // 随机信息
  };
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);

const params = {
  platform: listQuery.platform,
  taskName: listQuery.taskName,
  taskData,
};



//启动任务
const handleTask = _.debounce(async (...arg) => {
  const [taskType, row] = arg;
  const data = await snapchat[listQuery.taskName]({
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

watch(
  () => formData.bloggerId,
  (newVal, oldVal) => {
    if (!newVal) return;
    //博主最多200个
    const arr = newVal.split(",");
    if (arr.length > 200) {
      ElMessage.warning({ message: "博主最多200个", plain: true });
      formData.bloggerId = arr.slice(0, 200).join(",");
    }
  }
);
</script>

<template>
  <!--当前页面标识-->
  <input type="hidden" id="platform" value="snapchat" />
  <input type="hidden" id="taskName" value="yanghao" />

  <Table @handleSelChange="(val) => (rowArr = val)">
    <template #taskButtonList>
      <ElButton type="primary" @click="handleCreate('add')"> 添加任务 </ElButton>
      <ElButton @click="handleDel()" :type="rowArr.length ? 'danger' : 'info'">
        删除任务
      </ElButton>
      <ElButton @click="allStop()" :type="rowArr.length ? 'danger' : 'info'">
        一键停止
      </ElButton>
    </template>
    <template #operation="scope">
      <ElButton type="primary" @click="handleTask('startUp', scope.row)">启动</ElButton>
      <ElButton type="danger" @click="handleTask('stop', scope.row)"> 停止 </ElButton>
      <ElButton type="primary" @click="handleCreate('edit', scope.row)">修改</ElButton>
    </template>
  </Table>

  <Dialog>
    <template #dialogFormItem>
      <ElFormItem label="系统养号" >
        <ElRadioGroup v-model="formData.wayType">
          <ElRadioButton value="0">好友对话</ElRadioButton>
          <ElRadioButton value="1">群组对话</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <UploadInput
        label="好友手机号"
        prop="friendPhone"
        v-if="formData.wayType == 0"
      ></UploadInput>

      <ElFormItem label="设置群名称"  v-if="formData.wayType == 1">
        <ElInput v-model="formData.wsGroupName" />
      </ElFormItem>
      <ElFormItem label="聊天时长/秒" >
        <ElInputNumber v-model="formData.chatDuration" min="0" />
      </ElFormItem>
      <ElFormItem label="聊天间隔/秒" >
        <ElInputNumber v-model="formData.chatInterva" min="0" />
      </ElFormItem>

      <UploadInput label="随机信息" prop="romdomMessage"></UploadInput>
    </template>

    <template #dialogFooterBtn>
      <ElButton @click="onSubmit" type="primary">保存</ElButton>
    </template>
  </Dialog>
</template>

<style scoped></style>
