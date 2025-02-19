<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  addDeviceList,
  editDeviceList,
  getDeviceListList,
  deleteDeviceList,
  getDeviceBackUpLog,
  sendDeviceBackUp,
} from "@/api/device/deviceList";
import { getApplicationLlist } from "@/api/device/application_list";

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.device.children.deviceList.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const router = useRouter();

let action = ref("add");
let dialogFormVisible = ref(false);
const historyBackUpView = ref(false);

const formData = reactive({
  equipment_nickname: "",
  remarks: "",
  equipment_number: "",
  platform: "",
  holographic: false,
});

let DeviceListList = ref([]);
let tableKey = ref(0);
let listLoading = ref(true);

const checkAll = ref(false);
let indeterminate = ref(false);
const value = ref([]);
let devicesList = ref([]);
const historyBackUpList = ref([]);
const platformList = ref([]);

let total = ref(0);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  id_no: "",
  status: "",
  title: "",
});

//获取平台option
getApplicationLlist(locale.value).then((res) => {
  platformList.value = res.data.data;
});

//获取分组
async function getList() {
  listLoading.value = true;
  let response = await getDeviceListList(listQuery);
  if (response.data.status == 200) {
    //this.categoryList = response.data.data
    DeviceListList.value = [];
    DeviceListList.value = response.data.data.list;
    total.value = Number(response.data.data.total);
    listLoading.value = false;
  } else {
    ElMessage.error({
      message: response.data.msg,
      plain: true,
    });
  }
}
getList();

function changePagination(e) {
  listQuery.page = e;
  getList();
}

