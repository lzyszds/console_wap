<template>
  <div class="app" :class="store.isPhone ? 'isPhoneCollapse' : ''">
    <Suspense>
      <AConfigProvider :theme="theme" :locale="zhCN">
        <RouterView />
      </AConfigProvider>
    </Suspense>
  </div>
</template>
<script setup>
import { setLanguage } from "@/api/user/bingLang";
import { useI18n } from "vue-i18n";
import { useStore } from "@/store";
import zhCN from "ant-design-vue/es/locale/zh_CN";

const theme = ref({
  token: {
    colorPrimary: "#5161ce",
    colorPrimaryBg: "#5161ce15",
    colorPrimaryBgHover: "#bae0ff",
    colorBgContainer: "#ffffff",
    colorText: "#000000",
    colorBgElevated: "#ffffff",
    colorBorder: "#d9d9d9",
    colorTextHeading: "#000000",
    colorTextPlaceholder: "#00000080",
    colorFillSecondary: "#00000010",
    fontFamily: "PingFang SC,HarmonyOS_Regular,Helvetica Neue,Microsoft YaHei,sans-serif",
  },
});

const store = useStore();

const { locale } = useI18n();
//发送当前应用的使用语言
setLanguage(locale.value);
function isClose(event) {
  return false;
}
const { width } = useWindowSize();
watchEffect(
  () => {
    if (width.value < 640) {
      store.isPhone = true;
    } else {
      store.isPhone = false;
    }
  },
  { immediate: true }
);
</script>

<style>
#app {
  height: 100%;
  background-color: #fff;
  -moz-box-shadow: 0px 0px 5px #000;
  -webkit-box-shadow: 0px 0px 5px #000;
  box-shadow: 0px 0px 5px #000;
}

.main_box {
  background-color: #fff;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  /* box-shadow: 0 0 3px 1px #999; */
}

.left {
  float: left;
  height: 100%;
  overflow: auto;
}

.el-menu {
  border-right: none !important;
}


.header_txt {
  font-size: 15px;
}

.pagination {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 5px 0;
  display: flex;
}

.filter-container {
  display: flex;
  gap: 10px;
  padding: 4px 0;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.introduce {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  text-align: right;
}

.zydialog-footer {
  text-align: center;

  .el-button {
    width: 200px;
    margin-top: 20px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    font-size: 20px;
    font-weight: bold;
  }
}

.zyprogress {
  /* From Uiverse.io by JaydipPrajapati1910 */
  &.loader {
    display: block;
    --height-of-loader: 10px;
    width: 100%;
    height: var(--height-of-loader);
    border-radius: 30px;
    background-color: rgba(0, 0, 0, 0.2);
    position: relative;
  }

  &.loader.ok {
    background-color: var(--el-color-success);

    &::before {
      animation: none;
    }
  }

  &.loader::before {
    content: "";
    position: absolute;
    background: var(--theme-color);
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    border-radius: 30px;
    animation: moving 1s ease-in-out infinite;
  }

  @keyframes moving {
    50% {
      width: 100%;
    }

    100% {
      width: 0;
      right: 0;
      left: unset;
    }
  }
}
</style>
