<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/snapchat/yanghao";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  setMessage,
} from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.snapchat.children.yanghao.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "", //id
  notes_name: "", // 分组
  wayType: ["gs"], // 养号类型 gs是故事 jgd是聚光灯
  see_count: 3, //浏览数量
  follow_probability: 50, //关注概率
  like_probability: 50, //点赞概率
  hair_comment_probability: 50, //发评论概率
  comment_content: "", //评论内容
  collectProbability: 50, //收藏概率
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
  { prop: "notes_name", label: () => getLabel("notes_name") },
  {
    prop: "wayType",
    label: t(textString + "tableHeader.wayType.title"),
    template: (row) => {
      return row.wayType.join(" / ").replace("gs", "故事养号").replace("jgd", "聚光灯养号");
    },
  },
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
    prop: "see_count",
    label: t(textString + "tableHeader.see_count"),
    template: (row) => {
      return row.see_count + "次";
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
  labelWidth: 200,
  viewWidth: "40%",
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
  formData.duration_stay = [formData.duration_stay_start, formData.duration_stay_end];
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: formData,
    action: action.value,
    checkParameter: () => {
      if (formData.wayType.length === 0) {
        setMessage(
          "error",
          t(textString + "tableHeader.wayType.title") + t(publicString + "empty")
        );
        return false;
      }
      return true;
    },
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
      <!-- 养号类型 -->
      <a-form-item :label="t(textString + 'tableHeader.wayType.title')">
        <a-checkbox-group v-model:value="formData.wayType" button-style="solid">
          <a-checkbox value="gs">
            {{ t(textString + "tableHeader.wayType.gs") }}
          </a-checkbox>
          <a-checkbox value="jgd">
            {{ t(textString + "tableHeader.wayType.jgd") }}
          </a-checkbox>
        </a-checkbox-group>
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

      <!-- 浏览数量 -->
      <a-form-item :label="t(textString + 'tableHeader.see_count')">
        <a-input-number v-model:value="formData.see_count" :min="1" />
      </a-form-item>

      <!-- 评论内容 -->
      <a-form-item :label="t(textString + 'tableHeader.comment_content')">
        <a-input v-model:value="formData.comment_content" />
      </a-form-item>

      <!-- 停留时长 -->
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
