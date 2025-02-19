<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/line/AddFriend";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  convertString,
} from "@/utils";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskParams.line.children.addFriend.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const AddFriendWayList = ref([
  //关注方式列表
  // { label: "搜索添加-好友手机号", value: "0" },
  { label: t(textString + "tableHeader.AddFriendWayList.0"), value: "1" },
  { label: t(textString + "tableHeader.AddFriendWayList.1"), value: "2" },
  { label: t(textString + "tableHeader.AddFriendWayList.2"), value: "3" },
  // { label: "通讯录", value: "4" },
  { label: t(textString + "tableHeader.AddFriendWayList.3"), value: "5" },
]);

const defaultFormData = {
  id: "", //任务ID
  notes_name: "", //参数备注
  type: "line", //应用类型
  AddFriend_way: "1", //添加方式
  regulation: "0", //单独设置id
  friends_ids: "", //好友ID
  friends_phone: "", //好友手机号
  message_content: "", //私信消息内容
  add_total_number: 10, //添加好友总数
  AddFriend_time: [5, 10], //间隔时长
  duration_stay_start: 5, //间隔时长 开始
  duration_stay_end: 10, //间隔时长 结束
  addFrends_atuo_setting: 0, //自动添加好友 0=关 1=开
  addFrends_allow_setting: 0, //允许添加好友 0=关 1=开
};

const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

let action = ref("add"); //弹窗表单 操作类型
let dialogFormVisible = ref(false); //弹窗显示隐藏
const rowArr = ref([]); //选中的行
let renwuList = ref([]); //分组列表
let listLoading = ref(false); //任务列表加载状态

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "line",
  taskName: "AddFriend",
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
    { prop: "id", label: "ID"},
    {
      prop: "AddFriend_way",
      label: t(textString + "tableHeader.AddFriend_way"),
      width: 180,
    },
    {
      prop: "friends_ids",
      label: t(textString + "tableHeader.friends_ids"),
      width: 180,
      template: (row) => convertString(row.friends_ids),
    },
    {
      prop: "friends_phone",
      label: t(textString + "tableHeader.friends_phone"),
      width: 180,
      template: (row) => convertString(row.friends_phone),
    },
    {
      prop: "message_content",
      label: t(textString + "tableHeader.message_content"),
      width: 180,
      template: (row) => convertString(row.message_content),
    },
    {
      prop: "add_total_number",
      label: t(textString + "tableHeader.add_total_number"),
      width: 120,
    },
    {
      prop: "addFrends_atuo_setting",
      label: t(textString + "tableHeader.addFrends_atuo_setting"),
      width: 120,
      template: (row) => (row.addFrends_atuo_setting == "0" ? "关" : "开"),
    },
    {
      prop: "addFrends_allow_setting",
      label: t(textString + "tableHeader.addFrends_allow_setting"),
      width: 120,
      template: (row) => (row.addFrends_allow_setting == "0" ? "关" : "开"),
    },

    {
      prop: "AddFriend_time",
      label: t(textString + "tableHeader.AddFriend_time"),
      width: 180,
    },
    {
      prop: "status",
      label: t(textString + "tableHeader.status"),
      width: 180,
      platformTask: "line_AddFriend",
    },
    { prop: "create_time", label: t(textString + "tableHeader.create_time"), width: 180 },
  ],
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
  labelWidth: "120px",
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
    setTimeout(() => {
      assignBefore(row);
    }, 50);
  }
  dialogFormVisible.value = true;
};

const onSubmit = async () => {
  onSubmitForm({
    form: formData,
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    postFormBefore: postBefore,
    checkParameter: ({checkWhole}) => {
      postBefore(formData);
      let checkArr = [];
      if (isShow([1])) {
        checkArr = [
          checkWhole("friends_ids", t(textString + "tableHeader.friends_ids")),
          checkWhole("message_content", t(textString + "tableHeader.message_content")),
        ];
      } else if (isShow([3])) {
        checkArr = [
          checkWhole("message_content", t(textString + "tableHeader.message_content")),
        ];
      }
      if (!checkArr.every((item) => item)) return false;
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};
//编辑表单前
function assignBefore(row) {
  formData.duration_stay_start = row.AddFriend_time.split(",")[0];
  formData.duration_stay_end = row.AddFriend_time.split(",")[1];
}

//提交前
function postBefore(form) {
  form.AddFriend_time = form.duration_stay_start + "," + form.duration_stay_end;
}

function isShow(arr) {
  return arr.includes(Number(formData.AddFriend_way));
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
      <!-- 添加方式 -->
      <a-form-item :label="t(textString + 'tableHeader.AddFriend_way')">
        <a-select
          v-model:value="formData.AddFriend_way"
          allow-clear
          :collapse-tags="true"
          :maxTagCount="1"
        >
          <a-select-option
            v-for="item in AddFriendWayList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!--  -->
      <template v-if="isShow([0, 1, 3])">
        <a-form-item
          class="bloggerID"
          :label="t(textString + 'tableHeader.friends_ids')"
          v-if="isShow([1, 2])"
        >
          <div class="idsItem">
            <a-textarea v-model:value="formData.friends_ids" />
          </div>
        </a-form-item>
        <a-form-item
          class="bloggerID"
          :label="t(textString + 'tableHeader.message_content')"
        >
          <div class="idsItem">
            <a-textarea v-model:value="formData.message_content" />
          </div>
        </a-form-item>
      </template>

      <!-- 添加好友总数 -->
      <a-form-item :label="getLabel('add_total_number')" v-if="isShow([1, 2, 3])">
        <a-input-number v-model:value="formData.add_total_number" :min="1" />
      </a-form-item>

      <!-- 间隔秒数 -->
      <a-form-item :label="getLabel('AddFriend_time')" v-if="isShow([1, 2, 3])">
        <div class="input-group">
          <a-input-number v-model:value="formData.duration_stay_start" :min="1" />
          ~
          <a-input-number v-model:value="formData.duration_stay_end" :min="1" />
        </div>
      </a-form-item>

      <!-- 自动添加好友 -->
      <a-form-item :label="getLabel('addFrends_atuo_setting')" v-if="isShow([5])">
        <a-switch
          v-model:value="formData.addFrends_atuo_setting"
          :checked-value="'1'"
          :un-checked-value="'0'"
        />
      </a-form-item>

      <!-- 允许添加好友 -->
      <a-form-item :label="getLabel('addFrends_allow_setting')" v-if="isShow([5])">
        <a-switch
          v-model:value="formData.addFrends_allow_setting"
          :checked-value="'1'"
          :un-checked-value="'0'"
        />
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
