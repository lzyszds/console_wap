<script setup>
import { SelectionArea } from "@viselect/vue";
import { useStore } from "@/store";
import { array } from "js-md5";

const store = useStore();
const { taskRunStatusData } = storeToRefs(store);

const { width } = useWindowSize();

const isMobile = computed(() => width.value < 768);

// 获取参数数据
const paramsData = inject("paramsData");

// 获取表格数据
const { tableData, tableTitle, listQuery, cardTitle, getTableData } = paramsData;

const [addParams, ...editParams] = paramsData.editParams;

"iaisd".indexOf("a") == 1;

const selected = reactive(new Set());
const extractIds = (els) => {
  return els
    .map((v) => v.getAttribute("data-key"))
    .filter(Boolean)
    .map(Number);
};

const onStart = ({ event, selection }) => {
  if (!event?.ctrlKey && !event?.metaKey) {
    selection.clearSelection();
    selected.clear();
  }
};

const onMove = ({
  store: {
    changed: { added, removed },
  },
}) => {
  extractIds(added).forEach((id) => selected.add(id));

  extractIds(removed).forEach((id) => selected.delete(id));
};

//如果tableTitleData 中存在任务状态，则添加任务状态的模板
tableTitle.forEach((item) => {
  if (item.prop === "status") {
    item.template = (row) => {
      return getTaskStatus(row)
        ? setTaskStatusLable(getTaskStatus(row).status)[0]
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
      return ["未运行", "#bfbfbf"];
    case 2:
      return ["运行中", "#87d068"];
    case 3:
      return ["运行结束", "#2db7f5"];
    case 4:
      return ["运行异常", "#f50"];
    default:
      return ["未运行", "#bfbfbf"];
  }
};

//监听任务运行状态数据
watch(
  taskRunStatusData,
  (rows) => {
    if (!rows) return;

    tableData.value = tableData.value.map((item) => {
      Object.assign(item, rows.get(item.id));
      return item;
    });
  },
  {
    deep: true,
  }
);
</script>
<template>
  <main class="main-container">
    <SelectionArea
      class="card-container"
      :options="{ selectables: '.selectable' }"
      :onMove="onMove"
      :onStart="onStart"
    >
      <slot name="addParams"></slot>

      <a-card
        :bordered="false"
        hoverable
        @click="addParams.callback()"
        class="gridCenter"
      >
        <LzyIcon :name="addParams.icon" width="200" height="200" style="color: #eee" />
        <div class="add-params-title">
          <span v-if="typeof addParams.label == 'function'">{{ addParams.label() }}</span>
          <span v-else>{{ addParams.label }}</span>
        </div>
      </a-card>

      <!-- 右键菜单组件 -->
      <CardDropdown
        :menuData="editParams"
        v-for="item in tableData"
        :key="item.id"
        :row="item"
      >
        <div :class="{ inService: item.status == 0 }">
          <a-card
            :bordered="false"
            :data-key="item.id"
            class="selectable"
            :class="{ selected: selected.has(item.id) }"
          >
            <!-- 卡片标题 -->
            <template #title>
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ item.notes_name ?? item[cardTitle] }}</span>
                </template>
                <span>{{ item.notes_name ?? item[cardTitle] }}</span>
              </a-tooltip>
            </template>

            <!-- 编辑按钮 -->
            <template #extra>
              <template v-if="editParams.length <= 2">
                <a-tooltip placement="top" v-for="edit in editParams" :key="edit.id">
                  <template #title>
                    <span v-if="typeof edit.label == 'function'">{{ edit.label() }}</span>
                    <span v-else>{{ edit.label }}</span>
                  </template>
                  <a-button type="text" size="small" @click="edit.callback(item)">
                    <LzyIcon :name="edit.icon" />
                  </a-button>
                </a-tooltip>
              </template>

              <!-- 超出两个按钮 显示更多按钮 -->

              <template v-else>
                <a-tooltip placement="top" v-for="edit in editParams" :key="edit.id">
                  <template #title>
                    <span v-if="typeof edit.label == 'function'">{{ edit.label() }}</span>
                    <span v-else>{{ edit.label }}</span>
                  </template>

                  <a-button
                    type="text"
                    size="small"
                    @click="edit.callback(item)"
                    v-if="edit.show"
                  >
                    <LzyIcon :name="edit.icon" />
                  </a-button>
                </a-tooltip>
                <a-dropdown :trigger="['click']">
                  <a-button type="text" size="small">
                    <LzyIcon @click.prevent name="iconoir:more-horiz" />
                  </a-button>
                  <template #overlay>
                    <MenuItems
                      :menuItems="editParams.filter((item) => !item.show)"
                      :row="item"
                    />
                  </template>
                </a-dropdown>
              </template>
            </template>
            <!-- 卡片数据 -->
            <p
              v-for="res in tableTitle"
              :key="res.id"
              :title="res.template ? res.template(item) : item[res.prop]"
              :class="{ 'img-title': res.type }"
            >
              <!-- 图片类型 -->
              <template v-if="res.type && item[res.prop]">
                <span>
                  {{ typeof res.label != "string" ? res.label() : res.label }} :
                </span>

                <a-row :gutter="[1, 4]">
                  <a-col v-for="img in item[res.prop].split(',')" :key="img">
                    <!-- 当它只是图片的时候  -->
                    <img v-if="res.type == 'image'" :src="img" />

                    <!-- 第二种 image/video -->
                    <template v-else-if="res.type == 'image/video'">
                      <video v-if="item.upload_type == 0" :src="img" />
                      <img v-else :src="img" />
                    </template>

                    <!-- 第三种  video  -->
                    <video v-else-if="res.type == 'video'" :src="img" />
                  </a-col>
                </a-row>
              </template>

              <!-- 其他类型 -->
              <template v-else>
                {{ typeof res.label != "string" ? res.label() : res.label }} :
                <a-tag
                  :color="setTaskStatusLable(item[res.prop])[1]"
                  v-if="res.prop == 'status'"
                >
                  <template #icon>
                    <!-- <twitter-outlined /> -->
                  </template>
                  {{ setTaskStatusLable(item[res.prop])[0] }}
                </a-tag>

                <span v-else>
                  {{ res.template ? res.template(item) : item[res.prop] }}
                </span>
              </template>
            </p>
          </a-card>
        </div>
      </CardDropdown>
    </SelectionArea>
    <a-pagination
      :class="{ pagination: true, 'is-mobile': isMobile }"
      v-model:pageSize="listQuery.pageSize"
      v-model:current="listQuery.page"
      simple
      :size="isMobile ? 'small' : 'default'"
      :total="listQuery.total"
      :showSizeChanger="!isMobile"
      @change="getTableData"
    />
  </main>
