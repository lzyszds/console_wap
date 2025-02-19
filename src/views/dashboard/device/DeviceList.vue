<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  addDeviceList,
  editDeviceList,
  getDeviceList,
  deleteDeviceList,
  getDeviceBackUpLog,
  sendDeviceBackUp,
  getDeviceIsOnline,
} from "@/api/device/deviceList";
import { useThrottleFn, useWindowSize } from "@vueuse/core";
import ScreenCasting from "@/components/ScreenCasting.vue";
import { setMessage } from "@/utils";

import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
const { t, locale } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.device.children.deviceList.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};
const formData = reactive({
  equipment_nickname: "",
  remarks: "",
  equipment_number: "",
  platform: "",
  holographic: false,
});

const historyBackUpList = ref([]);
const platformList = ref([]);
const action = ref("");
const dialogFormVisible = ref(false);
const historyBackUpView = ref(false);
const clearFormData = () => {
  formData.equipment_nickname = "";
  formData.remarks = "";
  formData.equipment_number = "";
  formData.platform = "";
  formData.holographic = false;
};

let listQuery = reactive({
  page: 1,
  pageSize: 999,
  id_no: "",
  status: "",
  title: "",
});

const deviceList = ref([]);
const deviceListState = ref({});
const total = ref(0);
const listLoading = ref(false);
const phoneVideoDialog = ref(false);
const controllerDeviceIdstr = ref("");
const { width, height } = useWindowSize();
//获取分组
async function getList() {
  listLoading.value = true;
  let response = await getDeviceList(listQuery);
  const data = response.data;

  if (data.status == 200) {
    //this.categoryList = response.data.data
    deviceList.value = [];

    deviceList.value = data.data.list;
    total.value = Number(data.data.total);
    listLoading.value = false;

    deviceList.value.forEach(async (item) => {
      deviceListState.value[item.id] = true;
      const { data: isOnline } = await getDeviceIsOnline({
        id: item.wsClientId,
      });
      item.wsClientId_status = isOnline.data.wsClientId_status;
      item.menu = false;
      deviceListState.value[item.id] = false;
    });
  } else {
    setMessage("error", "获取设备列表失败");
  }
}
getList();

// 查询某个设备是否在线
const queryState = async (id) => {
  const item = deviceList.value;
  deviceListState.value[id] = true;
  const { data: isOnline } = await getDeviceIsOnline({
    id: item.wsClientId,
  });
  item.wsClientId_status = isOnline.data.wsClientId_status;
  item.menu = false;
  deviceListState.value[id] = false;
};

const extraList = [
  {
    title: getLabel("screenCasting"),
    handle: (item) => throttle(item.controllerDeviceId),
  },
  {
    title: getLabel("flashingMachine"),
    handle: (item) => backup(item, 1),
  },
  {
    title: getLabel("backup"),
    handle: (item) => handleCreate("backup", item),
  },
  {
    title: getLabel("switchBackup"),
    handle: (item) => handleCreate("switch", item),
  },
  {
    title: getLabel("editRemark"),
    handle: (item) => handleCreate("edit", item),
  },
  {
    title: getLabel("historyBackUp"),
    handle: (item) => openHistoryBackUpView(item),
  },
];

// 打开手机投屏
async function openVideoPhone(controllerDeviceId) {
  const { data: isOnline } = await getDeviceIsOnline({
    id: controllerDeviceId,
  });

  // 如果设备在线，则显示投屏
  if (JSON.parse(isOnline.data.wsClientId_status)) {
    phoneVideoDialog.value = true;
    controllerDeviceIdstr.value = controllerDeviceId;
  } else {
    setMessage("error", "设备不在线");
  }
}

const onSubmit = async () => {
  // formData.device_arr = value.value;
  let response;
  if (action.value == "add") {
    let params = {
      remarks: formData.remarks,
      equipment_nickname: formData.equipment_nickname,
    };
    response = await addDeviceList(params);
    getList();
  }

  if (action.value == "edit") {
    let params = {
      id: formData.id,
      remarks: formData.remarks,
    };
    response = await editDeviceList(params);
    getList();
  }

  if (action.value == "switch") {
    console.log(formData);
    backup(formData, 3);
  }

  if (action.value == "backup") {
    backup(formData, 2);
  }

  if (action.value == "switch") dialogFormVisible.value = false;
  if (response) {
    message[response.data.status == 200 ? "success" : "error"](response.data.msg);
  }
};

