<script setup>
import { reactive, ref } from "vue";
;
import { getGroupListUtils, setMessage } from "@/utils";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const publicString = "navigation.public.";
const btnString = "navigation.btn.";
const textString = "navigation.dashboard.resourceManagement.children.addressBook.";


const formData = ref({
  grouping_id: "",
  name: "",
  file: "",
  fileName: "",
});

//设备选择
const selectDev = ref([]);
//是否全选设备
const checkAll = ref(false);
const devicesList = ref([]);
let groupList = ref([]); //任务列表

handleGetGroupList();

//获取分组
async function handleGetGroupList() {
  groupList.value = await getGroupListUtils();
}
//获取设备列表
function handleChangeGroup(e) {
  //清空设备列表
  selectDev.value = "";
  devicesList.value = groupList.value
    .find((item) => item.value == e)
    .device_number_arr.map((item) => {
      return {
        label: item + "------" + item.slice(-3),
        value: item,
      };
    });
}
//全选择设备
const handleCheckAll = (val) => {
  if (val) {
    selectDev.value = devicesList.value.map((_) => _.value);
  } else {
    selectDev.value = [];
  }
};
const vcardFile = ref("");
function add() {
  let contactFile = formData.fileName;
  let devices = "";
  for (let i = 0; i < selectDev.value.length; i++) {
    devices = devices + selectDev.value[i] + ",";
  }
  devices = devices.slice(0, -1);

  if (!contactFile) {
    setMessage("error", t(textString + "formLabel.deletionMessage.title"));
    return false;
  }
  if (!devices) {
    setMessage("error", t(textString + "formLabel.deletionMessage.device"));
    return false;
  }
}
const handleChange = (file, fileList) => {
  // const isVcf = file.raw.type === "text/x-vcard";
  // if (!isVcf) {
  //   //移除文件
  //   fileList.splice(fileList.indexOf(file), 1);
  //   return setMessage("error", t(textString + "formLabel.deletionMessage.fileTypeError"));
  // } else {
  //   formData.fileName = file.name;
  // }
  // const imagesDocDir = GLOBAL_params.get("docPath");
  // fse.copySync(file.raw.path, imagesDocDir + "/" + file.name);
  // vcardFile.value = imagesDocDir + "/" + file.name;
};

const upload = ref();
const onSuccess = (response, file, fileList) => {
  if (response.status == 200) {
    setMessage("success", t(textString + "formLabel.success"));
  } else {
    setMessage("error", t(textString + "formLabel.fail"));
    console.log("🚀 ~ onSuccess ~ response.msgresponse.msg:", response.msg);
  }
};
</script>

<template>
  <div></div>
  <div class="addressBook">
    <el-form :model="formData" label-position="left" label-width="120px">
      <ElFormItem
        class="inner_box1"
        :label="t(textString + 'formLabel.selectGroup')"
        
      >
        <ElSelect
          v-model="formData.grouping_id"
          @change="handleChangeGroup"
          :placeholder="t(btnString + 'selectMessage')"
        >
          <ElOption
            v-for="item in groupList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem
        class="inner_box1"
        ::label="t(textString + 'formLabel.selectDevice')"
        prop="name"
      >
        <ElSelect
          v-model="selectDev"
          multiple
          clearable
          collapse-tags
          popper-class="custom-header"
          :max-collapse-tags="1"
          :placeholder="t(btnString + 'selectMessage')"
        >
          <template #header>
            <ElCheckbox v-model="checkAll" @change="handleCheckAll">
              {{ t(btnString + "allSelect") }}
            </ElCheckbox>
          </template>
          <ElOption
            v-for="item in devicesList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t(textString + 'formLabel.uploadFile')">
        <ElUpload
          class="upload-demo"
          ref="upload"
          drag
          :auto-upload="false"
          :limit="1"
          :on-success="onSuccess"
          :on-change="handleChange"
        >
          <!-- :auto-upload="false"
          :headers="headers"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          :on-success="onSuccess" -->

          <LzyIcon name="ep:upload-filled" width="100" height="100"></LzyIcon>
          <div class="ElUpload__text" v-html="t('navigation.btn.uploadFileMsg')"></div>
          <template #tip>
            <div class="ElUpload__tip">{{ t(textString + "formLabel.message") }}</div>
          </template>
        </ElUpload>
      </ElFormItem>
      <ElFormItem>
        <ElButton style="width: 100%" type="primary" @click="add()">
          {{ t(btnString + "add") }}
        </ElButton>
      </ElFormItem>
    </el-form>
  </div>
</template>

<style  scoped>
.addressBook {
  height: 100%;
  display: flex;
  .el-form.el-form--default {
    padding: 0;
  }
  .inner_box1 {
    width: 500px;
  }
  .upload-demo {
    width: 100%;
    .ElUpload__tip {
      text-align: center;
    }
  }
}
</style>
