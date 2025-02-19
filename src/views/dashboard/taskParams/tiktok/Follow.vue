<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/follow";
import _, { template } from "lodash";
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
const textString = "navigation.dashboard.taskParams.tiktok.children.follow.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const followWayList = ref([
  //关注方式列表
  { label: getLabel("followWayList.0"), value: "0" },
  { label: getLabel("followWayList.1"), value: "1" },
  { label: getLabel("followWayList.2"), value: "2" },
  { label: getLabel("followWayList.5"), value: "5" },
  { label: getLabel("followWayList.6"), value: "6" },
  { label: getLabel("followWayList.7"), value: "7" },
  { label: getLabel("followWayList.8"), value: "8" },
]);

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //备注名称
  type: "tiktok", //应用类型
  follow_way: "", //关注方式
  follow_range: "", //范围
  blogger_ids: "", //博主ID
  follow_num: 10, //关注数
  follow_time: 10, //间隔时长
  duration_stay_start: 5, //间隔时长 开始
  duration_stay_end: 10, //间隔时长 结束
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
  pageSize: 14,
  total: 0,
  platform: "tiktok",
  taskName: "follow",
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
  { prop: "id", label: "ID" },
  {
    prop: "follow_way",
    label: () => getLabel("follow_way"),
    width: 180,
    template: (row) => checkdata(row.follow_way),
  },
  {
    prop: "follow_range",
    label: () => getLabel("follow_range"),
    template: () => "粉丝",
    width: 100,
  },
  {
    prop: "blogger_ids",
    label: () => getLabel("blogger_ids"),
    template: (row) => {
      return convertString(row.blogger_ids);
    },
  },
  { prop: "follow_num", label: () => getLabel("follow_num") },
  { prop: "follow_time", label: () => getLabel("follow_time") },
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
      //字符串数据转换成数组，如果转换失败则返回原数据
      blogger_ids: (value) => {
        try {
          return value.indexOf("[") == 0 ? JSON.parse(value) : value;
        } catch (e) {
          return value;
        }
      },
    });
    formData.duration_stay_start = row.follow_time.split(",")[0];
    formData.duration_stay_end = row.follow_time.split(",")[1];
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  formData.follow_time = [formData.duration_stay_start, formData.duration_stay_end].join(
    ","
  );

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

function isShow(arr) {
  return arr.includes(formData.follow_way);
}

const checkdata = (val) => {
  const result = followWayList.value.filter((item) => {
    if (item.value == val) {
      return item.label;
    }
  })[0];
  return result ? result.label : "";
};
</script>

<template>
  <ListCard />

  <RecordPop>
    <template #listForm>
      <a-form-item :label="getLabel('follow_way')" prop="grouping_name">
        <a-select
          v-model:value="formData.follow_way"
          clearable
          :max-tag-count="1"
          :options="followWayList"
        >
        </a-select>
      </a-form-item>

      <a-form-item
        :label="getLabel('follow_range')"
        prop="grouping_name"
        v-if="isShow(['0'])"
      >
        <a-select v-model:value="formData.follow_range" clearable>
          <a-select-option value="0">
            {{ getLabel("follow_range_list.0") }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="getLabel('blogger_ids')"
        prop="grouping_name"
        v-if="isShow(['0', '1'])"
      >
        <a-textarea v-model:value="formData.blogger_ids" show-count :maxlength="300" />
      </a-form-item>

      <a-form-item :label="getLabel('follow_num')" prop="grouping_name">
        <a-input v-model:value="formData.follow_num" />
      </a-form-item>

      <a-form-item :label="getLabel('follow_time')" prop="grouping_name">
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