</template>

<style scoped>
main.main-container {
  height: 100%;
  position: relative;
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    grid-auto-rows: minmax(min-content, 1fr); /* 行高自适应 */
    gap: 10px;
    user-select: none;


    &>div{
      align-items: start;
    }


    .ant-card {
      border: 2px solid transparent;
    }

    &:deep(.selected) {
      transition: all 0.12s;
      border: 2px solid #f56c6c;
      box-shadow: 0 0 10px 0 rgba(245, 108, 108, 0.3);
    }

    /* 卡片标题样式 */
    :deep(.ant-card-head) {
      padding:0 16px;
      user-select: none;

      .ant-card-head-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;

        .ant-card-extra {
          display: flex;
          gap: 10px;
        }
      }
    }

    /* 卡片样式 */
    :deep(.ant-card-body) {
      /* 卡片每条数据样式 */
      padding: 16px ;
      img,
      video {
        width: 30px;
        height: 30px;
        border-radius: 5px;
        border: 1px solid #222;
      }
      p {
        margin: 0;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;

        &.img-title {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }
  }

  /* 分页 */
  .pagination {
    position: fixed;
    bottom: 0;
    right: 50%;
    transform: translateX(50%);
    background-color: #fff;
    border-radius: 10px;
    padding: 10px;
    transition: all 0.22s;
    &:hover {
      box-shadow: 0 0 10px 0 rgb(81, 97, 206, 0.2);
    }

    &.is-mobile {
      box-shadow: 0 0 5px 0 rgb(81, 97, 206, 0.2);
    }
  }
}

.gridCenter {
  display: grid;
  justify-content: center;
  align-items: center;

  .add-params-title {
    text-align: center;
  }
}
</style>

<style>
.selectable {
  height: 100%;
}
.selection-area {
  background: rgba(46, 115, 252, 0.11);
  border: 1px solid rgba(98, 155, 255, 0.85);
  border-radius: 0.15em;
}
</style>
