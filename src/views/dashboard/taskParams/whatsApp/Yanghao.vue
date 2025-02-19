<script setup>
import { getHuaShuTypeList } from "@/api/task/tiktok/huashu";
import { addData, editData, getDataList, deleteData } from "@/api/task/whatsApp/yanghao";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  getHuaShuTypeListUtils,
  onSubmitForm,
  getTaskListDataFn,
  getTxtFileFn,
  convertString,
  setMessage,
} from "@/utils";

import _ from "lodash";
import { useI18n } from "vue-i18n";
import UploadInput from "@/components/paramsform/UploadInput.vue";

const { t } = useI18n();
const btnString = "navigation.btn.";
const publicString = "navigation.public.";
const textString = "navigation.dashboard.taskParams.whatsapp.children.yanghao.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const defaultFormData = {
  id: "", //id
  type: "whatsApp", //平台
  notes_name: "", //备注名称
  regulation: "0", //规则
  wayType: "0", // 养号类型
  friendPhone: "", // 好友手机号
  wsGroupName: "", // 设置群名称
  chatDuration: "", // 聊天时长
  chatDuration_start: 5, // 聊天时长 开始
  chatDuration_end: 10, // 聊天时长 结束
  chatInterva: "", // 聊天间隔时间/秒
  chatInterva_start: 5, // 聊天间隔时间 开始
  chatInterva_end: 10, // 聊天间隔时间 结束
  romdomMessage: "", // 随机信息
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

//多设备数据
const multDevdata = ref({
  0: { ...defaultFormData },
});

const rowArr = ref([]);
const huashuList = ref([]);
const renwuList = ref([]);
const listLoading = ref(false);

const listQuery = reactive({
  page: 1,
  pageSize: 14,
  total: 0,
  platform: "whatsApp",
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
    label: getLabel("wayType"),
    template: (row) => (row.wayType == 0 ? getLabel("friend") : getLabel("group")),
  },
  {
    prop: "friendPhone",
    label: t(textString + "tableHeader.friendPhone"),
    template: (row) => convertString(row.friendPhone),
  },
  {
    prop: "wsGroupName",
    label: t(textString + "tableHeader.wsGroupName"),
    template: (row) => convertString(row.wsGroupName),
  },
  { prop: "chatDuration", label: t(textString + "tableHeader.chatDuration"), width: 100 },
  { prop: "chatInterva", label: t(textString + "tableHeader.chatInterva"), width: 100 },
  { prop: "romdomMessage", label: t(textString + "tableHeader.romdomMessage") },
  {
    prop: "status",
    label: t(textString + "tableHeader.status"),
    width: 100,
    platformTask: "whatsApp_yanghao",
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
      device_number_arr: (value) => value.split(","),
    });
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  //需要转换的数据
  postBefore();
  //如果是指定博主 则必须填写博主id
  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      if (formData.wayType == 0) {
        if (formData.friendPhone == "") {
          setMessage(
            "error",
            /* 好友手机号不能留空 */
            getLabel("friendPhone") + t(publicString + "empty")
          );
          return false;
        }
      } else if (formData.wayType == 1) {
        if (formData.wsGroupName == "") {
          setMessage(
            "error",
            /* 群名称不能留空 */
            getLabel("wsGroupName") + t(publicString + "empty")
          );
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
  formData.chatDuration_start = row.chatDuration.split(",")[0];
  formData.chatDuration_end = row.chatDuration.split(",")[1];
  formData.chatInterva_start = row.chatInterva.split(",")[0];
  formData.chatInterva_end = row.chatInterva.split(",")[1];
}

//提交前
function postBefore() {
  formData.chatDuration = `${formData.chatDuration_start},${formData.chatDuration_end}`;
  formData.chatInterva = `${formData.chatInterva_start},${formData.chatInterva_end}`;
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
      <a-form-item :label="getLabel('wayType')">
        <a-radio-group v-model:value="formData.wayType"  button-style="solid">
          <a-radio-button value="0">
            {{ getLabel("friend") }}
          </a-radio-button>
          <a-radio-button value="1">
            {{ getLabel("group") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 搜索关键词 -->
      <a-form-item :label="getLabel('friendPhone')" v-if="formData.wayType == 0">
        <UploadInput prop="friendPhone"></UploadInput>
      </a-form-item>

      <!-- 群名称 -->
      <a-form-item :label="getLabel('wsGroupName')" v-if="formData.wayType == 1">
        <a-input v-model:value="formData.wsGroupName" />
      </a-form-item>

      <!-- 聊天时长 -->
      <a-form-item :label="getLabel('chatDuration')">
        <a-input-number v-model:value="formData.chatDuration_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.chatDuration_end" :min="1" />
      </a-form-item>

      <!-- 聊天间隔时间/秒 -->
      <a-form-item :label="getLabel('chatInterva')">
        <a-input-number v-model:value="formData.chatInterva_start" :min="1" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.chatInterva_end" :min="1" />
      </a-form-item>

      <!-- 随机信息 -->
      <a-form-item :label="getLabel('romdomMessage')">
        <UploadInput prop="romdomMessage"></UploadInput>
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
