<script setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import i18n from "@/locales";

const labelPosition = ref("right");
const { GLOBAL_params } = window.GLOBAL_params;
const { lowDb } = window.lowDb;
const { dialog, ipcRenderer, remote } = window.electron;
const docPath = GLOBAL_params.get("docPath");
const { processCwd } = window.processCwd;
const { t, locale } = useI18n();

const languageList = {
  zh: "中文",
  en: "English",
  th: "ภาษาไทย",
  ms: "Malay",
  id: "Indonesian",
  vi: "Tiếng Việt",
};
const version = ref(remote.getGlobal("params").version);
const formLabelAlign = reactive({
  resource_path: lowDb.get("systemConfig").imagesDocPath,
  mobile_path: lowDb.get("systemConfig").mobileFilePath,
  language: locale.value,
});

//切换语言
const changeLanguage = (val) => {
  //重置应用
  ElMessageBox.confirm(t("navigation.system.children.pathConfig.tips"), t("navigation.system.children.pathConfig.success"), {
    confirmButtonText: t("navigation.system.children.pathConfig.confirm"),
    cancelButtonText: t("navigation.system.children.pathConfig.later"),
    type: "warning",
  })
    .then(() => {
      locale.value = val;
      formLabelAlign.language = val;
      lowDb.set(
        "systemConfig",
        Object.assign(lowDb.get("systemConfig"), { language: val })
      );
      ipcRenderer.send("reset-app");
    })
    .catch(() => {
      ElMessage({
        type: "success",
        message: "请在修改所有配置后点击下方的重置按钮",
        plain: true,
      });
    });
};

const selectPath = (key) => {
  dialog.showOpenDialog({ properties: ["openDirectory"] }).then((res) => {
    if (res.canceled) return;
    formLabelAlign[key] = res.filePaths[0];
    if (key === "resource_path") {
      lowDb.set(
        "systemConfig",
        Object.assign(lowDb.get("systemConfig"), { imagesDocPath: res.filePaths[0] })
      );
    }
  });
};

const resetPath = (key) => {
  let path = "";
  if (key === "resource_path") {
    path = docPath + "\\images";
    lowDb.set(
      "systemConfig",
      Object.assign(lowDb.get("systemConfig"), { imagesDocPath: path })
    );
  } else if (key === "mobile_path") {
    path = "/mnt/shared/Pictures";
    lowDb.set(
      "systemConfig",
      Object.assign(lowDb.get("systemConfig"), { mobileFilePath: path })
    );
  }
  formLabelAlign[key] = path;
};
const save = (key) => {
  if (formLabelAlign[key].indexOf("\\") > -1) {
    return ElMessage({
      message: '移动端路径请使用正斜杠("/")作为路径分隔符',
      type: "error",
      plain: true,
    });
  }
  lowDb.set(
    "systemConfig",
    Object.assign(lowDb.get("systemConfig"), {
      mobileFilePath: formLabelAlign.mobile_path,
    })
  );
  ElMessageBox.confirm(t("navigation.system.children.pathConfig.tips"), t("navigation.system.children.pathConfig.success"), {
    confirmButtonText: t("navigation.system.children.pathConfig.confirm"),
    cancelButtonText: t("navigation.system.children.pathConfig.later"),
    type: "warning",
  })
    .then(() => {
      ipcRenderer.send("reset-app");
    })
    .catch(() => {
      ElMessage({
        type: "success",
        message: t("navigation.system.children.pathConfig.successTips"),
        plain: true,
      });
    });
};
</script>

<template>
  <div class="systemContent">
    <el-tabs type="border-card" class="demo-tabs">
      <el-tab-pane>
        <template #label>
          {{ t("navigation.system.children.pathConfig.title") }}
        </template>
        <ElForm :label-position="labelPosition" label-width="auto" :model="formLabelAlign"
          style="width: calc(100vw - 80px)">
          <ElFormItem :label="t('navigation.system.children.pathConfig.version')">
            <div>V{{ version }}</div>
          </ElFormItem>

          <ElFormItem :label="t('navigation.system.children.pathConfig.nowAppPath')">
            <ElInput v-model="processCwd" disabled :spellcheck="false" />
          </ElFormItem>
          <ElFormItem :label="t('navigation.system.children.pathConfig.resourcesPath')">
            <ElInput v-model="formLabelAlign.resource_path" readonly :spellcheck="false">
              <template #append>
                <div class="inputAppend">
                  <ElButton type="primary" @click="selectPath('resource_path')">
                    {{ t("navigation.system.children.btn.replace") }}
                  </ElButton>
                  <ElButton type="primary" @click="resetPath('resource_path')">
                    {{ t("navigation.system.children.btn.reset") }}
                  </ElButton>
                </div>
              </template>
            </ElInput>
          </ElFormItem>
          <ElFormItem :label="t('navigation.system.children.pathConfig.mobilePath')">
            <ElInput v-model="formLabelAlign.mobile_path" @change="mobileChange" :spellcheck="false">
              <template #append>
                <ElButton type="primary" @click="save('mobile_path')">
                  {{ t("navigation.system.children.btn.save") }}
                </ElButton>
              </template>
            </ElInput>
          </ElFormItem>
          <ElFormItem :label="t('navigation.system.children.pathConfig.language')">
            <!-- 切换语言 -->
            <ElSelect v-model="formLabelAlign.language" @change="changeLanguage" placeholder="请选择">
              <ElOption v-for="(item, key) in languageList" :key="key" :label="item" :value="key"></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </el-tab-pane>
    </el-tabs>

    <ElButton type="primary" class="resetBtn" @click="ipcRenderer.send('reset-app')">
      {{ t("navigation.system.children.btn.resetApp") }}
    </ElButton>
  </div>
</template>

<style  scoped>
.systemContent {
  display: grid;
  grid-template-rows: 1fr 50px;
  gap: 15px;
  height: calc(100vh - 100px);
}

.demo-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}

.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}

:deep(.el-input-group__append) {
  padding: 0;
}

.inputAppend {
  display: grid;
  grid-template-columns: repeat(2, 60px);
}

.el-input-group__append button {
  padding: 5px 10px;
  margin: 0;

  &:hover {
    background-color: var(--theme-color);
    color: #fff;
  }
}

.resetBtn {
  margin: 0 auto;
}
</style>
