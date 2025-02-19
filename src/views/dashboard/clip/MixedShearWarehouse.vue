<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import MixedShear from "@/components/clip/MixedShear.vue";

import { mixedList, mixedVideoDel } from "@/api/clip/mixed";
import { useRouter } from "vue-router";

import { useLocalStorage, useSessionStorage, useWindowSize } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue"; // Import message

const { t, locale } = useI18n();
const router = useRouter();
//使用本地存储来管理素材列表信息数据。
const matInfoData = useLocalStorage("matInfoData", {});
const { width } = useWindowSize();

//使用会话存储来管理组件索引。
const componentIndex = useSessionStorage("componentIndex", "1-1");

const dialogform = reactive({
  visible: false, //弹窗是否显示
  action: "add", //弹窗操作类型
  isHead: false, //是否是片头
  updateVisible: false, //上传素材弹窗是否显示
});

// 初始化任务列表和总数量的引用，用于数据展示和分页计算
let renwuList = ref([]);
let groupList = ref([]);
let total = ref(0);

// 定义查询条件的响应式对象，用于动态更新查询参数
let listQuery = reactive({
  page: 1, // 当前页码
  pageSize: 10, // 每页数量
  id_no: "", // 身份证号码
  status: "", // 状态
  title: "", // 标题
});

//  加载状态的引用
let listLoading = ref(false);

const columns = computed(() => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    sorter: true, // Enable sorting for this column
    align: "center",
    width: 80,
  },
  {
    title: "混剪名称",
    dataIndex: "yun_name",
    key: "yun_name",
    align: "center",
  },
  {
    title: "主标题",
    dataIndex: "yun_ftitle",
    key: "yun_ftitle",
    align: "center",
  },
  {
    title: "副标题",
    dataIndex: "yun_title",
    key: "yun_title",
    align: "center",
  },
  {
    title: "混剪数量",
    dataIndex: "yun_num",
    key: "yun_num",
    align: "center",
  },
  {
    title: "视频比例",
    dataIndex: "yun_size", // Combined width/height, see template
    key: "yun_size",
    align: "center",
  },
  {
    title: "创建时间",
    dataIndex: "create_time",
    key: "create_time",
    align: "center",
    width: 120,
  },
  {
    title: "操作",
    key: "operate",
    align: "center",
    width: 300,
  },
]);

//获取任务列表
async function handleGetDataList() {
  // 设置加载状态为true，显示加载中的指示器
  listLoading.value = true;
  // 调用后端接口获取任务列表数据
  let response = await mixedList(listQuery);
  // 检查响应状态码，确保请求成功
  if (response.data.status == 200) {
    // 清空当前任务列表
    // renwuList = []; // No need to clear
    // 更新任务列表数据
    renwuList.value = response.data.data.list;
    // 更新总数量，用于分页计算
    total.value = Number(response.data.data.total);
    // 设置加载状态为false，隐藏加载中的指示器
    listLoading.value = false;
  } else {
    message.error(response.data.msg);
  }
}
// 初始化时调用函数获取任务列表数据
handleGetDataList();

function changePagination(page, pageSize) {
  listQuery.page = page;
  listQuery.pageSize = pageSize;
  handleGetDataList();
}

const toMatList = async (data) => {
  matInfoData.value = data;
  router.push("/aiClip/mixedShearWarehouse/mixedShearWarehouseList");
};

const delMixedShear = async (row) => {
  Modal.confirm({
    title: "确定删除该混剪任务吗?",
    content: "提示",
    okText: "确定",
    cancelText: "取消",
    onOk: async () => {
      let response = await mixedVideoDel({ id: row.id });
      if (response.data.status == 200) {
        message.success("删除成功");
        handleGetDataList();
      } else {
        message.error("删除失败");
      }
    },
  });
};

const outputResult = () => {
  dialogform.visible = false;
  handleGetDataList();
};
function handleClose() {
  dialogform.visible = false;
}
onMounted(() => {});
</script>
<template>
  <div class="zycard-container">
    <div class="filter-container">
      <a-button type="primary" @click="dialogform.visible = true">
        {{ t("navigation.btn.createMixedShear") }}
      </a-button>
    </div>

    <!-- 内容列表 -->
    <a-table
      :loading="listLoading"
      :data-source="renwuList"
      :columns="columns"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'id'">
          <span>{{ record.id }}</span>
        </template>
        <template v-if="column.dataIndex === 'yun_name'">
          <span>{{ record.yun_name }}</span>
        </template>
        <template v-if="column.dataIndex === 'yun_ftitle'">
          <span>{{ record.yun_ftitle }}</span>
        </template>
        <template v-if="column.dataIndex === 'yun_title'">
          <span>{{ record.yun_title }}</span>
        </template>
        <template v-if="column.dataIndex === 'yun_num'">
          <span>{{ record.yun_num }}</span>
        </template>
        <template v-if="column.dataIndex === 'yun_size'">
          <span>{{ record.yun_width + "/" + record.yun_height }}</span>
        </template>
        <template v-if="column.dataIndex === 'create_time'">
          <span>{{ record.create_time }}</span>
        </template>
        <template v-if="column.key === 'operate'">
          <a-button type="primary" @click="toMatList(record)">
            {{ t("navigation.btn.sourceMaterial") }}
          </a-button>
          <a-button type="primary" @click="delMixedShear(record)">
            {{ t("navigation.btn.delete") }}
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        v-if="total > 0"
        v-model:current="listQuery.page"
        :page-size="listQuery.pageSize"
        :total="total"
        show-quick-jumper
        show-size-changer
        @change="changePagination"
        size="small"
      />
    </div>
  </div>
  <!-- 弹层 -->
  <a-modal
    v-model:open="dialogform.visible"
    title="创建高级混剪"
    :width="width < 500 ? '100%' : '900px'"
    :footer="null"
    @cancel="handleClose"
  >
    <mixed-shear @output-result="outputResult"></mixed-shear>
  </a-modal>
</template>

<style scoped></style>