const handleCreate = (act, row) => {
  dialogFormVisible.value = true;
  action.value = act;
  if (act == "add") {
    clearFormData();
  } else {
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

const onSubmit = async () => {
  formData.device_arr = value.value;
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
    ElMessage({
      message: response.data.msg,
      plain: true,
      type: response.data.status == 200 ? "success" : "error",
    });
  }
};

async function handleDeleteDeviceList(row) {
  ElMessageBox.confirm(
    t(publicString + "message.delectDetermine1") +
      "1" +
      t(publicString + "message.delectDetermine2"),
    t(publicString + "operation"),
    {
      confirmButtonText: t(btnString + "determine"),
      cancelButtonText: t(btnString + "cancel"),
      type: "warning",
      draggable: true,
    }
  )
    .then(async () => {
      //done()
      let params = {
        id: row.id,
      };
      await deleteDeviceList(params);
      getList();
    })
    .catch(() => {
      // catch error
    });
}

//全选择设备
const handleCheckAll = (val) => {
  indeterminate.value = false;
  if (val) {
    value.value = devicesList.value.map((_) => _.value);
  } else {
    value.value = [];
  }
};

const clearFormData = () => {
  formData.DeviceListing_id = "";
  formData.equipment_nickname = "";
  formData.describe = "";
  formData.device_arr = "";
  formData.equipment_number_arr = "";

  value.value = "";
};

onMounted(() => {});
</script>
<template>
  <div class="filter-container">
    <!-- <ElButton style="" type="primary" @click="handleCreate('add', '')">
      {{ t(btnString + "addDeviceListing") }}
    </ElButton> -->
  </div>
  <!-- 内容列表 -->
  <ElTable
    :key="tableKey"
    v-loading="listLoading"
    :data="DeviceListList"
    border
    fit
    highlight-current-row
    style="width: 100%"
  >
    <ElTableColumn label="ID" prop="order_id" sortable="custom" align="center" width="80">
      <template #default="scope">
        <span>{{ scope.row.id }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn
      prop="controllerDeviceId"
      :label="getLabel('controllerDeviceId')"
      align="center"
    >
      <template #default="scope">
        <span>{{ scope.row.controllerDeviceId }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn :label="getLabel('wsClientId')" align="center">
      <template #default="scope">
        <span>{{ scope.row.wsClientId ? "已使用" : "未使用" }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn :label="getLabel('wsClientId_status')" align="center">
      <template #default="scope">
        <span>{{ scope.row.wsClientId_status == "true" ? "在线" : "离线" }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn :label="getLabel('remarks')" align="center">
      <template #default="scope">
        <span>{{ scope.row.remarks }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn :label="getLabel('backups_time')" align="center">
      <template #default="scope">
        <span>{{ scope.row.backups_time }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn :label="getLabel('create_time')" align="center">
      <template #default="scope">
        <span>{{ scope.row.create_time }}</span>
      </template>
    </ElTableColumn>

    <ElTableColumn
      :label="t(publicString + 'operation')"
      align="center"
      width="600"
      class-name="small-padding fixed-width"
    >
      <template #default="scope">
        <ElButton type="primary" @click="backup(scope.row, 1)">
          {{ getLabel("flashingMachine") }}
        </ElButton>
        <ElButton type="primary" @click="handleCreate('backup', scope.row)">
          {{ getLabel("backup") }}
        </ElButton>
        <ElButton type="primary" @click="handleCreate('switch', scope.row)">
          {{ getLabel("switchBackup") }}
        </ElButton>
        <ElButton type="primary" @click="handleCreate('edit', scope.row)">
          {{ getLabel("editRemark") }}
        </ElButton>
        <ElButton type="primary" @click="openHistoryBackUpView(scope.row)">
          {{ getLabel("historyBackUp") }}
        </ElButton>
        <!-- <ElButton type="danger" @click="handleDeleteDeviceList(scope.row)">
          {{ t(btnString + "delete") }}
        </ElButton> -->
      </template>
    </ElTableColumn>
  </ElTable>

  <!-- 分页 -->
  <div class="pagination">
    <ElPagination
      v-show="total > 0"
      background
      layout="prev, pager, next"
      :total="total"
      :default-page-size="listQuery.pageSize"
      @current-change="changePagination"
    />
  </div>

  <!-- 弹层 -->
  <ElDialog
    v-model="dialogFormVisible"
    :title="
      action == 'add'
        ? t(btnString + 'add')
        : action == 'edit'
        ? t(btnString + 'edit')
        : getLabel('switchBackup')
    "
    width="50%"
    style="min-width: 550px"
    :before-close="handleClose"
  >
    <el-form :model="formData" label-position="left" label-width="120px">
      <ElFormItem :label="getLabel('controllerDeviceId')">
        <ElInput
          type="text"
          v-model="formData.controllerDeviceId"
          placeholder=""
          disabled
        />
      </ElFormItem>
      <ElFormItem
        :label="getLabel('remarks')"
        v-if="['edit', 'add', 'backup'].includes(action)"
      >
        <ElInput type="text" v-model="formData.remarks" placeholder="" />
      </ElFormItem>

      <ElFormItem :label="getLabel('platform')" v-if="action == 'backup'">
        <el-select v-model="formData.platform">
          <el-option
            v-for="item in platformList"
            :key="item.value"
            :label="item.label"
            :value="item.type"
          />
        </el-select>
      </ElFormItem>
      <ElFormItem :label="getLabel('holographic')" v-if="action == 'backup'">
        <el-switch v-model="formData.holographic" />
      </ElFormItem>
      <ElFormItem :label="getLabel('equipment_number')" v-if="action == 'switch'">
        <ElInput
          type="text"
          v-model="formData.equipment_number"
          :placeholder="getLabel('backuptip')"
        />
      </ElFormItem>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <ElButton @click="dialogFormVisible = false">
        {{ t(btnString + "cancel") }}
      </ElButton>
      <ElButton type="primary" @click="onSubmit()">
        {{ t(btnString + "save") }}
      </ElButton>
    </div>
  </ElDialog>

  <ElDialog
    v-model="historyBackUpView"
    :title="getLabel('historyBackUp')"
    width="50%"
    style="min-width: 550px"
  >
    <ElTable
      :data="historyBackUpList"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <ElTableColumn
        prop="equipment_number"
        :label="getLabel('equipment_number')"
        align="center"
      />

      <ElTableColumn
        prop="controllerDeviceId"
        :label="getLabel('controllerDeviceId')"
        align="center"
      />

      <ElTableColumn prop="create_time" :label="getLabel('backUpTime')" align="center" />
    </ElTable>
  </ElDialog>
</template>
<style  scoped></style>
