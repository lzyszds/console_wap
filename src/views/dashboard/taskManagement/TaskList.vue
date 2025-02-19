<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/task/mainTask";
import { getGroupList } from "@/api/device/group";
import { useResetableForm, handleDelFn, onSubmitForm, getTaskListDataFn } from "@/utils";

import _ from "lodash";

import { useI18n } from "vue-i18n";
import { taskRun } from "@/api/task/run";

import tiktok from "@/api/task/tiktok";
import douyin from "@/api/task/douyin";
import whatsApp from "@/api/task/whatsApp";
import snapchat from "@/api/task/snapchat";
import line from "@/api/task/line";
import instagram from "@/api/task/instagram";
import router from "@/router";
import { computed } from "vue";

const interfaceApi = { tiktok, douyin, whatsApp, snapchat, line, instagram };

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskManagement.children.taskList.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

let action = ref("add");
let dialogFormVisible = ref(false);

const navigation = router.options.routes;
const name = t("navigation.dashboard.taskParams.title");
const taskAppTypeList = navigation.filter((item) => item.name == name)[0].children;

const defaultFormData = {
  id: "",
  grouping_id: "",
  type: "",
  task_name: "",
  taskId: {},
};
const { form: formData, reset: clearFormData, assign: assignFormData } = useResetableForm(
  defaultFormData
);

const rowArr = ref([]);
const taskIdList = ref([]);
const taskListAll = ref({});
const groupList = ref([]);
const renwuList = ref([]);
const listLoading = ref(false);

const listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  platform: "tiktok",
  taskName: "yanghao",
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
    label: () => t(btnString + "editTask"),
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
  {
    label: () => t(btnString + "startTask"),
    icon: "mage:play-circle",
    callback: (item) => handleTask("startUp", item),
    type: "start",
    /* 是否显示 */
    show: true,
  },
  {
    label: () => t(btnString + "stopTask"),
    icon: "mage:stop-circle",
    callback: (item) => handleTask("stop", item),
    type: "stop",
    /* 是否显示 */
    show: true,
  },
];

const tableTitle = [
  { prop: "id", label: "ID" },
  {
    prop: "platform",
    label: () => getLabel("platform"),
    template: (row) => {
      const { type } = deconTranscrpt(row);
      return type.join(",");
    },
  },
  {
    prop: "taskName",
    label: () => getLabel("taskName"),
    template: (row) => {
      try {
        const { taskName } = deconTranscrpt(row);

        return taskName.map((res) => getTaskName(res).split("♾️")[1]).join(",");
      } catch (e) {}
    },
  },
  {
    prop: "taskId",
    label: () => getLabel("taskId"),
    template: (row) => {
      const { taskId } = deconTranscrpt(row);
      return Object.values(taskId).join(",");
    },
  },
  { prop: "status", label: () => getLabel("status") },
  { prop: "create_time", label: () => getLabel("create_time") },
];

provide("paramsData", {
  listQuery,
  tableData: renwuList,
  getTableData,
  tableTitle,
  editParams,
  cardTitle: "title",
});

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
});

const taskNameList = computed(() => {
  if(!formData.type) return [];
  const list = taskAppTypeList
    .find((res) => res.path == formData.type).children
    .map((task, index) => ({
      label: task.namePath,
      value: formData.type + "-" + task.path,
    }));
    console.log(list);
    
  return list;
});

// 任务名称改变 请求当前任务的所有id
const changeTaskName = async () => {
  if (!formData.task_name || !formData.type) return;
  taskListAll.value = {};
  formData.taskId = {};

  /* 单选 */
  for (let item of [formData.task_name]) {
    const taskType = item.split("-")[0];
    const taskName = item.split("-")[1];

    const { data } = await interfaceApi[taskType][taskName].getDataList({
      page: 1,
      pageSize: 1000,
    });
    taskListAll.value = data.data.list;
  }

  /* 多选 */
  // for (let item of formData.task_name) {
  //   const taskType = item.split("-")[0];
  //   const taskName = item.split("-")[1];

  //   const { data } = await interfaceApi[taskType][taskName].getDataList({
  //     page: 1,
  //     pageSize: 1000,
  //   });
  //   taskListAll.value[item] = data.data.list;
  // }
};

