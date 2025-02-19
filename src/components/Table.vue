<script setup>
import { useI18n } from "vue-i18n";
import { ref, inject, computed, watch } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useStore } from "@/store";
const {
  tableData,
  listQuery,
  tableTitle,
  getTableData,
  operationWidth,
  isNoDeviceTable,
} = inject("tableConfig");
const emit = defineEmits(["handleSelChange"]);

// console.log(tableData);

// function dataHandle(data) {
//   if (typeof data === "string") return data;
//   for (const key in data) {
//     if (typeof data[key] === "object") {
//       data[key] = dataHandle(data[key]);
//     }
//   }
// }

const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const store = useStore();

const [id, ...tableTitleData] = tableTitle;

//如果tableTitleData 中存在任务状态，则添加任务状态的模板
tableTitleData.forEach((item) => {
  if (item.prop === "status") {
    // item.template = (row) => {
    //   return `<div id="${item.platformTask}_status_${row.id}" class="message_status"> ${
    //     !row.status ? t(publicString + "notRuning") : row.status
    //   } </div>`;
    // };
    item.template = (row) => {
      return getTaskStatus(row)
        ? setTaskStatusLable(getTaskStatus(row).status)
        : "未运行";
    };
  } else if (item.prop === "details") {
    item.template = (row) => {
      return getTaskStatus(row) ? getTaskStatus(row).details : "";
    };
  }
});

function getTaskStatus(row) {
  if (store.taskRunStatusData.length > 0)
    return store.taskRunStatusData.filter((item) => {
      return item.taskId == row.id;
    })[0];
}

const setTaskStatusLable = (status) => {
  //运行状态：1=未运行 2=运行中 3=运行结束 4=运行异常
  switch (status) {
    case 1:
      return "未运行";
    case 2:
      return "运行中";
    case 3:
      return "运行结束";
    case 4:
      return "运行异常";
    default:
      return "未运行";
  }
};

let tableItem = computed(() => {
  return [id, ...tableTitleData];
});
let hasTable = ref(true); //是否有表格

async function changePagination(e) {
  hasTable.value = false;
  listQuery.page = e;
  await getTableData();
  hasTable.value = true;
}

//选择任务
const handleSelChange = (val) => {
  emit("handleSelChange", val);
};

//查看投屏
const viewScreenCastingFn = (row) => {
  console.log(row);
};

const { width } = useWindowSize();

//监听任务运行状态数据
watch(store.taskRunStatusData, (row) => {
  tableData.value.forEach((item) => {
    if (item.id == row.taskId) {
      item.status = row.status;
      item.details = row.details;
    }
  });
});
</script>

<template>
  <div class="filter-container">
    <!-- <ElInput
      v-model="listQuery.grouping_name"
      size="small"
      style="width: 240px"
      :placeholder="t(publicString + 'search')"
      @keyup.enter="getTableData"
      @change="getTableData"
    >
      <template #append>
        <LzyIcon @click="getTableData" name="gg:search" align="-7px"></LzyIcon>
      </template>
    </ElInput> -->

    <slot name="taskButtonList"></slot>
  </div>
  <ElTable
    :data="tableData"
    fit
    class="chuhaitable"
    highlight-current-row
    row-key="id"
    style="width: 100%"
    v-if="hasTable"
    @selection-change="handleSelChange"
  >
    <ElTableColumn type="selection" width="55" />

    <ElTableColumn
      v-for="(title, t) in tableItem"
      :key="t"
      show-overflow-tooltip
      :prop="title.prop"
      :align="title.align != null ? title.align : 'center'"
      :width="title.width"
    >
      <template #header>
        <span v-if="typeof title.label === 'string'">{{ title.label }}</span>
        <span v-else v-html="title.label()"></span>
      </template>
      <template v-slot="scope">
        <!-- 检查是否有模板函数 -->
        <span v-if="title.template" v-html="title.template(scope.row)"></span>
        <!-- 否则显示默认内容 -->
        <span v-else>{{ scope.row[title.prop] }}</span>
      </template>
    </ElTableColumn>
    <slot name="column"></slot>
    <ElTableColumn
      :label="t(publicString + 'operation')"
      align="center"
      :width="operationWidth ? operationWidth : '160'"
      class-name="small-padding fixed-width"
      :fixed="width < 800 ? false : 'right'"
    >
      <template #default="scope">
        <slot name="operation" :row="scope.row"></slot>
        <!-- <ElButton @click="viewScreenCastingFn(scope.row)" type="primary">
          {{ t(btnString + "viewScreenCasting") }}
        </ElButton> -->
      </template>
    </ElTableColumn>
  </ElTable>
  <div class="loader" v-else>
    <div class="loaderItem"></div>
  </div>
  <!-- 分页 -->
  <div class="pagination">
    <ElPagination
      v-show="listQuery.total > 0"
      background
      layout="prev, pager, next"
      :total="listQuery.total"
      :default-page-size="listQuery.pageSize"
      @current-change="changePagination"
    />
  </div>
</template>

<style >
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loaderItem {
  width: 44.8px;
  height: 44.8px;
  color: #554cb5;
  position: relative;
  background: radial-gradient(11.2px, currentColor 94%, #0000);
}

.loaderItem:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(10.08px at bottom right, #0000 94%, currentColor) top left,
    radial-gradient(10.08px at bottom left, #0000 94%, currentColor) top right,
    radial-gradient(10.08px at top right, #0000 94%, currentColor) bottom left,
    radial-gradient(10.08px at top left, #0000 94%, currentColor) bottom right;
  background-size: 22.4px 22.4px;
  background-repeat: no-repeat;
  animation: loader 1.5s infinite cubic-bezier(0.3, 1, 0, 1);
}

@keyframes loader {
  33% {
    inset: -11.2px;
    transform: rotate(0deg);
  }

  66% {
    inset: -11.2px;
    transform: rotate(90deg);
  }

  100% {
    inset: 0;
    transform: rotate(90deg);
  }
}

@media screen and (max-width: 640px) {
  .filter-container {
    flex-wrap: wrap;

    .el-input {
      flex: 1 0 100%;
    }

    .el-button {
      flex: 1;
    }
  }
}
</style>
