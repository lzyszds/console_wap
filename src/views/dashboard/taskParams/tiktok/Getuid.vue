<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
  getGatherDetails,
} from "@/api/task/tiktok/getuid";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
  splitArray,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.tiktok.children.getuid.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //备注
  type: "tiktok", //应用类型
  blogger_ids: "", //博主ID
  collection_area: "", //采集来源
  keyword: "", //关键词
  collection_num: 10, //采集数量
  fans_area: "0", //采集来源
};

const collAreaselect = [
  { label: getLabel("collAreaselect.0"), value: "0" },
  { label: getLabel("collAreaselect.1"), value: "1" },
  { label: getLabel("collAreaselect.2"), value: "2" },
  { label: getLabel("collAreaselect.3"), value: "3" },
  { label: getLabel("collAreaselect.4"), value: "4" },
  // { label: "采集直播间在线用户", value: "5" },
  { label: getLabel("collAreaselect.5"), value: "5" },
  // { label: "采集地点视频链接", value: "6" },
  { label: getLabel("collAreaselect.7"), value: "7" },
  { label: getLabel("collAreaselect.8"), value: "8" },
];

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
  platform: "tiktok",
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
    { prop: "id", label: "ID"},
    {
      prop: "blogger_ids",
      label: () => getLabel("blogger_ids"),
    },
    { prop: "keyword", label: () => getLabel("keyword") },
    {
      prop: "collection_num",
      label: () => getLabel("collection_num"),
      width: 100,
    },
    {
      prop: "fans_area",
      label: () => getLabel("fans_area"),
      template: (row) => getFansArea(row.fans_area),
    },
    { prop: "create_time", label: () => getLabel("create_time") },
  ],
  operationWidth: 320,
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
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  console.log(formData);
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (formData.fans_area == "3" || formData.fans_area == "4") {
        if (!formData.blogger_ids) {
          setMessage("error", getLabel("blogger_ids") + t(publicString + "empty"));
          return false;
        }
      } else if (["0", "1", "2", "5", "6"].includes(formData.fans_area)) {
        if (!formData.keyword) {
          setMessage("error", getLabel("keyword") + t(publicString + "empty"));
          return false;
        }
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

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

//判断是否显示某个控件
function isShow(arr) {
  return arr.includes(formData.fans_area);
}

//获取采集来源
const getFansArea = (value) => {
  return collAreaselect.find((item) => item.value == value).label;
};
</script>

<template>
  <ListCard></ListCard>
  <RecordPop>
    <template #listForm>
      <a-form-item :label="getLabel('fans_area')">
        <a-select v-model:value="formData.fans_area" :options="collAreaselect">
        </a-select>
      </a-form-item>
      <a-form-item :label="getLabel('keyword')" v-show="isShow(['0', '1', '2', '5'])">
        <a-input v-model:value="formData.keyword" />
      </a-form-item>

      <a-form-item :label="getLabel('blogger_ids')" v-show="isShow(['3', '4'])">
        <a-textarea v-model:value="formData.blogger_ids" show-count :maxlength="300" />
      </a-form-item>

      <a-form-item :label="getLabel('collection_num')">
        <a-input v-model:value="formData.collection_num" placeholder="" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>

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

<style scoped></style>
