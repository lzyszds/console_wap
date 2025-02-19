<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { addGroup, editGroup, getGroupList, deleteGroup } from "@/api/device/group";
import { getCloudPhoneList } from "@/api/device/cloudPhone";
import { setMessage } from "@/utils";

import { useI18n } from "vue-i18n";
import { Modal } from "ant-design-vue";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.device.children.cloudPhone.";
const getLabel = (value) => {
  return t(textString + "tableHeader." + value);
};

const { width } = useWindowSize();

const router = useRouter();

let action = ref("add");
let dialogFormVisible = ref(false);

const formData = reactive({
  cate_name: "",
  describe: "",
  device_arr: "",
});

let groupList = ref([]);
let tableKey = ref(0);
let listLoading = ref(true);

const checkAll = ref(false);
let indeterminate = ref(false);
const value = ref([]);
let devicesList = ref([]);

let total = ref(0);

let listQuery = reactive({
  page: 1,
  pageSize: 10,
  id_no: "",
  status: "",
  title: "",
});

//获取
async function getList() {
  listLoading.value = true;
  let response = await getCloudPhoneList();
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

const handleCreate = (act, row) => {
  dialogFormVisible.value = true;
  getListADBDevices();

  if (act == "add") {
    action.value = "add";
    clearFormData();
  } else if (act == "edit") {
    action.value = "edit";
    formData.id = row.id;
    formData.cate_name = row.cate_name;
    formData.describe = row.describe;
    //console.log(formData)

    let arr = [];
    for (let i = 0; i < row.device_number_arr.length; i++) {
      arr[i] = row.device_number_arr[i];
    }
    value.value = arr;
  } else if (act == "detail") {
  }
};

const onSubmit = async () => {
  formData.device_arr = value.value;
  let response;
  if (action.value == "add") {
    let params = {
      grouping_name: formData.cate_name,
      grouping_describe: formData.describe,
      device_arr: formData.device_arr,
    };
    response = await addGroup(params);
    getList();
  }

  if (action.value == "edit") {
    let params = {
      grouping_id: formData.id,
      grouping_name: formData.cate_name,
      grouping_describe: formData.describe,
      device_arr: formData.device_arr,
    };
    response = await editGroup(params);
    getList();
  }

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
  formData.cate_name = "";
  formData.describe = "";
  formData.device_arr = "";
  formData.device_number_arr = "";

  value.value = "";
};

onMounted(() => {});
</script>

<template>
  <a-card>
    <!-- 内容列表 -->
    <a-table
      :key="tableKey"
      :loading="listLoading"
      :data-source="groupList"
      :pagination="false"
      bordered
      :body-style="{ height: 'clac(100vh - 300px)' }"
    >
      <a-table-column
        :title="getLabel('id')"
        data-index="id"
        :width="80"
        align="center"
      />
      <a-table-column :title="getLabel('phoneid')" data-index="phoneid" align="center" />

      <a-table-column :title="getLabel('url')" data-index="url" align="center" />

      <!-- 创建时间 -->
      <a-table-column
        :title="getLabel('create_time')"
        data-index="create_time"
        :width="200"
        align="center"
      />

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
  <a-modal
    v-model:open="dialogFormVisible"
    :title="action == 'add' ? t(btnString + 'add') : t(btnString + 'edit')"
    :width="width < 500 ? '90%' : '50%'"
    :mask-closable="false"
    :destroy-on-close="true"
    @cancel="dialogFormVisible = false"
  >
    <a-form :model="formData" label-align="left" :label-col="{ span: 6 }">
      <a-form-item :label="getLabel('cate_name')" >
        <a-input v-model:value="formData.cate_name" />
      </a-form-item>

      <a-form-item :label="getLabel('describe')" >
        <a-input v-model:value="formData.describe" />
      </a-form-item>

      <a-form-item :label="getLabel('selectDev')">
        <a-select
          v-model:value="value"
          mode="multiple"
          :max-tag-count="1"
          :placeholder="getLabel('selectDev')"
        >
          <a-select-option :value="null" disabled>
            <template #label>
              <a-checkbox
                v-model:checked="checkAll"
                :indeterminate="indeterminate"
                @change="handleCheckAll"
              >
                {{ t(btnString + "allSelect") }}
              </a-checkbox>
            </template>
          </a-select-option>
          <a-select-option
            v-for="item in devicesList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </a-select>
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
</template>

<style scoped></style>
