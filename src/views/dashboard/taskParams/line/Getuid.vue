

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";
import { getGroupList } from "@/api/device/group";
import { addData, editData, getDataList } from "@/api/task/tiktok/getuid";

import { handleClose } from "@/utils";
import { line} from "@/utils/taskData";


let action = ref("add");
let dialogFormVisible = ref(false);

const formData = reactive({
  grouping_id: "",
  devices: "",
  appType: "",
  bloggerId: "",
  keyword: "",
  collectionNumber: 10,
  fansArea: "0",
  selectArr: [],
});

const fansAreaselect = [
  { label: "采集视频的链接", value: "0" },
  { label: "采集视频的评论用户", value: "1" },
  { label: "采集博主列表", value: "2" },
  { label: "采集博主已关注列表", value: "3" },
  { label: "采集博主粉丝列表", value: "4" },
  { label: "采集直播间在线用户", value: "5" },
  // { label: "采集地点视频链接", value: "6" },
  { label: "采集自己帖子上点赞的用户", value: "7" },
  { label: "采集自己帖子上评论的用户", value: "8" },
];

function isShow(arr) {
  return arr.includes(formData.fansArea);
}

const getFansArea = (value) => {
  return fansAreaselect.find((item) => item.value == value).label;
};

let renwuList = ref([]);
let groupList = ref([]);
let total = ref(0);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  platform: "line",
  taskName: "getuid",
  grouping_name: "",
  keyword: "",
});
const searchValue = ref("");

let tableKey = ref(0);
let listLoading = ref(false);

const checkAll = ref(false);

const value = ref([]);
let devicesList = ref([]);

