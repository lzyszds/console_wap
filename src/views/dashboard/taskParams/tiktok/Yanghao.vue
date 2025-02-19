<script setup>
import { getHuaShuTypeList } from "@/api/task/tiktok/huashu";
import { addData, editData, getDataList, deleteData } from "@/api/task/tiktok/yanghao";
import {
  useResetableForm,
  handleDelFn,
  getHuaShuTypeListUtils,
  onSubmitForm,
  getTaskListDataFn,
  handleNotInitData,
  setMessage,
} from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.tiktok.children.yanghao.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "",
  type: "tiktok",
  notes_name: "",
  wayType: 0, //0系统养号 1指定博主
  bloggerId: [], //博主id
  script_type: "", //话术类型
  follow_probability: 50, //关注概率
  like_probability: 50, //点赞概率
  see_comment_probability: 50, //看评论概率
  hair_comment_probability: 50,
  collectProbability: 50, //收藏概率
  duration_stay: [5, 10], //停留时长
  duration_stay_start: 5, //停留时长 开始
  duration_stay_end: 10, //停留时长 结束
  number_maintenance_duration: 60, //养号时长
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
  platform: "tiktok",
  taskName: "yanghao",
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
    prop: "wayType",
    label: () => getLabel("wayType"),
    width: 100,
    template: (row) =>
      row.wayType == 0 ? getLabel("wayTypeList.0") : getLabel("wayTypeList.1"),
  },
  { prop: "bloggerId", label: () => getLabel("bloggerId") },
  { prop: "script_type", label: () => getLabel("script_grouping_name") },
  { prop: "follow_probability", label: () => getLabel("follow_probability") },
  { prop: "like_probability", label: () => getLabel("like_probability") },
  { prop: "see_comment_probability", label: () => getLabel("see_comment_probability") },
  { prop: "hair_comment_probability", label: () => getLabel("hair_comment_probability") },
  { prop: "collectProbability", label: () => getLabel("collectProbability") },
  { prop: "duration_stay", label: () => getLabel("duration_stay") },
  {
    prop: "number_maintenance_duration",
    label: () => getLabel("number_maintenance_duration"),
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
function getTableData() {
  getTaskListDataFn(getDataList, listQuery).then((res) => {
    if (res != null) {
      // handleNotInitData("bloggerId", res.list);
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
  if (huashuList.value.length > 0) return;
  huashuList.value = await getHuaShuTypeListUtils(getHuaShuTypeList);
}

const handleCreate = async (act, row) => {
  action.value = act;
  handleGetHuaShuTypeList();
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      script_type: () => Number(row.script_type),
      device_number_arr: (value) => value.split(","),
      follow_probability: (value) => Number(value),
      like_probability: (value) => Number(value),
      see_comment_probability: (value) => Number(value),
      hair_comment_probability: (value) => Number(value),
      collectProbability: (value) => Number(value),

      //字符串数据转换成数组，如果转换失败则返回原数据
      bloggerId: (value) => {
        try {
          return value.indexOf("[") == 0 ? JSON.parse(value) : value;
        } catch (e) {
          return value;
        }
      },
    });
    formData.duration_stay_start = row.duration_stay.split(",")[0];
    formData.duration_stay_end = row.duration_stay.split(",")[1];
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  formData.duration_stay = [
    formData.duration_stay_start,
    formData.duration_stay_end,
  ].join(",");
  const { bloggerId, ...form } = formData;

  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: Object.assign({}, form, form.wayType == 1 ? { bloggerId } : {}),
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (form.wayType == 1 && !bloggerId) {
        setMessage("error", getLabel("bloggerId") + t(publicString + "empty"));
        return false;
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 养号方式 -->
      <a-form-item :label="getLabel('wayType')">
        <a-radio-group v-model:value="formData.wayType" button-style="solid">
          <a-radio-button :value="0">{{ getLabel("wayTypeList.0") }}</a-radio-button>
          <a-radio-button :value="1">{{ getLabel("wayTypeList.1") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <!-- 博主id -->
      <a-form-item :label="getLabel('bloggerId')" v-if="formData.wayType == 1">
        <a-textarea v-model:value="formData.bloggerId" show-count :maxlength="100" />
      </a-form-item>
      <!-- 话术类型 -->
      <a-form-item :label="getLabel('script_grouping_name')">
        <a-select v-model:value="formData.script_type">
          <a-select-option
            v-for="item in huashuList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 关注概率 -->
      <a-form-item
        v-for="item in [
          'follow_probability',
          'like_probability',
          'see_comment_probability',
          'hair_comment_probability',
          'collectProbability',
        ]"
        :label="getLabel(item)"
      >
        <a-row>
          <a-col :span="16">
            <a-slider
              v-model:value="formData[item]"
              :min="1"
              :max="100"
              :tipFormatter="(text) => text + '%'"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model:value="formData[item]"
              :min="1"
              :max="100"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 养号时长 -->
      <a-form-item :label="getLabel('number_maintenance_duration')">
        <a-input-number v-model:value="formData.number_maintenance_duration" min="1" />
      </a-form-item>
      <!-- 停留时长 -->
      <a-form-item :label="getLabel('duration_stay')">
        <a-input-number v-model:value="formData.duration_stay_start" min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" min="1" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
