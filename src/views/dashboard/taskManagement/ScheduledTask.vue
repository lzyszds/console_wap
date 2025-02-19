<script setup>
import { addData, editData, getDataList, deleteData } from "@/api/schedule";
import router from "@/router";
import _ from "lodash";
import {
  useResetableForm,
  handleDelFn,
  onSubmitForm,
  getTaskListDataFn,
  convertToCronString,
  convertCronToChinese,
  convertCronToArray,
  setMessage,
} from "@/utils";

import tiktok from "@/api/task/tiktok";
import douyin from "@/api/task/douyin";
import whatsAoo from "@/api/task/whatsApp";
import snapchat from "@/api/task/snapchat";
import { useI18n } from "vue-i18n";
import { watch } from "vue";

const interfaceApi = { tiktok, douyin, whatsAoo, snapchat };

const { t, locale } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.taskManagement.children.scheduledTask.";

const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const name = t("navigation.dashboard.taskParams.title");
const navigation = router.options.routes;
const taskAppTypeList = navigation.filter((item) => item.name == name)[0].children;

const defaultFormData = {
  id: "",
  type: "tiktok", //平台
  task_name: "", //任务名称
  task_id: "", //任务id
  schedule_task_name: "", //计划定时任务名称
  execute_cycle: "", //执行周期
  execute_time: ["week", "", "", ""], //执行时间
  schedule_status: 0, //任务状态 是否执行
  create_time: "", //创建时间
  execution_frequency: 0, //执行次数
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

const taskIdList = ref([]); //任务id列表
const isRequest = ref(false); //是否请求中

const taskNameList = computed(() => {
  return taskAppTypeList
    .filter((item) => item.path == formData.type)[0]
    .children.map((item) => {
      return {
        name: item.name,
        value: item.path,
      };
    });
});

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
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
  isNoDeviceTable: true,
  editParams,
  cardTitle: "schedule_task_name",
  tableTitle: [
    { prop: "id", label: "ID" },
    { prop: "type", label: "任务平台" },
    { prop: "task_id", label: "任务ID" },
    {
      prop: "task_name",
      label: "任务名称",
      template: (row) => {
        if (!row.task_name) return "";
        //如果这里报错，请去dashboardComponentList.js中添加对应的任务key
        return t(
          taskNameList.value.filter((item) => item.value == row.task_name)[0].name
        );
      },
    },
    {
      prop: "execute_cycle",
      label: "执行周期",
      template: (row) => {
        return convertCronToChinese(row.execute_cycle);
      },
    },
    {
      prop: "execution_frequency",
      label: "执行次数",
      template: (row) => (row.execution_frequency == 0 ? "重复执行" : "执行一次"),
    },
    {
      prop: "schedule_status",
      label: "任务状态",
      template: (row) => (row.schedule_status == 0 ? "停用" : "执行"),
    },
    { prop: "create_time", label: "创建时间" },
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
    listLoading.value = false;
  });
}

getTableData();

const handleCreate = async (act, row) => {
  action.value = act;

  dialogFormVisible.value = true;

  if (act == "add") {
    clearFormData();
  } else if (act == "edit") {
    assignFormData(row, {
      device_number_arr: (value) => value.split(","),
      task_id: (value) => Number(value),
    });
    formData.execute_time = convertCronToArray(row.execute_cycle);
  }
};

const onSubmit = async () => {
  try {
    formData.execute_cycle = convertToCronString(formData.execute_time);
  } catch (e) {
    setMessage("error", e.message);
    return;
  }
  onSubmitForm({
    form: { ...formData },
    action: action.value,
    addDateForm: addData,
    editDateForm: editData,
    getTableData: getTableData,
    checkParameter,
  }).then((res) => {
    dialogFormVisible.value = res;
    ipcRenderer.send("updateCronTaskList", JSON.stringify(formData));
  });
};

function checkParameter() {
  const isCondition = {
    type: "请选择任务平台",
    task_name: "请选择任务名称",
    task_id: "请输入任务ID",
    schedule_task_name: "请输入计划名称",
  };
  for (const key in isCondition) {
    if (!formData[key]) {
      setMessage("error", isCondition[key]);
      return false;
    }
  }
  return true;
}

function checkNumberExceed() {
  if (formData.execute_time[0] == "week" && formData.execute_time[1] > 7) {
    setMessage("error", "星期不能大于7");
    return false;
  }
  if (formData.execute_time[0] == "day" && formData.execute_time[1] > 31) {
    setMessage("error", "日数不能大于31");
    return false;
  }

  if (formData.execute_time[2] > 24) {
    setMessage("error", "小时不能大于24");
    return false;
  }

  if (formData.execute_time[3] > 60) {
    setMessage("error", "分钟不能大于60");
    return false;
  }
  return true;
}

