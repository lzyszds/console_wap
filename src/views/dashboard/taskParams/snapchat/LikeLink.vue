<script setup>
/* 聚光灯帖子点赞评论操作 */
import { ref, reactive, watch, provide } from "vue";
import { addData, editData, getDataList, deleteData } from "@/api/task/snapchat/likelink";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";

import _ from "lodash";
import UploadInput from "@/components/paramsform/UploadInput.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.snapchat.children.likeLink.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "", //id
  notes_name: "", // 分组
  wayType: "base", // 来源类型 base是随机 link是链接
  link_urls: "", //链接
  see_count: 3, //浏览数量
  follow_probability: 50, //关注概率
  like_probability: 50, //点赞概率
  hair_comment_probability: 50, //发评论概率
  comment_content: [], //评论内容
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
  platform: "snapchat",
  taskName: "likelink",
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
  { prop: "notes_name", label: () => getLabel("notes_name") },
  {
    prop: "wayType",
    label: t(textString + "tableHeader.wayType.title"),

    template: (row) => {
      return row.wayType == "base"
        ? t(textString + "tableHeader.wayType.base")
        : t(textString + "tableHeader.wayType.link");
    },
  },
  { prop: "link_urls", label: t(textString + "tableHeader.link_urls") },
  { prop: "see_count", label: t(textString + "tableHeader.see_count") },
  {
    prop: "follow_probability",
    label: t(textString + "tableHeader.follow_probability"),
    template: (row) => {
      return row.follow_probability + "%";
    },
  },
  {
    prop: "like_probability",
    label: t(textString + "tableHeader.like_probability"),
    template: (row) => {
      return row.like_probability + "%";
    },
  },
  {
    prop: "hair_comment_probability",
    label: t(textString + "tableHeader.hair_comment_probability"),
    template: (row) => {
      return row.hair_comment_probability + "%";
    },
  },
  {
    prop: "comment_content",
    label: t(textString + "tableHeader.comment_content"),
  },
  {
    prop: "duration_stay",
    label: t(textString + "tableHeader.duration_stay"),

    template: (row) => {
      return row.duration_stay[0] + " - " + row.duration_stay[1];
    },
  },

  { prop: "create_time", label: t(textString + "tableHeader.create_time") },
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
  labelWidth: 110,
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
    formData.duration_stay_start = row.duration_stay[0];
    formData.duration_stay_end = row.duration_stay[1];
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  formData.duration_stay = [formData.duration_stay_start, formData.duration_stay_end];
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: formData,
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
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <!-- 类型 -->
      <a-form-item :label="t(textString + 'tableHeader.wayType.title')">
        <a-radio-group v-model:value="formData.wayType">
          <a-radio-button value="base">
            {{ t(textString + "tableHeader.wayType.base") }}
          </a-radio-button>
          <a-radio-button value="link">
            {{ t(textString + "tableHeader.wayType.link") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 链接 -->
      <a-form-item
        :label="t(textString + 'tableHeader.link_urls')"
        v-if="formData.wayType == 'link'"
      >
        <UploadInput prop="link_urls" />
      </a-form-item>

      <!-- 浏览数量 -->
      <a-form-item :label="t(textString + 'tableHeader.see_count')" v-else>
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

      <!-- 评论内容 -->
      <a-form-item :label="t(textString + 'tableHeader.comment_content')">
        <UploadInput prop="comment_content" />
      </a-form-item>

      <a-form-item :label="t(textString + 'tableHeader.duration_stay')">
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
