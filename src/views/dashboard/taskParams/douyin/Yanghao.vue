<script setup>
import { ref, reactive, provide } from "vue";
import { getHuaShuTypeList } from "@/api/task/tiktok/huashu";
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/yanghao";
import {
  useResetableForm,
  handleDelFn,
  getHuaShuTypeListUtils,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
  setMessage,
} from "@/utils";

import _ from "lodash";
import { douyin } from "@/utils/taskData";
import { taskRun } from "@/api/task/run";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.yanghao.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "",
  type: "douyin",
  notes_name: "",
  wayType: 0, //0系统养号 1指定博主 2直播间
  bloggerId: "", //博主id
  search_name: "", //搜索关键词
  script_type: "", //话术类型
  follow_probability: 50, //关注概率
  like_probability: 50, //点赞概率
  see_comment_probability: 50, //看评论概率
  hair_comment_probability: 50, //发评论概率
  collectProbability: 50, //收藏概率
  duration_stay: [5, 10], //停留时长
  duration_stay_start: 5, //停留时长 开始
  duration_stay_end: 10, //停留时长 结束
  number_maintenance_duration: 60, //养号时长
  seeCount: 15, //浏览数量
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
  platform: "douyin",
  taskName: "yanghao",
  grouping_name: "",
  keyword: "",
});

const wayTypeList = [
  getLabel("wayTypeList.0"),
  getLabel("wayTypeList.1"),
  getLabel("wayTypeList.2"),
  getLabel("wayTypeList.3"),
];

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
    prop: "wayType",
    label: getLabel("wayType"),
    width: 100,
    template: (row) => getLabel("wayTypeList." + row.wayType),
  },
  {
    prop: "bloggerId",
    label: getLabel("bloggerId"),
    width: 100,
    template: (row) => convertString(row.bloggerId),
  },
  {
    prop: "search_name",
    label: getLabel("search_name"),
    width: 100,
    template: (row) => convertString(row.search_name),
  },
  {
    prop: "follow_probability",
    label: getLabel("follow_probability"),
    width: 100,
  },
  {
    prop: "like_probability",
    label: getLabel("like_probability"),
    width: 100,
  },
  {
    prop: "see_comment_probability",
    label: getLabel("see_comment_probability"),
    width: 150,
  },
  {
    prop: "hair_comment_probability",
    label: getLabel("hair_comment_probability"),
    width: 100,
  },
  {
    prop: "collectProbability",
    label: getLabel("collectProbability"),
    width: 100,
  },
  {
    prop: "duration_stay",
    label: getLabel("duration_stay"),
    width: 100,
  },
  { prop: "seeCount", label: () => getLabel("seeCount"), width: 100 },
  {
    prop: "number_maintenance_duration",
    label: getLabel("number_maintenance_duration"),
    width: 100,
  },
  {
    prop: "script_grouping_name",
    label: getLabel("script_grouping_name"),
    template: (row) => {
      if (huashuList.value.length == 0) return "";

      return huashuList.value.find((item) => item.value == row.script_type).label;
    },
  },
  { prop: "create_time", label: () => getLabel("create_time"), width: 200 },
];

const getTableLable = (item) => {
  const arr = [
    {
      prop: "follow_probability",
      label: getLabel("follow_probability"),
    },
    {
      prop: "like_probability",
      label: getLabel("like_probability"),
    },
    {
      prop: "see_comment_probability",
      label: getLabel("see_comment_probability"),
    },
    {
      prop: "hair_comment_probability",
      label: getLabel("hair_comment_probability"),
    },
    {
      prop: "collectProbability",
      label: getLabel("collectProbability"),
    },
  ];

  const val = arr.find((i) => i.prop == item);
  if (val) {
    return val.label;
  } else {
    return item;
  }
};

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
  handleGetHuaShuTypeList();
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
    });
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: ({ checkWhole, checkSeparate }) => {
      if (formData.wayType == 1) {
        checkWhole("bloggerId", getLabel("bloggerId"));
      } else if (formData.wayType == 2 || formData.wayType == 3) {
        checkWhole("search_name", getLabel("search_name"));
      }
      if (!formData.script_type) {
        setMessage("error", getLabel("script_grouping_name") + t(publicString + "empty"));
        return false;
      }
      try {
        postBefore();
        return true;
      } catch (e) {
        return false;
      }
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//编辑表单前
function assignBefore(row) {
  formData.duration_stay_start = row.duration_stay.split(",")[0];
  formData.duration_stay_end = row.duration_stay.split(",")[1];
}

//提交前
function postBefore() {
  formData.duration_stay = [
    formData.duration_stay_start,
    formData.duration_stay_end,
  ].join(",");
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
      <!-- 养号方式 -->
      <a-form-item :label="t(textString + 'tableHeader.wayType')" name="wayType">
        <a-radio-group v-model:value="formData.wayType">
          <a-radio v-for="(item, index) in wayTypeList" :key="index" :value="index">
            {{ item }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 话术类型 -->
      <a-form-item
        :label="t(textString + 'tableHeader.script_grouping_name')"
        name="script_type"
      >
        <a-select v-model:value="formData.script_type" :options="huashuList"> </a-select>
      </a-form-item>

      <!-- 指定博主 -->
      <a-form-item :label="getLabel('bloggerId')" v-if="formData.wayType == 1">
        <a-textarea v-model:value="formData.bloggerId" show-count />
      </a-form-item>

      <!-- 直播间 规则输入框 -->
      <a-form-item
        :label="getLabel('search_name')"
        v-if="formData.wayType == 2 || formData.wayType == 3"
      >
        <a-input v-model:value="formData.search_name" />
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

      <!-- 浏览数量 -->
      <a-form-item :label="t(textString + 'tableHeader.seeCount')" name="seeCount">
        <a-input-number min="1" v-model:value="formData.seeCount" />
      </a-form-item>

      <!-- 养号时长 -->
      <a-form-item
        :label="t(textString + 'tableHeader.number_maintenance_duration')"
        name="number_maintenance_duration"
      >
        <a-input-number min="1" v-model:value="formData.number_maintenance_duration" />
      </a-form-item>

      <!-- 停留时长 -->
      <a-form-item :label="t(textString + 'tableHeader.duration_stay')">
        <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
      </a-form-item>
    </template>

    <template #toolBar>
      <a-button @click="onSubmit" type="primary">{{ t(btnString + "save") }} </a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