watch(
  () => formData.task_name,
  async () => {
    await changeTaskName();
  },
  { deep: true }
);
watch(
  () => formData.type,
  async () => {
    await changeTaskName();
  },
  { deep: true }
);

//根据任务value值获取任务名称
function getTaskName(taskValue) {
  if (!taskValue) return;

  //比如说 yanghao 返回 一键养号
  const taskName = taskAppTypeList
    .find((res) => res.path == taskValue.split("-")[0])
    .children.find((res) => res.path == taskValue.split("-")[1]).name;
  const taskType = taskValue.split("-")[0];
  return taskType + "♾️" + t(taskName);
}

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

const getGroupListFn = async () => {
  const res = await getGroupList();
  groupList.value = res.data.data.list;
};

const handleCreate = async (act, row) => {
  action.value = act;
  await getGroupListFn();
  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {});
    let taskId = {};

    /* 单选 */
    //将transcript 转为formdata中对应的值
    const taskName = Object.keys(row.transcript)[0];
    formData.type = taskName;
    formData.task_name = taskName + "-" + row.transcript[taskName][0].taskName;
    taskId = {
      [taskName + "-" + row.transcript[taskName][0].taskName]: Number(
        row.transcript[taskName][0].taskId
      ),
    };
    /* 多选 */
    // const { type, taskId, taskName } = deconTranscrpt(row);

    // formData.type = type;
    // formData.task_name = taskName;

    setTimeout(() => {
      formData.taskId = taskId;
    }, 300);
  }
  dialogFormVisible.value = true;
};

function deconTranscrpt(row) {
  const type = Object.keys(row.transcript);
  const taskId = {};
  let taskName;
  //将transcript 转为formdata中对应的值
  type.forEach((item) => {
    taskName = row.transcript[item].map((_item) => {
      taskId[item + "-" + _item.taskName] = Number(_item.taskId);
      return item + "-" + _item.taskName;
    });
  });
  return {
    type,
    taskId,
    taskName,
  };
}

const onSubmit = async () => {
  //如果是指定博主 则必须填写博主id
  let transcript = {};
  [formData.type].forEach((item) => {
    transcript[item] = [];
    for (let key in formData.taskId) {
      transcript[item].push({
        taskName: key.split("-")[1],
        platform: item,
        taskId: formData.taskId[key],
      });
    }
  });

  onSubmitForm({
    form: Object.assign({}, formData, { transcript }), //formData.transcript
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter: () => {
      return true;
    },
  }).then((res) => {
    dialogFormVisible.value = res;
  });
};

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
}, 300);

//启动任务
const handleTask = _.debounce(async (...arg) => {
  const [taskType, row] = arg;

  taskRun({
    taskId: row.id,
    taskType,
  });
}, 300);
</script>

<template>
  <ListCard />

  <RecordPop :columns="[8, 20]" noNotesName>
    <template #listForm>
      <!-- 分组 -->
      <a-form-item :label="getLabel('grouping_id')">
        <a-select v-model:value="formData.grouping_id">
          <a-select-option v-for="item in groupList" :key="item.id" :value="item.id">
            {{ item.title }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 任务平台 -->
      <a-form-item :label="getLabel('platform')">
        <a-select v-model:value="formData.type">
          <a-select-option
            v-for="item in taskAppTypeList"
            :key="item.path"
            :value="item.path"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- 任务名称 -->
      <a-form-item :label="getLabel('taskName')">
        <a-select v-model:value="formData.task_name" :options="taskNameList" />
      </a-form-item>
      <!-- 任务id -->
      <a-form-item :label="getTaskName(formData.task_name)" v-if="formData.task_name">
        <a-select v-model:value="formData.taskId[formData.task_name]">
          <a-select-option v-for="task in taskListAll" :key="task.id" :value="task.id">
            {{ "id:" + task.id + " ---" + task.notes_name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </template>

    <!-- 右下角保存 -->
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
