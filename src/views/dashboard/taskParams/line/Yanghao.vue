<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/line/yanghao";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";
import { message } from "ant-design-vue";

import _ from "lodash";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.line.children.yanghao.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "",
  type: "line",
  notes_name: "",
  wayType: 0, //0= today 1= 好友聊天 2= 群聊天
  search_name: "", //搜索关键词
  regulation: "0", //规则
  message_value: "", //消息内容

  duration_interval: [3, 5], //间隔时长
  duration_interval_start: 3, //间隔时长 开始
  duration_interval_end: 5, //间隔时长 结束

  duration_chat: [10, 15], //聊天时长
  duration_chat_start: 10, //聊天时长 开始
  duration_chat_end: 15, //聊天时长 结束

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
  platform: "line",
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

const wayTypeList = [
  t(textString + "tableHeader.wayTypeList.0"),
  t(textString + "tableHeader.wayTypeList.1"),
  t(textString + "tableHeader.wayTypeList.2"),
];

const tableTitle = [
  { prop: "id", label: "ID"},
  {
    prop: "wayType",
    label: t(textString + "tableHeader.wayType"),
    width: 100,
    template: (row) => wayTypeList[row.wayType],
  },
  {
    prop: "search_name",
    label: t(textString + "tableHeader.search_name"),
    width: 100,
    template: (row) => convertString(row.search_name),
  },
  {
    prop: "message_value",
    label: t(textString + "tableHeader.message_value"),
    template: (row) => convertString(row.message_value),
  },
  {
    prop: "duration_interval",
    label: t(textString + "tableHeader.duration_interval"),
    width: 100,
  },
  {
    prop: "duration_chat",
    label: t(textString + "tableHeader.duration_chat"),
    width: 100,
  },
  {
    prop: "number_maintenance_duration",
    label: t(textString + "tableHeader.number_maintenance_duration"),
    width: 100,
  },
  {
    prop: "status",
    label: t(textString + "tableHeader.status"),
    width: 100,
    platformTask: "line_yanghao",
  },
  { prop: "create_time", label: t(textString + "tableHeader.create_time"), width: 100 },
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

//获取话术类型
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

const onSubmit = async () => {
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: ({ checkWhole, checkSeparate }) => {
      console.log(formData);

      postBefore();
      /* 如果 wayType 为 1 或 2 则必须填写 搜索关键词 和 消息内容 */
      if (formData.wayType != 0) {
        if (!formData.search_name) {
          message.error(getLabel("search_name") + t(publicString + "empty"));
          return false;
        }
        if (!formData.message_value) {
          message.error(getLabel("message_value") + t(publicString + "empty"));
          return false;
        }
      }
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//编辑表单前
function assignBefore(row) {
  formData.duration_interval_start = row.duration_interval.split(",")[0];
  formData.duration_interval_end = row.duration_interval.split(",")[1];
  formData.duration_chat_start = row.duration_chat.split(",")[0];
  formData.duration_chat_end = row.duration_chat.split(",")[1];
}

//提交前
function postBefore() {
  formData.duration_interval = [
    formData.duration_interval_start,
    formData.duration_interval_end,
  ].join(",");
  formData.duration_chat = [
    formData.duration_chat_start,
    formData.duration_chat_end,
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
      <!-- 养好类型 -->
      <a-form-item :label="getLabel('wayType')">
        <a-radio-group v-model:value="formData.wayType" button-style="solid">
          <a-radio-button
            v-for="(item, index) in wayTypeList"
            :key="index"
            :value="index"
          >
            {{ item }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      
      <!-- 搜索关键词 -->
      <template v-if="formData.wayType != 0">
        <!-- 群名称 或 好友名称 -->
        <a-form-item
          :label="
            formData.wayType == 1 ? getLabel('friend_name') : getLabel('group_name')
          "
        >
          <a-input v-model:value="formData.search_name" />
        </a-form-item>
        <!-- 消息内容 -->
        <a-form-item :label="getLabel('message_value')">
          <div class="idsItem">
            <a-textarea
              v-model:value="formData.message_value"
              placeholder="haha,hello,hi"
            />
          </div>
        </a-form-item>
      </template>
      <!-- 间隔秒数 -->
      <a-form-item :label="getLabel('duration_interval')">
        <a-input-number v-model:value="formData.duration_interval_start" min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_interval_end" min="1" />
      </a-form-item>

      <!-- 聊天时长 -->
      <a-form-item :label="getLabel('duration_chat')" v-show="formData.wayType != 0">
        <a-input-number v-model:value="formData.duration_chat_start" min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.duration_chat_end" min="1" />
      </a-form-item>
      <!-- 养好时长 -->
      <a-form-item :label="getLabel('number_maintenance_duration')">
        <a-input-number min="1" v-model:value="formData.number_maintenance_duration" />
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