//防抖
const throttle = useThrottleFn(openVideoPhone, 1000);

const handleCreate = (act, row) => {
  dialogFormVisible.value = true;
  action.value = act;
  if (act == "add") {
    clearFormData();
  } else {
    console.log(row);

    formData.id = row.id;
    formData.equipment_nickname = row.equipment_nickname;
    formData.controllerDeviceId = row.controllerDeviceId;
  }
};

const backup = (row, type) => {
  sendDeviceBackUp({
    equipment_id: row.id,
    equipment_playtype: type,
    equipment_number: row.equipment_number,
    global_responseStr: JSON.stringify({
      platform: row.platform,
      remarks: row.remarks,
      holographic: row.holographic,
      controllerDeviceId: row.controllerDeviceId,
    }),
  });
};

//打开历史备份
const openHistoryBackUpView = async (row) => {
  historyBackUpView.value = true;
  const { data } = await getDeviceBackUpLog({
    page: 1,
    pageSize: 100,
    id: row.id,
  });
  historyBackUpList.value = data.data.list;
};
</script>

<template>
  <div class="right_content">
    <div>
      <a-button v-if="deviceList.length > 0" @click="getList" type="primary">
        {{ getLabel("refresh") }}
      </a-button>
    </div>
    <div class="device-main" v-loading="listLoading" v-if="deviceList.length > 0">
      <div class="device-list">
        <div
          v-for="item in deviceList"
          :key="item.id"
          :class="{
            useBefore: item.wsClientId,
            'device-card': true,
          }"
          shadow="hover"
          @mouseenter="item.menu = true"
          @mouseleave="item.menu = false"
        >
          <section class="card-title">
            <a-button
              class="state"
              :style="{
                background: item.wsClientId_status == 'true' ? '#7bff61' : '#eee',
              }"
              :loading="deviceListState[item.id]"
              size="small"
              @click="queryState(item.id)"
            >
              {{ getLabel(item.wsClientId_status == "true" ? "online" : "offline") }}
            </a-button>
            {{ getLabel("controllerDeviceId") }}:
            <span>{{ item.controllerDeviceId }}</span>
          </section>

          <!-- 背景图片 -->
          <section class="card-body">
            <img
              src="../../../assets/phone.png"
              style="height: 245px; object-fit: cover"
            />
          </section>

          <!-- 操作栏 -->
          <section class="card-extra">
            <div class="menu-wrap">
              <transition name="slide-fade">
                <div class="menu" v-show="item.menu">
                  <a-button
                    type="primary"
                    size="small"
                    v-for="(extra, i) in extraList"
                    :key="extra.title"
                    @click="extra.handle(item)"
                  >
                    {{ extra.title }}
                  </a-button>
                </div>
              </transition>
            </div>
          </section>
        </div>
      </div>
      <a-modal
        v-model:open="phoneVideoDialog"
        :title="'控制端ID:' + controllerDeviceIdstr"
        :width="(height * 0.8 * 9) / 17.8 + 50"
        class="phone-video-dialog"
        :mask-closable="false"
        :destroy-on-close="true"
        @cancel="phoneVideoDialog = false"
        :closable="false"
        :footer="false"
      >
        <ScreenCasting :controllerDeviceIdstr="controllerDeviceIdstr" />
      </a-modal>

      <a-modal
        v-model:open="dialogFormVisible"
        :title="
          action == 'add'
            ? t(btnString + 'add')
            : action == 'edit'
            ? t(btnString + 'edit')
            : getLabel('switchBackup')
        "
        :width="'50%'"
        style="min-width: 550px"
        :mask-closable="false"
        :destroy-on-close="true"
        @cancel="dialogFormVisible = false"
      >
        <a-form :model="formData" label-align="left" :label-col="{ span: 5 }">
          <a-form-item :label="getLabel('controllerDeviceId')">
            <a-input v-model:value="formData.controllerDeviceId" disabled />
          </a-form-item>
          <a-form-item
            :label="getLabel('remarks')"
            v-if="['edit', 'add', 'backup'].includes(action)"
          >
            <a-input v-model:value="formData.remarks" />
          </a-form-item>

          <a-form-item :label="getLabel('platform')" v-if="action == 'backup'">
            <a-select v-model:value="formData.platform">
              <a-select-option
                v-for="item in platformList"
                :key="item.value"
                :label="item.label"
                :value="item.type"
              />
            </a-select>
          </a-form-item>
          <a-form-item :label="getLabel('holographic')" v-if="action == 'backup'">
            <a-switch v-model:checked="formData.holographic" />
          </a-form-item>
          <a-form-item :label="getLabel('equipment_number')" v-if="action == 'switch'">
            <a-input
              v-model:value="formData.equipment_number"
              :placeholder="getLabel('backuptip')"
            />
          </a-form-item>
        </a-form>
        <template #footer>
          <a-button @click="dialogFormVisible = false">
            {{ t(btnString + "cancel") }}
          </a-button>
          <a-button type="primary" @click="onSubmit">
            {{ t(btnString + "save") }}
          </a-button>
        </template>
      </a-modal>

      <a-modal
        v-model:open="historyBackUpView"
        :title="getLabel('historyBackUp')"
        :width="'50%'"
        style="min-width: 550px"
        :mask-closable="false"
        :destroy-on-close="true"
        @cancel="historyBackUpView = false"
      >
        <a-table
          :data-source="historyBackUpList"
          bordered
          :pagination="false"
          :columns="[
            {
              title: getLabel('equipment_number'),
              dataIndex: 'equipment_number',
              key: 'equipment_number',
              align: 'center',
            },
            {
              title: getLabel('controllerDeviceId'),
              dataIndex: 'controllerDeviceId',
              key: 'controllerDeviceId',
              align: 'center',
            },
            {
              title: getLabel('backUpTime'),
              dataIndex: 'create_time',
              key: 'create_time',
              align: 'center',
            },
          ]"
        />
      </a-modal>
    </div>

    <div
      v-else
      style="display: flex; justify-content: center; align-items: center; height: 100%"
    >
      <a-empty>
        <template #description>
          <span> 当前账号暂无任何设备 </span>
        </template>
        <p>请联系管理员新增</p>
      </a-empty>
    </div>
  </div>
