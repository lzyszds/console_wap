<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/comment";
import { taskRun } from "@/api/task/run";
import _ from "lodash";
import { douyin } from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
  getTxtFileFn,
  handleEditFormBefore,
  handlePostFormBefore,
  setMessage,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.comment.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const commentWayList = ref([
  //关注方式列表
  { label: getLabel("commentWayList.0"), value: "1" },
  { label: getLabel("commentWayList.1"), value: "2" },
  { label: getLabel("commentWayList.2"), value: "3" },
  { label: getLabel("commentWayList.3"), value: "4" },
  { label: getLabel("commentWayList.4"), value: "5" },
]);

const defaultFormData = {
  id: "",
  notes_name: "",
  type: "douyin",
  device_number_arr: "",
  regulation: "0", //规则
  comment_way: "", //评论方式
  keyword: "", //搜索关键字
  bloggerId: "", //用户博主id
  content: "", //评论内容
  see_num: "10", //浏览次数
  comment_num: "10", //评论次数
  collect_percent: 100, //收藏百分比
  follow_percent: 70, //关注百分比
  like_percent: 70, //点赞百分比
  comment_percent: 70, //评论百分比
  comment_section: "1", //指定评论 1 依次评论用户 2 根据评论区关键字评论
  comment_section_keywords: "", //评论区关键词匹配
  duration_interval: [5, 10], //间隔时长6
  duration_interval_start: 5, //间隔时长 开始
  duration_interval_end: 10, //间隔时长 结束
  duration_stay: [5, 10], //停留时长
  duration_stay_start: 5, //停留时长 开始
  duration_stay_end: 10, //停留时长 结束
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

//多设备数据
const multDevdata = ref({
  0: { ...defaultFormData },
});

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
  platform: "douyin",
  taskName: "CommentTask",
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
    type: "edit",
  },
  {
    label: () => t(btnString + "deleteTask"),
    icon: "iconamoon:trash-light",
    callback: (item) => handleDelFn.call(this, [item], deleteData, getTableData),
    type: "delete",
  },
];

const tableTitle = [
  { prop: "id", label: "ID" },
  {
    prop: "keyword",
    label: () => getLabel("keyword"),
  },
  {
    prop: "content",
    label: () => getLabel("content"),
  },
  {
    prop: "comment_section",
    label: () => getLabel("comment_section"),
  },
  {
    prop: "comment_section_keywords",
    label: () => getLabel("comment_section_keywords"),
  },
  {
    prop: "bloggerId",
    label: () => getLabel("bloggerId"),
  },
  { prop: "see_num", label: () => getLabel("see_num"), width: 100 },
  { prop: "comment_percent", label: () => getLabel("comment_percent"), width: 100 },
  { prop: "collect_percent", label: () => getLabel("collect_percent"), width: 100 },
  { prop: "like_percent", label: () => getLabel("like_percent"), width: 100 },
  { prop: "follow_percent", label: () => getLabel("follow_percent"), width: 100 },
  { prop: "duration_stay", label: () => getLabel("duration_stay"), width: 100 },
  { prop: "duration_interval", label: () => getLabel("duration_interval"), width: 100 },
  { prop: "comment_num", label: () => getLabel("comment_num"), width: 100 },
  { prop: "see_num", label: () => getLabel("see_num"), width: 100 },
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

const isCondition = [
  "keyword",
  "bloggerId",
  "content",
  "comment_section",
  "comment_section_keywords",
];

const handleCreate = async (act, row) => {
  action.value = act;
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      collect_percent: (value) => Number(value),
      follow_percent: (value) => Number(value),
      like_percent: (value) => Number(value),
      comment_percent: (value) => Number(value),
    });
  }
  setTimeout(() => {
    dialogFormVisible.value = true;
  }, 300);
};

function parseFilter(row, key, item) {
  try {
    return JSON.parse(row[key]).filter((i) => i.deviceId == item)[0].value;
  } catch (error) {
    return row[key];
  }
}

