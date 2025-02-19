<script setup>
import { useRouter } from "vue-router";
import { addGroup, editGroup, getGroupList, deleteGroup } from "@/api/device/group";
import { getControllerDeviceIdList } from "@/api/device/deviceList";
import { Modal } from "ant-design-vue";
import { setMessage } from "@/utils/index";

import { useI18n } from "vue-i18n";
import RecordPop from "../../../components/paramsform/RecordPop.vue";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.device.children.group.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const { width } = useWindowSize();

const router = useRouter();

let action = ref("add");
let dialogFormVisible = ref(false);

const formData = reactive({
  title: "",
  describe: "",
  device_arr: "",
  checkedCities: {},
});

let groupList = ref([]);
let tableKey = ref(0);
let listLoading = ref(true);

const checkAll = ref(false);
let indeterminate = ref(false);
const value = ref([]);
let devicesList = ref([]);

const deviceNumberAllData = ref([]);
const equipmentNumberList = ref({});

let total = ref(0);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  id_no: "",
  status: "",
  title: "",
});

const handleSelectDev = (e) => {
  console.log(e);
};

//获取设备
async function getListADBDevices() {
  devicesList = ref([]);
  let { data } = await getControllerDeviceIdList();
  deviceNumberAllData.value = data.data.list;

  devicesList.value = data.data.list.map((res) => ({
    value: res.controllerDeviceId,
    label: res.controllerDeviceId,
    log: res.log,
  }));
}

watch(value, (newVal) => {
  if (newVal.length <= 0 || deviceNumberAllData.value.length <= 0) {
    equipmentNumberList.value = {};
    return;
  }
  equipmentNumberList.value = {};

  for (let item of newVal) {
    const { log } = deviceNumberAllData.value.find(
      (res) => res.controllerDeviceId == item
    );

    if (log.length > 0) {
      equipmentNumberList.value[item] = log;
    }
  }
});

//获取分组
async function getList() {
  listLoading.value = true;
  let response = await getGroupList(listQuery);
  if (response.data.status == 200) {
    //this.categoryList = response.data.data
    groupList.value = [];
    groupList.value = response.data.data.list;
    total.value = Number(response.data.data.total);
    listLoading.value = false;
  } else {
    setMessage("error", response.data.msg);
  }
}
getList();

function changePagination(e) {
  listQuery.page = e;
  getList();
}

const handleCreate = async (act, row) => {
  await getListADBDevices();

  if (act == "add") {
    action.value = "add";
    clearFormData();
    dialogFormVisible.value = true;
  } else if (act == "edit") {
    action.value = "edit";
    formData.id = row.id;
    formData.device_arr = row.device_arr;
    formData.title = row.title;
    formData.describe = row.describe;
    //console.log(formData)

    value.value = row.device_arr;
    formData.checkedCities = row.device_number_arr;
    console.log(formData.checkedCities);

    dialogFormVisible.value = true;
  } else if (act == "detail") {
  }
};

const onSubmit = async () => {
  formData.device_arr = value.value;
  let response;
  if (action.value == "add") {
    let params = {
      grouping_name: formData.title,
      grouping_describe: formData.describe,
      device_arr: formData.device_arr,
      device_number_arr: formData.checkedCities,
    };
    response = await addGroup(params);
    getList();
  }

  if (action.value == "edit") {
    let params = {
      grouping_id: formData.id,
      grouping_name: formData.title,
      grouping_describe: formData.describe,
      device_arr: formData.device_arr,
      device_number_arr: formData.checkedCities,
    };
    response = await editGroup(params);
    getList();
  }

  console.log(formData);

  dialogFormVisible.value = false;
  setMessage(response.data.status == 200 ? "success" : "error", response.data.msg);
};

async function handleDeleteGroup(row) {
  const content =
    t(publicString + "message.delectDetermine1") +
    "1" +
    t(publicString + "message.delectDetermine2");

  Modal.confirm({
    title: t(publicString + "operation"),
    content: content,
    okText: t(btnString + "determine"),
    cancelText: t(btnString + "cancel"),
    async onOk() {
      let params = {
        grouping_id: row.id,
      };

      await deleteGroup(params);
      getList();
    },
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
  formData.grouping_id = "";
  formData.title = "";
  formData.describe = "";
  formData.device_arr = "";
  formData.device_number_arr = "";
  formData.checkedCities = {};
  value.value = [];
};

provide("dialogConfig", {
  dialogFormVisible,
  formData,
  action,
});
</script>

<template>
  <a-card>
    <div class="filter-container">
      <a-button type="primary" @click="handleCreate('add', '')">
        {{ t(btnString + "addGrouping") }}
      </a-button>
    </div>
    <!-- 内容列表 -->
    <a-table
      :key="tableKey"
      :loading="listLoading"
      :data-source="groupList"
      :pagination="false"
      bordered
    >
      <a-table-column
        key="id"
        :title="getLabel('id')"
        data-index="id"
        :width="80"
        align="center"
      />
      <a-table-column
        key="title"
        :title="getLabel('title')"
        data-index="title"
        align="center"
      />

      <a-table-column
        :title="getLabel('describe')"
        data-index="describe"
        align="center"
      />

      <a-table-column
        :title="getLabel('device_count')"
        data-index="device_count"
        align="center"
      />

      <a-table-column :title="getLabel('up_time')" data-index="up_time" align="center" />

      <a-table-column
        :title="t(publicString + 'operation')"
        align="center"
        :width="230"
        data-index="operation"
      >
        <template #default="{ record }">
          <a-button type="primary" size="small" @click="handleCreate('edit', record)">
            {{ t(btnString + "edit") }}
          </a-button>
          <a-button
            type="primary"
            size="small"
            style="margin-left: 10px"
            danger
            @click="handleDeleteGroup(record)"
          >
            {{ t(btnString + "delete") }}
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        v-if="total > 0"
        v-model:current="listQuery.page"
        :total="total"
        :page-size="listQuery.pageSize"
        @change="changePagination"
        size="small"
      />
    </div>
  </a-card>

  <!-- 弹层 -->
  <RecordPop :noNotesName="true" :columns="[8, 20]">
    <template #listForm>
      <!-- 标题 -->
      <a-form-item :label="getLabel('title')">
        <a-input v-model:value="formData.title" />
      </a-form-item>

      <!-- 描述 -->
      <a-form-item :label="getLabel('describe')">
        <a-input v-model:value="formData.describe" />
      </a-form-item>

      <!-- 选择控制端id -->
      <a-form-item :label="getLabel('selectDev')">
        <a-select
          v-model:value="value"
          mode="multiple"
          :max-tag-count="1"
          :placeholder="getLabel('selectDev')"
          @change="handleSelectDev"
          :options="devicesList"
        />
      </a-form-item>

      <!-- 选择备份 -->
      <a-form-item
        v-for="(item, index) in equipmentNumberList"
        :key="index"
        :label="index"
        v-show="item.length > 0"
      >
        <a-checkbox-group v-model:value="formData.checkedCities[index]">
          <a-checkbox v-for="res in item" :key="res.id" :value="res.equipment_number">
            {{ res.equipment_number }}
          </a-checkbox>
        </a-checkbox-group>
      </a-form-item>
    </template>

    <!-- 按钮 -->
    <template #toolBar>
      <a-button type="primary" @click="onSubmit">
        {{ t(btnString + "save") }}
      </a-button>
    </template>
  </RecordPop>
</template>

<style scoped></style>
