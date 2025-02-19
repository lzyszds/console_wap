<script setup>

import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/like";
;
import Table from "@/components/Table";
import Dialog from "@/components/Dialog";
import { taskRun } from "@/api/task/run";
import UploadBlogId from "@/components/UploadBlogId";
import _ from "lodash";
import { douyin} from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  handleValue,
  convertString,
} from "@/utils";





const defaultFormData = {
  id: "", //任务ID
  type: "tiktok", //应用类型
  grouping_id: "", //分组
  device_number_arr: "", //设备
  bloggerId: "", //博主ID
  regulation: "0", //单独设置id
  pending_execution_time: "10", //点赞间隔
  duration_stay_start: "5", //点赞间隔开始
  duration_stay_end: "10", //点赞间隔结束
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

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
  platform: "tiktok",
  taskName: "likes",
  grouping_name: "",
  keyword: "",
});

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  tableTitle: [
    { prop: "id", label: "ID"},
    {
      prop: "bloggerId",
      label: "博主ID",
      template: (row) => convertString(row.bloggerId),
    },
    { prop: "pending_execution_time", label: "点赞间隔", width: 90 },
    { prop: "status", label: "任务状态", width: 100, platformTask: "tiktok_likes" },
    { prop: "create_time", label: "创建时间", width: 100 },
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

const handleCreate = async (act, row) => {
  action.value = act;
  dialogFormVisible.value = true;

  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      regulation: (value) => (value ? value : "0"),
    });
  }
};

const onSubmit = async () => {
  formData.pending_execution_time = `${formData.duration_stay_start},${formData.duration_stay_end}`;
  //将每个值转换成响应的value
  handleValue("bloggerId", formData);
  onSubmitForm({
    form: { ...formData },
    action: action.value,
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
  <!--当前页面标识-->
  <input type="hidden" id="platform" value="tiktok" />
  <input type="hidden" id="taskName" value="likes" />

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
      <UploadBlogId label="博主Id" prop="bloggerId"></UploadBlogId>

      <ElFormItem label="点赞间隔">
        <ElInputNumber v-model="formData.duration_stay_start" min="0" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <ElInputNumber v-model="formData.duration_stay_end" min="0" />
      </ElFormItem>
    </template>

    <template #dialogFooterBtn>
      <ElButton @click="onSubmit" type="primary">保存</ElButton>
    </template>
  </Dialog>
</template>

<style  scoped></style>
