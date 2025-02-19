<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
  getGatherDetails,
} from "@/api/task/instagram/getuid";
import UploadInput from "@/components/paramsform/UploadInput.vue";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
  splitArray,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.instagram.children.getuid.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //分组
  device_number_arr: "", //设备
  keyword: "", //关键词
  fansNum: 10, // 采集粉丝数量
  followNum: 0, // 采集关注数量
  duration_interval: [6, 10], //采集间隔
  duration_interval_start: 6,
  duration_interval_end: 10,
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const gatherDetailsVisible = ref(false); //采集详情弹窗显示隐藏
const gatherDetailsData = reactive({
  getByIndex: [],
  data: [],
  total: 0,
  newPage: 1,
}); //采集详情数据
const gatherDetailsLoading = ref(false); //采集详情加载状态
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);
let listLoading = ref(false); //任务列表加载状态

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "instagram",
  taskName: "getuid",
  grouping_name: "",
  keyword: "",
});

//操作按钮
const editParams = [
  {
    label: () => t(btnString + "addParams"),
    icon: "mage:plus",
    callback: () => handleCreate("add"),
    type: "add",
  },
  {
    label: () => getLabel("dialogTitle"),
    icon: "mage:eye",
    callback: (item) => viewGetuidData(item),
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
    { prop: "keyword", label: getLabel("keywords") },
    {
      prop: "fansNum",
      label: getLabel("fansNum"),
    },
    {
      prop: "followNum",
      label: getLabel("followNum"),
    },
    {
      prop: "duration_interval",
      label: getLabel("duration_interval"),
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

const handleCreate = async (act, row) => {
  action.value = act;

  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
    });
    formData.duration_interval_start = Number(row.duration_interval.split(",")[0]);
    formData.duration_interval_end = Number(row.duration_interval.split(",")[1]);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  formData.duration_interval = [
    formData.duration_interval_start,
    formData.duration_interval_end,
  ].join(",");
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (!formData.keyword) {
        setMessage("error", getLabel("keywords") + t(publicString + "empty"));
        return false;
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);

const openRowId = ref(""); //当前打开的行ID
//下载采集的内容
async function viewGetuidData(row) {
  const limit = 13;
  gatherDetailsVisible.value = true;
  gatherDetailsLoading.value = true;
  const res = await getGatherDetails(row.id);
  openRowId.value = row.id;
  const [byIndex, ...data] = res.data.data;

  gatherDetailsData.getByIndex = Object.keys(byIndex).map((key) => {
    return { title: byIndex[key], dataIndex: key };
  });
  gatherDetailsData.data = splitArray(data, limit);

  gatherDetailsData.total = data.length;

  setTimeout(() => {
    gatherDetailsLoading.value = false;
  }, 100);
  // window.location.href = "https://api.chuhai.best/api/task_content_xls/" + row.id;
}
const dowloadGather = () => {
  window.location.href =
    "https://api.chuhai.best/api/task_content_xls/" + openRowId.value + "?type=tiktok";
};
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <a-form-item :label="getLabel('keywords')">
        <UploadInput prop="keyword" />
      </a-form-item>

      <a-form-item :label="getLabel('fansNum')">
        <a-input-number :min="0" v-model:value="formData.fansNum" placeholder="" />
      </a-form-item>
      <a-form-item :label="getLabel('followNum')">
        <a-input-number :min="0" v-model:value="formData.followNum" placeholder="" />
      </a-form-item>

      <a-form-item :label="getLabel('duration_interval')">
        <a-input-number v-model:value="formData.duration_interval_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_interval_end" :min="1" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>

  <!-- 采集结果展示表格 -->
  <a-modal v-model:open="gatherDetailsVisible" width="70%" style="height: 72vh">
    <template #title>
      <span>{{ getLabel("dialogTitle") }}</span>
      <a-button style="margin-left: 20px" type="primary" @click="dowloadGather">
        {{ t(btnString + "download") }}
      </a-button>
    </template>
    <a-table
      :data="gatherDetailsData.data[gatherDetailsData.newPage - 1]"
      v-loading="gatherDetailsLoading"
      style="height: 58vh; overflow: auto"
      :columns="gatherDetailsData.getByIndex"
      :loading="gatherDetailsLoading"
    >
    </a-table>
  </a-modal>
</template>
