<script setup>

import {
  addData,
  editData,
  getDataList,
  deleteData,
  getGatherDetails,
} from "@/api/task/douyin/getuid";

import { taskRun } from "@/api/task/run";
import _ from "lodash";
import { douyin } from "@/utils/taskData";
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
const textString = "navigation.dashboard.taskParams.douyin.children.getuid.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //分组
  type: "douyin", //应用类型
  blogger_ids: "", //博主ID
  regulation: "0", //单独设置id
  coll_area: "0", //采集来源
  coll_direction: "0", //采集方向
  search_type: "0", //搜索方式
  keyword: "", //关键词
  link: "", //链接
  fans_num: "0", //粉丝数量
  user_type: "0", //用户类型
  collection_num: 10, //采集数量
  see_num: 0, //浏览数量
  followers_num: 0, //关注数量
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
  pageSize: 14,
  total: 0,
  platform: "douyin",
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

const tableTitle = [
  { prop: "id", label: "ID"},
  {
    prop: "blogger_ids",
    label: () => getLabel("blogger_ids"),
    template: convertString,
  },
  { prop: "keyword", label: () => getLabel("keyword") },
  {
    prop: "collection_num",
    label: () => getLabel("collection_num.1"),
    width: 100,
  },
  {
    prop: "coll_area",
    label: () => getLabel("coll_area"),
    template: (row) => getCollArea(row.coll_area),
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
  labelWidth: "120px",
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
      blogger_ids: (value) => {
        try {
          return value.indexOf("[") == 0 ? JSON.parse(value) : value;
        } catch (e) {
          return value;
        }
      },
    });
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (isShow([0, 2, 5]) && !formData.keyword) {
        setMessage("error", getLabel("keyword") + t(publicString + "empty"));
        return false;
      }
      if (isShow([1])) {
        if (formData.search_type == 0 && !formData.keyword) {
          setMessage("error", getLabel("keyword") + t(publicString + "empty"));
          return false;
        } else if (formData.search_type == 1 && !formData.link) {
          setMessage("error", getLabel("link") + t(publicString + "empty"));
          return false;
        }
      }
      if (isShow([3, 4]) && !formData.blogger_ids) {
        setMessage("error", getLabel("blogger_ids") + t(publicString + "empty"));
        return false;
      }

      if (isShow([5])) {
        if (formData.followers_num == 0 && formData.collection_num == 0) {
          setMessage("error", getLabel("collection_num.1") + t(publicString + "empty"));
          return false;
        }
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

const openRowId = ref(""); //当前打开的行ID
//下载采集的内容
async function viewGetuidData(row) {
  const limit = 13;
  gatherDetailsVisible.value = true;
  gatherDetailsLoading.value = true;
  const res = await getGatherDetails(row.id);
  openRowId.value = row.id;
  const [byIndex, ...data] = res.data.data;
  console.log(byIndex);

  gatherDetailsData.getByIndex = Object.keys(byIndex).map((key) => {
    return { title: byIndex[key], dataIndex: key };
  });
  gatherDetailsData.data = splitArray(data, limit);

  gatherDetailsData.total = data.length;
  console.log(gatherDetailsData);

  setTimeout(() => {
    gatherDetailsLoading.value = false;
  }, 100);
  // window.location.href = "https://api.chuhai.best/api/task_content_xls/" + row.id;
}
const dowloadGather = () => {
  window.location.href =
    "https://api.chuhai.best/api/task_content_xls/" + openRowId.value + "?type=douyin";
};

//判断是否显示某个控件
function isShow(arr) {
  return arr.includes(Number(formData.coll_area));
}

//获取采集来源
const getCollArea = (value) => {
  if (!value) return "";
  return collAreaselect.find((item) => item.value == value)?.label;
};

function convertString(item) {
  let result = "";
  try {
    result = JSON.parse(item.blogger_ids);
    return result.map((res) => res.bozhuId);
  } catch (e) {
    return item.blogger_ids;
  }
}
</script>

<template>
  <ListCard />

  <RecordPop :label-width="120">
    <template #listForm>
      <!-- 采集来源  -->
      <a-form-item :label="getLabel('coll_area')">
        <a-select v-model:value="formData.coll_area" :options="collAreaselect" />
      </a-form-item>
      <!-- 采集方向 -->
      <a-form-item :label="getLabel('coll_direction')" v-show="isShow([0])">
        <a-radio-group v-model:value="formData.coll_direction">
          <a-radio value="0">
            {{ getLabel("coll_direction_list.0") }}
          </a-radio>
          <a-radio value="1">
            {{ getLabel("coll_direction_list.1") }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- 搜索方式 -->
      <a-form-item :label="getLabel('search_type')" v-show="isShow([1])">
        <a-radio-group v-model:value="formData.search_type">
          <a-radio value="0">
            {{ getLabel("search_type_list.0") }}
          </a-radio>
          <a-radio value="1">
            {{ getLabel("search_type_list.1") }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <!-- 关键词 -->
      <a-form-item
        :label="getLabel('keyword')"
        v-show="isShow([0, 1, 2, 5])"
        v-if="formData.search_type == 0"
      >
        <a-input type="text" v-model:value="formData.keyword" />
      </a-form-item>

      <!-- 链接 -->
      <a-form-item
        :label="getLabel('link')"
        v-show="isShow([1])"
        v-if="formData.search_type == 1"
      >
        <a-textarea v-model:value="formData.link" show-count />
      </a-form-item>
      <!-- 博主id -->
      <a-form-item :label="getLabel('blogger_ids')" v-show="isShow([3, 4])">
        <a-textarea v-model:value="formData.blogger_ids" show-count />
      </a-form-item>
      <!-- 粉丝数量 -->
      <a-form-item :label="getLabel('fans_num')" v-show="isShow([2, 3, 4])">
        <a-select v-model:value="formData.fans_num">
          <a-select-option value="0">{{ getLabel("fans_num_list.0") }}</a-select-option>
          <a-select-option value="1">{{ getLabel("fans_num_list.1") }}</a-select-option>
          <a-select-option value="2">{{ getLabel("fans_num_list.2") }}</a-select-option>
          <a-select-option value="3">{{ getLabel("fans_num_list.3") }}</a-select-option>
          <a-select-option value="4">{{ getLabel("fans_num_list.4") }}</a-select-option>
          <a-select-option value="5">{{ getLabel("fans_num_list.5") }}</a-select-option>
        </a-select>
      </a-form-item>
      <!-- 用户类型 -->
      <a-form-item :label="getLabel('user_type')" v-show="isShow([2, 3, 4])">
        <a-radio-group v-model:value="formData.user_type" button-style="solid">
          <a-radio-button value="0">{{ getLabel("user_type_list.0") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("user_type_list.1") }}</a-radio-button>
          <a-radio-button value="2">{{ getLabel("user_type_list.2") }}</a-radio-button>
          <a-radio-button value="3">{{ getLabel("user_type_list.3") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <!-- 浏览数量 -->
      <a-form-item
        :label="isShow([3, 4, 5]) ? getLabel('see_num.0') : getLabel('see_num.1')"
        v-show="isShow([1, 3, 4, 5])"
      >
        <a-input-number min="1" v-model:value="formData.see_num" placeholder="" />
      </a-form-item>
      <a-form-item
        :label="isShow([5]) ? getLabel('collection_num.0') : getLabel('collection_num.1')"
      >
        <a-input-number min="0" v-model:value="formData.collection_num" placeholder="" />
      </a-form-item>
      <a-form-item :label="getLabel('followers_num')" v-show="isShow([5])">
        <a-input-number min="0" v-model:value="formData.followers_num" placeholder="" />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }}</a-button>
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