const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      const requirement = (key) => formData[key] == "";
      if (isShow([1, 2, 3]) && requirement("keyword")) {
        setMessage("error", getLabel("keyword") + t(publicString + "empty"));
        return false;
      }
      //指定评论为评论区关键字时  评论关键字不能为空
      if (
        isShow([2, 5]) &&
        formData.comment_section == 2 &&
        requirement("comment_section_keywords")
      ) {
        setMessage(
          "error",
          getLabel("comment_section_keywords") + t(publicString + "empty")
        );
        return false;
      }

      //评论内容不能为空
      if (requirement("content")) {
        setMessage("error", getLabel("content") + t(publicString + "empty"));
        return false;
      }
      //博主id不能为空
      if (isShow([4]) && requirement("bloggerId")) {
        setMessage("error", getLabel("bloggerId") + t(publicString + "empty"));
        return false;
      }

      formData.duration_stay = [
        formData.duration_stay_start,
        formData.duration_stay_end,
      ].join(",");
      formData.duration_interval = [
        formData.duration_interval_start,
        formData.duration_interval_end,
      ].join(",");
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

function isShow(arr) {
  return arr.includes(Number(formData.comment_way));
}
</script>

<template>
  <!-- 列表页面 -->
  <ListCard />

  <!-- 弹窗 -->
  <RecordPop>
    <template #listForm>
      <!-- 评论方式 -->
      <a-form-item :label="getLabel('comment_way')">
        <a-select v-model:value="formData.comment_way" :options="commentWayList" />
      </a-form-item>

      <!-- 评论百分比 -->
      <a-form-item :label="getLabel('comment_percent')" v-if="isShow([1, 2])">
        <a-row>
          <a-col :span="16">
            <a-slider
              v-model:value="formData.comment_percent"
              :min="1"
              :max="100"
              :tipFormatter="(text) => text + '%'"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model:value="formData.comment_percent"
              :min="1"
              :max="100"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 关键词 -->
      <a-form-item :label="getLabel('keyword')" v-if="isShow([1, 2, 3])">
        <a-input type="text" v-model:value="formData.keyword" />
      </a-form-item>
      <a-form-item :label="getLabel('comment_section')" v-if="isShow([2, 5])">
        <a-radio-group v-model:value="formData.comment_section">
          <a-radio value="1">
            {{ getLabel("comment_section_list.0") }}
          </a-radio>
          <a-radio value="2">
            {{ getLabel("comment_section_list.1") }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 评论区关键字 -->
      <a-form-item
        :label="getLabel('comment_section_keywords')"
        v-if="isShow([2, 5]) && formData.comment_section == 2"
      >
        <UploadInput
          prop="comment_section_keywords"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 博主id -->
      <a-form-item :label="getLabel('bloggerId')" v-if="isShow([4])">
        <UploadInput
          prop="bloggerId"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 评论内容 -->
      <a-form-item :label="getLabel('comment_content')">
        <UploadInput
          prop="content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 收藏点赞 -->
      <a-form-item :label="getLabel('collect_percent')" v-if="isShow([1])">
        <a-row>
          <a-col :span="16">
            <a-slider
              v-model:value="formData.collect_percent"
              :min="1"
              :max="100"
              :tipFormatter="(text) => text + '%'"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model:value="formData.collect_percent"
              :min="1"
              :max="100"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 点赞 -->
      <a-form-item :label="getLabel('like_percent')" v-if="isShow([1, 2])">
        <a-row>
          <a-col :span="16">
            <a-slider
              v-model:value="formData.like_percent"
              :min="1"
              :max="100"
              :tipFormatter="(text) => text + '%'"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model:value="formData.like_percent"
              :min="1"
              :max="100"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 关注 -->
      <a-form-item :label="getLabel('follow_percent')" v-if="isShow([1, 2])">
        <a-row>
          <a-col :span="16">
            <a-slider
              v-model:value="formData.follow_percent"
              :min="1"
              :max="100"
              :tipFormatter="(text) => text + '%'"
            />
          </a-col>
          <a-col :span="4">
            <a-input-number
              v-model:value="formData.follow_percent"
              :min="1"
              :max="100"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 浏览次数 -->
      <a-form-item :label="getLabel('see_num')" v-if="isShow([1, 2, 3])">
        <a-input-number min="1" v-model:value="formData.see_num" />
      </a-form-item>

      <!-- 评论 -->
      <a-form-item :label="getLabel('comment_num')" v-if="isShow([3, 4, 5])">
        <a-input-number min="1" v-model:value="formData.comment_num" />
      </a-form-item>

      <!-- 间隔时间 -->
      <a-form-item :label="getLabel('duration_interval')" v-if="isShow([3])">
        <a-input-number v-model:value="formData.duration_interval_start" min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_interval_end" min="1" />
      </a-form-item>

      <!-- 停留时间 -->
      <a-form-item :label="getLabel('duration_stay')">
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
<style scoped>
.input-group {
  display: flex;
  align-items: center;
}
</style>