</template>

<style scoped>
.right_content {
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.09), 0 1px 6px -1px rgba(0, 0, 0, 0.09),
    0 2px 4px 0 rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
  margin: 0 auto;
  padding: 10px;
  font-size: 14px;
  line-height: 1.5714285714285714;
  list-style: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  position: relative;
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 40px 1fr 40px;
  gap: 10px;
  overflow-y: auto;
}

.device-main {
  width: 100%;
  height: 100%;

  :deep(.phone-video-dialog) {
    border-radius: 40px;
    --el-dialog-margin-top: 5vh;
    border: 10px solid #aaa;
  }

  .device-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    .device-card {
      filter: brightness(0.9);
      border-radius: 10px;
      min-width: 300px;
      background-color: #fff;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      padding: 10px 5px;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12),
          0 5px 12px 4px rgba(0, 0, 0, 0.09);
      }

      .card-extra {
        position: absolute;
        top: 55%;
        right: 0;
        transform: translateY(-50%);
        z-index: 1;
      }

      .card-title {
        position: relative;
        padding: 10px;
        border-bottom: 1px solid #bbb;
        text-wrap: nowrap;

        .state {
          color: #000000;
          background-color: #eee;
          padding: 0px 10px;
          border-radius: 5px;
          margin-right: 10px;
        }
        .menu-wrap {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
        }
      }

      .card-body {
        padding: 10px;
        display: flex;
        justify-content: center;
        position: relative;
        img {
          margin: 0 auto;
          user-select: none;
          pointer-events: none;
        }
      }

      .menu {
        --delay-increment: 0.1s;
        display: flex;
        gap: 10px;
        position: absolute;
        flex-direction: column;
        bottom: 50%;
        right: 5px;
        transform: translateY(50%);

        button {
          margin: 0;
          /* 动画延迟 */
          transition-delay: calc(var(--delay-increment) * var(--i));
        }
      }

      &::after {
        content: "未使用";
        position: absolute;
        bottom: 0;
        right: 0;
        color: #646464;
        padding: 5px 10px;
      }
      &.useBefore::after {
        content: "已使用";
        position: absolute;
        bottom: 0;
        right: 0;
        color: #000000;
        padding: 5px 10px;
      }
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.22s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translate(20px, 50%) !important;
  opacity: 0;
}
</style>
