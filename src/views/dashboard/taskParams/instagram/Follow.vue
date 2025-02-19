<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/instagram/follow";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";
import UploadInput from "@/components/paramsform/UploadInput.vue";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.instagram.children.follow.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

const defaultFormData = {
  id: "",
  notes_name: "",

  followBefore: "0", //关注前是否查看资料视频动作 0-否，1-是
  duration_stay: "", //停留时间
  duration_stay_start: 1,
  duration_stay_end: 2,

  viewPostsNumber: "", //浏览帖子数量
  viewPostsNumber_start: 1, //浏览帖子数量开始
  viewPostsNumber_end: 1,
  collectProbability: 50, //收藏概率
  like_probability: 50, //点赞概率
  hair_comment_probability: 50, //发评论概率
  comment_content: "", //评论内容
  follow_interval: "", //关注间隔
  follow_interval_start: 1, //关注间隔开始时间
  follow_interval_end: 5, //关注间隔结束时间
  follow_type: "1", //关注类型  关注事件,1-指定账号粉丝 * 3-指定账号，4-系统推荐， * 5-关键词热门，7-关注帖子链接评论或者点赞用户

  usernames: "", //指定博主账号
  number: 5, //每个账号关注的粉丝量 | 关注推荐数量
  keywords: "", //关键词关注
  links: "", //链接地址关注
  commentFilter: "null", //评论关键词匹配（如果null表示不过滤）
  commentFollowNumber: 4, //评论关注数量
  likeNum: 4, //点赞数量
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
//分组列表
let renwuList = ref([]);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "instagram",
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

const follow_type_option = [
  { value: "1", text: getLabel("follow_type_option.0") },
  { value: "3", text: getLabel("follow_type_option.1") },
  { value: "4", text: getLabel("follow_type_option.2") },
  { value: "5", text: getLabel("follow_type_option.3") },
  { value: "7", text: getLabel("follow_type_option.4") },
];

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  editParams,
  tableTitle: [
    { prop: "id", label: "ID", width: 80 },
    {
      prop: "followBefore",
      label: getLabel("followBefore"),
      template: (row) => {
        return row.followBefore == "0" ? getLabel("no") : getLabel("yes");
      },
    },
    {
      prop: "duration_stay",
      label: getLabel("duration_stay"),
      template: (row) => {
        return convertString(row.duration_stay);
      },
    },
    {
      prop: "viewPostsNumber",
      label: getLabel("viewPostsNumber"),

      template: (row) => {
        return convertString(row.duration_stay);
      },
    },
    {
      prop: "collectProbability",
      label: getLabel("collectProbability"),

      template: (row) => {
        return convertString(row.collectProbability) || 0;
      },
    },
    {
      prop: "like_probability",
      label: getLabel("like_probability"),

      template: (row) => {
        return convertString(row.like_probability) || 0;
      },
    },
    {
      prop: "hair_comment_probability",
      label: getLabel("hair_comment_probability"),

      template: (row) => {
        return convertString(row.hair_comment_probability) || 0;
      },
    },
    {
      prop: "comment_content",
      label: getLabel("comment_content"),

      template: (row) => {
        return convertString(row.comment_content);
      },
    },
    {
      prop: "follow_interval",
      label: getLabel("follow_interval"),

      template: (row) => {
        return convertString(row.follow_interval);
      },
    },
    {
      prop: "follow_type",
      label: getLabel("follow_type"),

      template: (row) => {
        if (!row.follow_type) return;
        return follow_type_option.find((item) => item.value == row.follow_type).text;
      },
    },
    {
      prop: "usernames",
      label: getLabel("usernames"),

      template: (row) => {
        return convertString(row.usernames);
      },
    },
    {
      prop: "number",
      label: getLabel("number"),

      template: (row) => {
        return convertString(row.number);
      },
    },
    {
      prop: "keywords",
      label: getLabel("keywords"),

      template: (row) => {
        return convertString(row.keywords);
      },
    },
    {
      prop: "links",
      label: getLabel("links"),

      template: (row) => {
        return convertString(row.links);
      },
    },
    {
      prop: "commentFilter",
      label: getLabel("commentFilter"),

      template: (row) => {
        return convertString(row.commentFilter);
      },
    },
    {
      prop: "commentFollowNumber",
      label: getLabel("commentFollowNumber"),

      template: (row) => {
        return convertString(row.commentFollowNumber);
      },
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
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

//提交表单
const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    checkParameter: () => {
      return true;
    },
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
  }).then((res) => {
    dialogFormVisible.value = res;
    formData.device_number_arr = [];
  });
};