//获取任务列表
async function handleGetGetuidList() {
  // listQuery.keyword = searchValue.value;
  listQuery.grouping_name = searchValue.value;
  listLoading.value = true;
  let response = await getDataList(listQuery);
  if (response.data.status == 200) {
    //this.categoryList = response.data.data
    renwuList.value = [];
    renwuList.value = response.data.data.list;
    total.value = Number(response.data.data.total);

    listLoading.value = false;
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
}
handleGetGetuidList();
const hasTable = ref(true);

async function changePagination(e) {
  listLoading.value = true;
  listQuery.page = e;
  hasTable.value = false;
  await handleGetGetuidList();
  hasTable.value = true;
}

//获取分组
async function handleGetGroupList() {
  let response = await getGroupList();
  groupList.value = [];
  groupList.value = [];
  if (response.data.status == 200) {
    groupList = response.data.data.list;
    for (let i = 0; i < groupList.length; i++) {
      let obj = {};
      obj.label = groupList[i].cate_name;
      obj.value = groupList[i].id;
      groupList.value.push(obj);
    }
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
}

const handleCreate = async (act, row) => {
  dialogFormVisible.value = true;
  await handleGetGroupList();
  await handleChangeGroup(row.grouping_id);

  if (act == "add") {
    action.value = "add";
    clearFormData();
  } else if (act == "edit") {
    console.log(row);
    action.value = "edit";
    formData.id = row.id;
    formData.grouping_id = row.grouping_id;
    formData.device_arr = row.device_number_arr;
    formData.appType = row.type;
    formData.keyword = row.keyword;
    formData.bloggerId = row.blogger_ids;
    formData.collectionNumber = row.collection_num;
    formData.fansArea = row.fans_area;

    //设备
    let arr = [];
    let device_number_arr = row.device_number_arr.split(",");
    for (let i = 0; i < device_number_arr.length; i++) {
      arr[i] = device_number_arr[i];
    }
    value.value = arr;
  } else if (act == "detail") {
  }
};

const onSubmit = async () => {
  formData.device_arr = value.value;
  let response;
  let params = {
    grouping_id: formData.grouping_id,
    type: formData.appType,
    device_number_arr: formData.device_arr,
    blogger_ids: formData.bloggerId,
    collection_num: formData.collectionNumber,
    fans_area: formData.fansArea,
    collection_area: "",
    keyword: formData.keyword,
  };
  if (action.value == "add") {
    response = await addData(params);
  }
  if (action.value == "edit") {
    response = await editData(Object.assign(params, { id: formData.id }));
  }

  handleGetGetuidList();
  dialogFormVisible.value = false;
  ElMessage({
    message: response.data.msg,
    plain: true,
    type: response.data.status == 200 ? "success" : "error",
  });
};

//全选择设备
const handleCheckAll = (val) => {
  if (val) {
    value.value = devicesList.value.map((_) => _.value);
  } else {
    value.value = [];
  }
};

const clearFormData = () => {
  formData.grouping_id = "";
  formData.devices = "";
  formData.bloggerId = "";
  formData.collectionNumber = 10;
  formData.fansArea = "0";
  formData.keyword = "";
  value.value = "";
};

function handleChangeGroup(e) {
  devicesList.value = [];
  value.value = [];

  for (let i = 0; i < groupList.length; i++) {
    if (e == groupList[i].id) {
      let list = groupList[i].device_number_arr;
      for (let i = 0; i < list.length; i++) {
        let obj = {};
        obj.value = list[i];
        obj.label = list[i] + "------" + list[i].slice(-3);
        devicesList.value.push(obj);
      }
      break;
    }
  }
}

//生成随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//选择任务
const handleSelectionChange = (val) => {
  formData.selectArr = val;
};

//删除任务
function handleDelFn() {
  if (formData.selectArr.length == 0) {
    ElMessage({
      message: "请勾选要删除的任务",
      type: "warning",
      plain: true,
    });
    return false;
  } else {
    ElMessageBox.confirm(
      "确定要删除这" + formData.selectArr.length + "条任务吗？",
      "操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "关闭",
        type: "warning",
        draggable: true,
      }
    ).then(async () => {
      const res = await Promise.all(
        formData.selectArr.map(async (item) => {
          return await deleteGetuid({ id: item.id });
        })
      );
      const isPass = res.filter((item) => item.data.status != 200);
      if (isPass.length > 0) {
        ElMessage({
          message: isPass[0].data.msg,
          type: "error",
          plain: true,
        });
      }
      ElMessage({
        message: "删除成功",
        type: "success",
        plain: true,
      });
      handleGetGetuidList();
    });
  }
}

//一键停止
function allStopFn() {
  if (formData.selectArr.length == 0) {
    ElMessage({
      message: "请勾选要停止的任务",
      type: "warning",
      plain: true,
    });
    return false;
  }
  ElMessageBox.confirm("确认停止", "操作", {
    confirmButtonText: "确定",
    cancelButtonText: "关闭",
    type: "warning",
    draggable: true,
  }).then(async () => {
    for (let i = 0; i < formData.selectArr.length; i++) {
      handleRun("getuid", "stopAll", formData.selectArr[i]);
    }
  });
}

//防抖 避免频繁操作
const handleDel = _.debounce(handleDelFn, 500);
const allStop = _.debounce(allStopFn, 500);

//启动
async function handleRun(taskName, taskType, row) {
  //const taskName = listQuery.taskName;
  console.log(row);
  //return false;
  let devicesList = row.device_number_arr.split(",");
  let params = [];

  //组装每个设备所执行的参数
  for (let i = 0; i < devicesList.length; i++) {
    let t = {
      deviceId: devicesList[i],
      data: {
        taskId: row.id, //任务id
        bozhuId: row.blogger_ids,
        keyword: row.keyword,
        collectionNumber: row.collection_num,
        fansArea: row.fans_area,
      },
    };
    params.push(t);
  }

  let data = {
    platform: "line",
    taskName: taskName,
    taskType: taskType,
    taskId: row.id,
    devicesListStr: row.device_number_arr, //row.device_number_arr, //JSON.parse(JSON.stringify(row.))
    params: JSON.stringify(params),
  };

  if (taskType == "stop") {
    ElMessageBox.confirm("确认停止", "操作", {
      confirmButtonText: "确定",
      cancelButtonText: "关闭",
      type: "warning",
      draggable: true,
    })
      .then(async () => {
        ipcRenderer.send("runScript", data);
      })
      .catch(() => {});
  } else {
    data.taskType = data.taskType.replace("All", "");
    ipcRenderer.send("runScript", data);
  }
}

async function handleDowload(row) {
  window.location.href = "https://api.chuhai.best/api/task_content_xls/" + row.id;

  // let params = {
  //     }
  //     response = await dowload(params);
}

const getTxtFile = (file) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      formData.bloggerId = content;
    };
    reader.onerror = function (e) {
      console.error("文件读取错误:", e);
    };
    reader.readAsText(file.raw); // 读取文件内容为文本
  }
};

