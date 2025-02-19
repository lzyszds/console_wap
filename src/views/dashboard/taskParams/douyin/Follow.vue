<script setup>
import { ref, reactive, provide, computed, watch } from "vue";
import { addData, editData, getDataList, deleteData } from "@/api/task/douyin/follow";
import { taskRun } from "@/api/task/run";
import { douyin } from "@/utils/taskData";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
} from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.douyin.children.follow.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const followWayList = ref([
  //关注方式列表
  { label: getLabel("followWayList.0"), value: "1" },
  { label: getLabel("followWayList.1"), value: "2" },
  { label: getLabel("followWayList.2"), value: "3" },
  { label: getLabel("followWayList.3"), value: "4" },
  { label: getLabel("followWayList.4"), value: "5" },
  { label: getLabel("followWayList.5"), value: "6" },
  { label: getLabel("followWayList.6"), value: "7" },
  { label: getLabel("followWayList.7"), value: "8" },
  { label: getLabel("followWayList.8"), value: "9" },
  { label: getLabel("followWayList.9"), value: "10" },
]);

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //分组
  type: "douyin", //应用类型
  follow_way: "", //关注方式
  blogger_ids: [], //博主ID
  search_name: "", //搜索关键词
  regulation: "0", //单独设置id
  message_content: "", //私信消息内容
  comment_content: "", //评论内容
  collect_percent: 0, //收藏概率
  like_percent: 0, //点赞概率
  comment_percent: 0, //评论概率
  watch_new_videos: "", //是否观看最新视频  //不要理 是否观看最新视频 0:最新作品 1:收藏作品 2:点赞作品
  before_operation: [], //前置操作
  after_operation: [], //后置操作
  comment_section_keywords: "", //评论区关键词查询用户
  follow_num: 10, //关注数
  duration_stay: [5, 10], //间隔时长
  duration_stay_start: 5,
  duration_stay_end: 10,
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
  platform: "douyin",
  taskName: "follow",
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
  },
  {
    label: () => t(btnString + "deleteTask"),
    icon: "iconamoon:trash-light",
    callback: (item) => handleDelFn.call(this, [item], deleteData, getTableData),
    danger: (item) => item.length > 0,
    type: "info",
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
    prop: "regulation",
    label: () => getLabel("regulation"),
    width: 100,
    template: (row) => {
      return row.regulation == 0 ? getLabel("whole") : getLabel("separate");
    },
  },
  {
    prop: "blogger_ids",
    label: () => getLabel("blogger_ids"),
    template: (row) =>
      Array.isArray(row.blogger_ids)
        ? row.blogger_ids.map((item) => item.value).join(",")
        : "",
  },
  {
    prop: "search_name",
    label: () => getLabel("search_name"),
    template: (row) => row.search_name,
  },
  {
    prop: "comment_section_keywords",
    label: () => getLabel("comment_section_keywords"),
    template: (row) => row.comment_section_keywords,
  },
  {
    prop: "before_operation",
    label: () => getLabel("before_operation"),
    width: 100,
    template: (row) => {
      return row.before_operation.includes("1") ? getLabel("latestVideo") : "";
    },
  },
  {
    prop: "collect_percent",
    label: () => getLabel("collect_percent"),
    width: 100,
    template: (row) => row.collect_percent + "%",
  },
  {
    prop: "like_percent",
    label: () => getLabel("like_percent"),
    width: 100,
    template: (row) => row.like_percent + "%",
  },
  {
    prop: "comment_percent",
    label: () => getLabel("comment_percent"),
    width: 100,
    template: (row) => row.comment_percent + "%",
  },
  { prop: "comment_content", label: () => getLabel("comment_content"), width: 180 },
  {
    prop: "after_operation",
    label: () => getLabel("after_operation"),
    width: 100,
    template: (row) => {
      return row.after_operation.includes("1") ? getLabel("private_message") : "";
    },
  },
  { prop: "message_content", label: () => getLabel("message_content"), width: 180 },
  { prop: "follow_num", label: () => getLabel("follow_num"), width: 100 },
  { prop: "follow_time", label: () => getLabel("follow_time"), width: 100 },
  { prop: "create_time", label: () => getLabel("create_time") },
];

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  editParams,
  tableTitle,
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
});

