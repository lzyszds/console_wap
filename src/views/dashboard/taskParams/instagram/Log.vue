<script setup>
import { getDataList, getDetail } from "@/api/task/instagram/log";
import { useWindowSize } from "@vueuse/core";
const logData = ref([]);
const logDetail = ref({});
const logDialogVisible = ref(false);
const logListQuery = reactive({
  page: 1,
  pageSize: 12,
  title: "日志列表",
});
const getData = async () => {
  const result = await getDataList(logListQuery);
  logData.value = result.data.data;
};
getData();
async function getLog(row) {
  const result = await getDetail({
    id: row.id,
  });

  logDialogVisible.value = true;
  logDetail.value = result.data;
}

async function changePagination(e) {
  logListQuery.page = e;
  await getData();
}

const { width } = useWindowSize();
const getStyle = computed(() => {
  if (width.value < 600) {
    return {
      height: "600px",
      width: "85vw",
      position: "absolute",
      top: "20px",
      left: "20px",
    };
  } else if (width.value < 700) {
    return {
      width: width.value - 140 + "px",
    };
  } else {
    return {
      width: width.value - 260 + "px",
    };
  }
});

const columns = computed(() => [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
    width: 80,
    align: "center",
  },
  {
    title: "文件名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "文件地址",
    dataIndex: "url",
    key: "url",
  },
  {
    title: "生成时间",
    dataIndex: "create_time",
    key: "create_time",
    minWidth: 500,
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 100,
    align: "center",
  },
]);
</script>

<template>
  <div :style="getStyle" class="tableLog">
    <a-table
      class="logTable"
      :bordered="true"
      :data-source="logData.list"
      :columns="columns"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-button type="primary" @click="getLog(record)">查看</a-button>
        </template>
      </template>
    </a-table>
    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        v-model:current="logListQuery.page"
        show-less-items
        :page-size="logListQuery.pageSize"
        :total="logData.total"
        :show-total="(total) => `Total ${total} items`"
        @change="changePagination"
      />
    </div>

    <a-modal v-model:open="logDialogVisible" title="日志详情" width="50%">
      <div style="max-height: 70vh; overflow-y: scroll">
        <pre>{{ logDetail }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.tableLog {
  background-color: #fff;
  padding: 16px;
  border-radius: 10px;
}
.logTable {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  :deep(div, b, button, button span) {
    user-select: text !important;
  }
  pre {
    white-space: pre-wrap;
  }
}
:deep(.ant-table-thead) {
  .ant-table-cell {
    /* 不换行 */
    white-space: nowrap;
  }
}
</style>