watch(
  () => formData.bloggerId,
  (newVal, oldVal) => {
    //博主最多200个
    const arr = newVal.split(",");
    if (arr.length > 200) {
      ElMessage({
        message: "博主最多200个",
        type: "warning",
        plain: true,
      });
      formData.bloggerId = arr.slice(0, 200).join(",");
    }
  }
);
</script>
<template>
  <!--当前页面标识-->
  <input type="hidden" id="platform" value="line" />
  <input type="hidden" id="taskName" value="getuid" />
  <!-- 采集任务 -->
  <div class="filter-container">
    <ElButton type="primary" @click="handleCreate('add', '')">添加任务</ElButton>

    <ElInput
      v-model="listQuery.grouping_name"
      size="small"
      style="width: 240px"
      placeholder="分组设备搜索"
      @keyup.enter="handleGetGetuidList"
      @change="handleGetGetuidList"
    >
      <template #append>
        <LzyIcon @click="handleGetGetuidList" name="gg:search" align="-7px"></LzyIcon>
      </template>
    </ElInput>
    <ElButton @click="handleDel()" :type="formData.selectArr.length ? 'danger' : 'info'">
      删除任务
    </ElButton>
    <ElButton @click="allStop()" :type="formData.selectArr.length ? 'danger' : 'info'">
      一键停止
    </ElButton>
  </div>

  <!-- 内容列表 -->
  <ElTable
    :key="tableKey"
    v-loading="listLoading"
    :data="renwuList"
    border
    fit
    class="chuhaitable"
    highlight-current-row
    style="width: 100%"
    v-if="hasTable"
  >
    <ElTableColumn label="ID" prop="order_id" sortable="custom" align="center" width="80">
      <template #default="scope">
        <span>{{ scope.row.id }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn label="分组名称" align="center" width="150" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.cate_name }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn label="控制端ID" align="center" width="150" show-overflow-tooltip>
      <template #default="scope">
        <span>{{ scope.row.device_number_val }}</span>
      </template>
    </ElTableColumn>
    <!-- 
    <ElTableColumn label="应用类型" align="center">
      <template #default="scope">
        <span>{{ scope.row.type }}</span>
      </template>
    </ElTableColumn> -->

    <ElTableColumn label="博主ID" align="center">
      <template #default="scope">
        <span>{{ scope.row.blogger_ids }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn label="关键词" align="center">
      <template #default="scope">
        <span>{{ scope.row.keyword }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn label="采集数量" align="center" width="60px">
      <template #default="scope">
        <span>{{ scope.row.collection_num }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn label="采集来源" align="center">
      <template #default="scope">
        <span>{{ getFansArea(scope.row.fans_area) }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn label="任务状态" width="100px" align="center">
      <template #default="scope">
        <div :id="'tiktok_getuid_' + scope.row.id" style="display: flex">
          {{ scope.row.status == 0 ? "未运行" : scope.row.status }}
        </div>
      </template>
    </ElTableColumn>

    <ElTableColumn label="创建时间" align="center" width="120px">
      <template #default="scope">
        <span>{{ scope.row.create_time }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn
      label="操作"
      align="center"
      width="320"
      class-name="small-padding fixed-width"
    >
      <template #default="scope">
        <ElButton type="primary" @click="handleRun('getuid', 'startUp', scope.row)"
          >启动</ElButton
        >
        <ElButton type="danger" @click="handleRun('getuid', 'stop', scope.row)"
          >停止</ElButton
        >
        <ElButton type="primary" @click="handleCreate('edit', scope.row)">修改</ElButton>
        <ElButton type="primary" @click="handleDowload(scope.row)">下载</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
  <div v-else></div>
  <!-- 分页 -->
  <div class="pagination">
    <ElPagination
      v-show="listQuery.total > 0"
      background
      layout="prev, pager, next"
      :total="listQuery.total"
      :default-page-size="listQuery.pageSize"
      @current-change="changePagination"
    />
  </div>

  <!-- 弹层 -->
  <ElDialog
    v-model="dialogFormVisible"
    :title="action == 'add' ? '添加' : '修改'"
    width="30%"
    style="min-width: 100vw"
    :before-close="handleClose"
  >
    <ElForm :model="formData" label-position="left" label-width="90px">
      <ElFormItem label="选择分组" >
        <ElSelect
          v-model="formData.grouping_id"
          placeholder="请选择"
          @change="handleChangeGroup"
        >
          <ElOption
            v-for="item in groupList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="选择设备" prop="name">
        <ElSelect
          v-model="value"
          multiple
          clearable
          collapse-tags
          placeholder="选择设备"
          popper-class="custom-header"
          :max-collapse-tags="1"
        >
          <template #header>
            <ElCheckbox v-model="checkAll" @change="handleCheckAll"> 全选 </ElCheckbox>
          </template>
          <ElOption
            v-for="item in devicesList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="采集来源" >
        <ElSelect v-model="formData.fansArea" placeholder="请选择">
          <ElOption
            v-for="item in fansAreaselect"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="关键词" v-show="isShow(['0', '1', '2', '5'])">
        <ElInput type="text" v-model="formData.keyword" />
      </ElFormItem>
      <ElFormItem class="bloggerID" label="博主ID" v-show="isShow(['3', '4'])">
        <div class="idsItem">
          <ElInput
            type="textarea"
            size="small"
            placeholder="多个id请使用英文逗号分隔 ,,,"
            v-model="formData.bloggerId"
          />
          <ElUpload
            :show-file-list="false"
            ref="uploadRef"
            class="upload-demo"
            accept=".txt"
            :auto-upload="false"
            :on-change="getTxtFile"
          >
            <template #trigger>
              <ElButton type="primary">上传</ElButton>
            </template>
          </ElUpload>
        </div>
        <template #label>
          <div style="display: flex; gap: 5px">
            博主ID
            <el-tooltip
              class="box-item"
              effect="dark"
              content="博主ID最多支持200个"
              placement="top"
            >
              <LzyIcon name="ant-design:question-circle-outlined" width="15px"></LzyIcon>
            </el-tooltip>
          </div>
        </template>
      </ElFormItem>

      <ElFormItem label="采集数量">
        <ElInput type="text" v-model="formData.collectionNumber" placeholder="" />
      </ElFormItem>
    </ElForm>

    <div slot="footer" class="dialog-footer">
      <ElButton @click="dialogFormVisible = false">关闭</ElButton>
      <ElButton type="primary" @click="onSubmit()">保存</ElButton>
    </div>
  </ElDialog>
</template>
<style  scoped></style>
