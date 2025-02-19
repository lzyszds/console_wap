<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/instagram/yanghao";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
  handleValue,
} from "@/utils";

import _ from "lodash";

import UploadInput from "@/components/paramsform/UploadInput.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.instagram.children.yanghao.";
const getLabel = (val) => {
  return t(textString + "tableHeader." + val);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "", //id
  notes_name: "", // 备注名称
  regulation: "0", //规则
  wayType: "home", // 养号类型 home是首页推荐 appoint是指定账户 keyword是关键字
  recommend: "0", //推荐类型 0是首页推荐 1是reels推荐
  keyword: "", //关键字搜索和账号id
  see_count: 3, //浏览数量
  follow_probability: 50, //关注概率
  like_probability: 50, //点赞概率
  hair_comment_probability: 50, //发评论概率
  comment_content: "", //评论内容
  duration_stay: [6, 10], //停留时长
  duration_stay_start: 6, //停留时长 开始
  duration_stay_end: 10, //停留时长 结束
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const rowArr = ref([]);
const renwuList = ref([]);
const listLoading = ref(false);

const listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "instagram",
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
  { prop: "id", label: "ID", width: 80 },
  { prop: "notes_name", label: () => getLabel("notes_name") },
  {
    prop: "wayType",
    label: getLabel("wayType.title"),
    template: (row) => {
      if (row.wayType == "home") {
        return getLabel("wayType.home");
      } else if (row.wayType == "appoint") {
        return getLabel("wayType.appoint");
      } else {
        return getLabel("wayType.keyword");
      }
    },
    width: 160,
  },
  {
    prop: "see_count",
    label: getLabel("see_count"),
    width: 160,
  },
  {
    prop: "follow_probability",
    label: getLabel("follow_probability"),
    width: 160,
  },
  {
    prop: "like_probability",
    label: getLabel("like_probability"),
    width: 160,
  },
  {
    prop: "hair_comment_probability",
    label: getLabel("hair_comment_probability"),
    width: 160,
  },
  {
    prop: "comment_content",
    label: getLabel("comment_content"),
    width: 180,
  },
  {
    prop: "duration_stay",
    label: getLabel("duration_stay"),
    width: 160,
    template: (row) => {
      if (typeof row.duration_stay == "string") {
        row.duration_stay = row.duration_stay.split(",");
      }
      return row.duration_stay[0] + " - " + row.duration_stay[1];
    },
  },
  { prop: "create_time", label: getLabel("create_time"), width: 160 },
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
      follow_probability: (value) => Number(value),
      like_probability: (value) => Number(value),
      hair_comment_probability: (value) => Number(value),
    });
    formData.duration_stay_start = row.duration_stay[0];
    formData.duration_stay_end = row.duration_stay[1];
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
    checkParameter: () => {
      let isEmpty;
      if (formData.wayType != "home") {
        isEmpty =
          formData.regulation == 0
            ? !formData.keyword[0].value
            : formData.keyword.find((res) => !res.value);
      }

      if (formData.wayType == "appoint" && isEmpty) {
        setMessage("error", getLabel("account") + " " + t(publicString + "empty"));
        return false;
      } else if (formData.wayType == "keyword" && isEmpty) {
        setMessage("error", getLabel("keyword") + " " + t(publicString + "empty"));
        return false;
      }
      if (!formData.comment_content) {
        setMessage(
          "error",
          getLabel("comment_content") + " " + t(publicString + "empty")
        );
        return false;
      }
      postBefore();
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

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
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 养号类型 -->
      <a-form-item :label="getLabel('wayType.title')">
        <a-radio-group v-model:value="formData.wayType" button-style="solid">
          <a-radio-button :value="'home'">{{ getLabel("wayType.home") }}</a-radio-button>
          <a-radio-button :value="'appoint'">{{
            getLabel("wayType.appoint")
          }}</a-radio-button>
          <a-radio-button :value="'keyword'">{{
            getLabel("wayType.keyword")
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <!--  -->
      <a-form-item :label="getLabel('recommend')" v-if="formData.wayType == 'home'">
        <a-radio-group v-model:value="formData.recommend" button-style="solid">
          <a-radio-button :value="'0'">{{
            getLabel("recommend_option.0")
          }}</a-radio-button>
          <a-radio-button :value="'1'">{{
            getLabel("recommend_option.1")
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <!--  -->
      <a-form-item
        :label="formData.wayType == 'appoint' ? getLabel('account') : getLabel('keyword')"
        v-if="formData.wayType != 'home'"
      >
        <UploadInput prop="keyword" :placeholder="getLabel('tip')" />
      </a-form-item>

      <a-form-item :label="getLabel('see_count')">
        <a-input-number v-model:value="formData.see_count" :min="0" />
      </a-form-item>

      <!-- 关注概率 -->
      <a-form-item
        v-for="item in [
          'follow_probability',
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

      <a-form-item :label="getLabel('comment_content')">
        <a-input v-model:value="formData.comment_content" />
      </a-form-item>
      <a-form-item :label="getLabel('duration_stay')">
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

<style scoped></style>