//防抖 避免频繁操作 删除多个任务
const handleDel = _.debounce(() => {
  handleDelFn.call(this, [...rowArr.value], deleteData, getTableData);
  //先停用定时任务 避免删除后还在执行
  for (const item of rowArr.value) {
    item.schedule_status = 0;
    ipcRenderer.send("updateCronTaskList", JSON.stringify(item));
  }
}, 300);

//执行任务 修改表格中的数据
const handleTask = _.debounce((...arg) => {
  arg[1].schedule_status = arg[0] == "startUp" ? 1 : 0;
  editData({
    ...arg[1],
    id: arg[1].id,
  }).then((res) => {
    getTableData();
    ipcRenderer.send("updateCronTaskList", JSON.stringify(arg[1]));
  });
}, 300);

// 任务名称改变 请求当前任务的所有id
const changeTaskName = () => {
  if (!formData.task_name || !formData.type) return;
  interfaceApi[formData.type][formData.task_name]
    .getDataList({
      page: 1,
      pageSize: 1000,
    })
    .then((res) => {
      taskIdList.value = res.data.data.list.map((item) => {
        console.log(item);

        return {
          id: item.id,
          value: item.notes_name,
        };
      });
    });
};
watch(
  () => formData.task_name,
  (newVal) => changeTaskName()
);
watch(
  () => formData.type,
  (newVal) => changeTaskName()
);

watch(
  () => formData.execute_time[1],
  (newVal) => {
    if (formData.execute_time[1] == 0) {
      formData.execute_time[1] = 1;
    }
  },
  { deep: true }
);
</script>

<template>
  <ListCard />
  <RecordPop>
    <template #listForm>
      <a-form-item :label="getLabel('taskType')">
        <a-select v-model:value="formData.type">
          <a-select-option
            v-for="item in taskAppTypeList"
            :key="item.key"
            :value="item.key"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="getLabel('taskName')">
        <a-select v-model:value="formData.task_name">
          <a-select-option
            v-for="item in taskNameList"
            :key="item.value"
            :value="item.value"
          >
            {{ t(item.name) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="getLabel('taskId')">
        <a-select v-model:value="formData.task_id">
          <a-select-option v-for="item in taskIdList" :key="item.id" :value="item.id">
            {{ "id:" + item.id + "---" + item.value }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="getLabel('executeTime')">
        <div class="execute_cycle">
          <a-select v-model:value="formData.execute_time[0]" style="grid-area: select">
            <a-select-option
              v-for="item in [
                { name: getLabel('taskTimeTypeList.0'), value: 'day' },
                { name: getLabel('taskTimeTypeList.1'), value: 'week' },
                { name: getLabel('taskTimeTypeList.2'), value: 'month' },
              ]"
              :key="item.value"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>

          <a-select
            v-model:value="formData.execute_time[1]"
            style="width: 100px"
            v-if="formData.execute_time[0] == 'week'"
          >
            <a-select-option
              v-for="(item, index) in Array(7)"
              :key="index"
              :value="index + 1"
            >
              {{ getLabel("weekList." + index) }}
            </a-select-option>
          </a-select>
          <a-input-number
            v-model:value="formData.execute_time[1]"
            v-if="formData.execute_time[0] == 'month'"
            :max="31"
            :min="1"
          >
            <template #addonAfter> {{ getLabel("day") }} </template>
          </a-input-number>
          <a-input-number v-model:value="formData.execute_time[2]" :max="23" :min="0">
            <template #addonAfter> {{ getLabel("hour") }} </template>
          </a-input-number>
          <a-input-number v-model:value="formData.execute_time[3]" :max="59" :min="0">
            <template #addonAfter> {{ getLabel("minute") }} </template>
          </a-input-number>
        </div>
      </a-form-item>
      <a-form-item :label="getLabel('executeCount')">
        <a-radio-group v-model:value="formData.execution_frequency">
          <a-radio :value="0"> 重复执行 </a-radio>
          <a-radio :value="1"> 执行一次 </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="getLabel('taskStatus')">
        <a-radio-group v-model:value="formData.schedule_status">
          <a-radio :value="0"> 停用 </a-radio>
          <a-radio :value="1"> 执行 </a-radio>
        </a-radio-group>
      </a-form-item>
    </template>
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style scoped>
.execute_cycle {
  display: grid;
  grid-template-areas:
    "select select select"
    "hour minute second";
  gap: 10px;
}
:deep(.el-input-group__append),
:deep(.el-input-group__prepend) {
  padding: 0 10px !important;
}
</style>