//获取任务列表
function getTableData() {
  listLoading.value = true;
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
      collect_percent: (value) => Number(value),
      like_percent: (value) => Number(value),
      comment_percent: (value) => Number(value),
      before_operation: (value) => value.split(","),
      after_operation: (value) => value.split(","),
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
  formData.before_operation = formData.before_operation.join(",");
  console.log(formData.after_operation);

  formData.after_operation = formData.after_operation.join(",");

  onSubmitForm({
    form: { ...formData },
    action: action.value,
    checkParameter,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

function checkParameter() {
  // 检查关注方式相关的必填项
  if (isShow([1, 2])) {
    if (!formData.blogger_ids[0] || formData.blogger_ids[0].value == "") {
      setMessage("error", getLabel("blogger_ids") + t(publicString + "empty"));
      return false;
    }
  } else if (isShow([4, 5])) {
    if (!formData.search_name) {
      setMessage("error", getLabel("search_name") + t(publicString + "empty"));
      return false;
    }
  }

  // 检查评论和私信的必填项
  if (formData.before_operation.includes("1") && !formData.comment_content) {
    setMessage("error", getLabel("comment_content") + t(publicString + "empty"));
    return false;
  }
  if (formData.after_operation.includes("1") && !formData.message_content) {
    setMessage("error", getLabel("message_content") + t(publicString + "empty"));
    return false;
  }
  return true;
}

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);

function isShow(arr) {
  return arr.includes(Number(formData.follow_way));
}

const checkdata = (val) => {
  const result = followWayList.value.find((item) => item.value === val);
  return result ? result.label : "";
};
</script>

<template>
  <ListCard :loading="listLoading" />
  <RecordPop>
    <template #listForm>
      <!-- 关注方式 -->
      <a-form-item :label="getLabel('follow_way')">
        <a-select v-model:value="formData.follow_way" :options="followWayList" />
      </a-form-item>
      <!-- 上传博主ID -->
      <a-form-item :label="getLabel('blogger_ids')" v-if="isShow([1, 2])">
        <UploadInput
          prop="blogger_ids"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <template v-if="isShow([4, 5])">
        <!-- 搜索关键词 -->
        <a-form-item :label="getLabel('search_name')">
          <a-input
            v-model:value="formData.search_name"
            :placeholder="t(publicString + 'message.uploadTips')"
          />
        </a-form-item>
        <!-- 评论区关键词 -->
        <a-form-item :label="getLabel('comment_section_keywords')" v-if="isShow([5])">
          <UploadInput
            prop="message_content"
            :placeholder="t(publicString + 'message.uploadTips')"
          />
        </a-form-item>
      </template>

      <!-- 前置操作 -->
      <a-form-item :label="getLabel('before_operation')">
        <a-checkbox-group v-model:value="formData.before_operation">
          <a-checkbox :value="'1'">{{ getLabel("latestVideo") }}</a-checkbox>
        </a-checkbox-group>
      </a-form-item>

      <!-- 评论内容 -->
      <a-form-item
        :label="getLabel('comment_content')"
        v-if="formData.before_operation.includes('1')"
      >
        <UploadInput
          prop="comment_content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <template v-if="formData.before_operation.includes('1')">
        <a-form-item
          v-for="item in ['collect_percent', 'like_percent', 'comment_percent']"
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
      </template>

      <!-- 后置操作 -->
      <a-form-item :label="getLabel('after_operation')">
        <a-checkbox-group v-model:value="formData.after_operation">
          <a-checkbox value="1">{{ getLabel("private_message") }}</a-checkbox>
        </a-checkbox-group>
      </a-form-item>

      <!-- 私信内容 -->

      <a-form-item
        :label="getLabel('message_content')"
        v-if="formData.after_operation.includes('1')"
      >
        <UploadInput
          prop="message_content"
          :placeholder="t(publicString + 'message.uploadTips')"
        />
      </a-form-item>

      <!-- 间隔时长 -->
      <a-form-item :label="getLabel('follow_time')">
        <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