const isShow = (val) => {
  return val.includes(formData.follow_type);
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 关注类型 -->
      <a-form-item :label="getLabel('follow_type')">
        <a-select v-model:value="formData.follow_type">
          <a-select-option
            v-for="item in follow_type_option"
            :key="item.value"
            :value="item.value"
          >
            {{ item.text }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 关注前操作 -->
      <a-form-item :label="getLabel('followBefore')">
        <a-radio-group v-model:value="formData.followBefore" button-style="solid">
          <a-radio-button value="0">{{ getLabel("no") }}</a-radio-button>
          <a-radio-button value="1">{{ getLabel("yes") }}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <template v-if="formData.followBefore == 1">
        <!-- 停留时间 -->
        <a-form-item :label="getLabel('duration_stay')">
          <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
          &nbsp;&nbsp; - &nbsp;&nbsp;
          <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
        </a-form-item>

        <!-- 浏览帖子数量 -->
        <a-form-item :label="getLabel('viewPostsNumber')">
          <a-input-number v-model:value="formData.viewPostsNumber_start" :min="1" />
          &nbsp;&nbsp; - &nbsp;&nbsp;
          <a-input-number v-model:value="formData.viewPostsNumber_end" :min="1" />
        </a-form-item>

        <!-- 关注概率 -->
        <a-form-item
          v-for="item in [
            'collectProbability',
            'like_probability',
            'hair_comment_probability',
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

        <!-- 评论内容 -->
        <a-form-item :label="getLabel('comment_content')">
          <UploadInput prop="comment_content" />
        </a-form-item>
      </template>

      <!-- 关注间隔 -->
      <a-form-item :label="getLabel('follow_interval')">
        <a-input-number v-model:value="formData.follow_interval_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.follow_interval_end" :min="1" />
      </a-form-item>

      <!-- 指定博主账号 -->
      <a-form-item v-if="isShow(['1', '3'])" :label="getLabel('usernames')">
        <UploadInput prop="usernames" />
      </a-form-item>

      <!-- 关键词匹配 -->
      <a-form-item v-if="isShow(['5'])" :label="getLabel('keywords')">
        <a-input v-model:value="formData.keywords" />
      </a-form-item>

      <!-- 每个账号关注的粉丝量 | 关注推荐数量 -->
      <a-form-item v-if="isShow(['1', '4', '5'])" :label="getLabel('number')">
        <a-input-number v-model:value="formData.number" :min="1" />
      </a-form-item>

      <!-- 链接地址关注 -->
      <a-form-item v-if="isShow(['7'])" :label="getLabel('links')">
        <UploadInput prop="links" />
      </a-form-item>

      <!-- 评论关键词匹配 -->
      <a-form-item v-if="isShow(['7'])" :label="getLabel('commentFilter')">
        <a-input v-model:value="formData.commentFilter" />
      </a-form-item>

      <!-- 评论关注数量 -->
      <a-form-item v-if="isShow(['7'])" :label="getLabel('commentFollowNumber')">
        <a-input-number v-model:value="formData.commentFollowNumber" :min="1" />
      </a-form-item>

      <!-- 点赞数量 -->
      <a-form-item v-if="isShow(['7'])" :label="getLabel('likeNum')">
        <a-input-number v-model:value="formData.likeNum" :min="1" />
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>
