<script setup>
import {
  addData,
  editData,
  getDataList,
  deleteData,
} from "@/api/task/snapchat/addFriend";

import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  allStopFn,
  onSubmitForm,
  getTaskListDataFn,
} from "@/utils";

import UploadInput from "@/components/paramsform/UploadInput";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.snapchat.children.addFriend.";

const getLabel = (key) => t(textString + "tableHeader." + key);

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //分组
  way: "tuijian", //关注方式 tuijian:推荐 txl:通讯录 account:账号id
  isChat: "0", //是否私聊 0 不私聊 1 是私聊
  chatType: 0, // 0:文本，1:图片 2:图文
  text: "", //文本消息
  account: "", //账号id
  imagesContent: "", //图片内容
  upload_content_arr: "",
  mediaSuffic: "", //图片后缀
  addNumber: [2, 5], //添加数量
  addGap: [5, 10], //添加间隔
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
  platform: "snapchat",
  taskName: "addfriend",
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

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  editParams,
  tableTitle: [
    { prop: "id", label: "ID" },
    {
      prop: "way",
      label: getLabel("wayType.title"),
      template: (row) =>
        row.way == "tuijian"
          ? getLabel("wayType.tuijian")
          : row.way == "txl"
          ? getLabel("wayType.txl")
          : getLabel("wayType.account"),
    },
    {
      prop: "addNumber",
      label: getLabel("addNumber"),
      template: (row) => row.addNumber.join(" - "),
    },
    {
      prop: "addGap",
      label: getLabel("addGap"),
      template: (row) => row.addGap.join(" - "),
    },
    {
      prop: "isChat",
      label: getLabel("chatType.isChat"),
      template: (row) =>
        row.isChat == 0 ? getLabel("chatType.no") : getLabel("chatType.yes"),
    },
    {
      prop: "chatType",
      label: getLabel("chatType.title"),
      template: (row) =>
        row.chatType == 0
          ? getLabel("chatType.text")
          : row.chatType == 1
          ? getLabel("chatType.image")
          : getLabel("chatType.text_image"),
    },
    {
      prop: "text",
      label: getLabel("text"),
    },
    {
      prop: "imagesContent",
      label: getLabel("imagesContent"),
      type: "image",
    },
    {
      prop: "account",
      label: getLabel("wayType.account"),
    },
    {
      prop: "create_time",
      label: getLabel("create_time"),
    },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: "110",
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
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: { ...formData },
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
      <!-- 添加方式 -->
      <a-form-item :label="getLabel('wayType.title')">
        <a-radio-group v-model:value="formData.way" button-style="solid">
          <a-radio-button value="tuijian">
            {{ getLabel("wayType.tuijian") }}
          </a-radio-button>
          <a-radio-button value="txl">
            {{ getLabel("wayType.txl") }}
          </a-radio-button>
          <a-radio-button value="account">
            {{ getLabel("wayType.account") }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- 添加数量 -->
      <a-form-item :label="getLabel('addNumber')" v-if="formData.way != 'account'">
        <a-input-number v-model:value="formData.addNumber[0]" :min="0" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.addNumber[1]" :min="0" />
      </a-form-item>

      <!-- 添加间隔 -->
      <a-form-item :label="getLabel('addGap')">
        <a-input-number v-model:value="formData.addGap[0]" :min="0" />
        &nbsp;&nbsp; - &nbsp;&nbsp;
        <a-input-number v-model:value="formData.addGap[1]" :min="0" />
      </a-form-item>

      <template v-if="formData.way == 'tuijian'">
        <!-- 是否强制聊天 -->
        <a-form-item :label="getLabel('chatType.isChat')">
          <a-radio-group v-model:value="formData.isChat" button-style="solid">
            <a-radio-button :value="0">
              {{ getLabel("chatType.no") }}
            </a-radio-button>
            <a-radio-button :value="1">
              {{ getLabel("chatType.yes") }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- 内容类型 -->
        <a-form-item :label="getLabel('chatType.title')">
          <a-radio-group v-model:value="formData.chatType" button-style="solid">
            <a-radio-button :value="0">
              {{ getLabel("chatType.text") }}
            </a-radio-button>
            <a-radio-button :value="1">
              {{ getLabel("chatType.image") }}
            </a-radio-button>
            <a-radio-button :value="2">
              {{ getLabel("chatType.text_image") }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- 文本消息 -->
        <a-form-item :label="getLabel('chatType.text')" v-if="formData.chatType != 1">
          <UploadInput prop="text"></UploadInput>
        </a-form-item>

        <!-- 上传内容 -->
        <a-form-item :label="getLabel('imagesContent')" v-if="formData.chatType != 0">
          <ImageSelect prop="imagesContent"></ImageSelect>
        </a-form-item>
      </template>

      <!-- 账号id -->
      <a-form-item v-if="formData.way == 'account'" :label="getLabel('wayType.account')">
        <UploadInput prop="account"></UploadInput>
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style scoped ></style>
