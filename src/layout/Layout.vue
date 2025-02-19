<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getUserInfo } from "@/api/user/info";
import Course from "@/views/course/index.vue";
import Notice from "@/views/notice/index.vue";
import { baseurl } from "@/config/config";
import { useStore } from "@/store";
import dayjs from "dayjs";

const store = useStore();

const { width } = useWindowSize();
const language = useStorage("language", "zh");
const token = useStorage("token", "");
const userInfo = useSessionStorage("userInfo", {});
const router = useRouter();
const route = useRoute();
const collapsed = ref(false);
const selectedKeys = ref([route.path]); // 根据当前路由设置 selectedKeys
const openKeys = ref([]);
// 打开使用须知弹窗
const showUsageGuidelines = ref(false);
// 打开使用教程
const showTutorial = ref(false);
const { t, locale } = useI18n();

//切换语言
const handleI18n = (val) => {
  language.value = val;
  locale.value = val;
  router.replace({ query: { lang: val } });
  location.reload();
};

const languageList = {
  zh: "中文",
  en: "English",
  th: "ภาษาไทย",
  ms: "Malay",
  id: "Indonesian",
  vi: "Tiếng Việt",
};

// 退出登录
const getOut = () => {
  token.value = "";
  router.push("/login");
};

const state = reactive({
  routers: [],
});
// 路由
const routes = router.options.routes;

// 路由面包屑
const routesBreadcrumb = computed(() => {
  const pathParts = route.path.split("/").filter(Boolean);
  const path = "/" + pathParts[0];
  // 第一层路由
  const resultFather = findRouteByPath(path, routes);
  if (pathParts.length == 1) {
    return [resultFather];
  }
  // 第二层路由
  const resultChild = resultFather.children.find((item) => {
    if (item.path === pathParts[1]) {
      return item;
    }
  });

  // 如果没有第三层路由
  if (pathParts.length == 2) {
    return [resultFather, resultChild];
  }
  // 第三层路由
  const newRouer = resultChild.children.find((item) => {
    if (item.path === pathParts[2]) {
      return item;
    }
  });

  return [resultFather, resultChild, newRouer];
});

try {
  getUserInfo().then((res) => {
    userInfo.value = res.data.data;
  });
} catch (error) {
  console.log(error);
}

// 监听路由变化，更新 selectedKeys
watch(
  () => route.path,
  (newPath) => {
    const currentRoute = findRouteByPath(newPath, routes);
    selectedKeys.value =
      currentRoute && currentRoute.parentPath ? [currentRoute.parentPath] : [newPath];
  }
);

// 辅助函数，根据 path 查找路由配置
function findRouteByPath(path, routes) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (route.path === path) {
      return route;
    }
    if (route.children) {
      for (const child of route.children) {
        if (child.path === path) {
          return { ...child, parentPath: route.path };
        }
        if (child.children) {
          const grandChild = child.children.find(
            (gc) => route.path + child.path + "/" + gc.path === path
          );
          if (grandChild) {
            return { ...grandChild, parentPath: route.path + child.path };
          }
        }
      }
    }
  }
  return null;
}

let socket;
onMounted(() => {
  state.routers = routes.filter(
    (item) => item.path !== "/" && !item.isHideMenu && item.name != "undefind404"
  );
  const currentPath = route.path;
  const pathParts = currentPath.split("/").filter(Boolean);

  // 修改设置展开菜单的逻辑
  openKeys.value = pathParts.reduce((acc, curr, index) => {
    if (index === 0) {
      acc.push("/" + curr);
    } else {
      const parentPath = acc[index - 1];
      const currentFullPath = parentPath + "/" + curr;

      // 检查是否存在子菜单
      const parentRoute = findRouteByPath(parentPath, state.routers);
      if (parentRoute && parentRoute.children) {
        acc.push(currentFullPath);
      }
    }
    return acc;
  }, []);

  // 设置选中的菜单项
  selectedKeys.value = [currentPath];

  /* webscoket连接 */
  let pingInterval;
  const url = baseurl.replace("https", "wss").replace("api", "ws");
  //发送在线长连接
  socket = new WebSocket(url + "/ws?sign=token=" + token.value.replace("Bearer ", ""));

  socket.addEventListener("open", () => {
    console.log("已连接到服务器");
    pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        //发送给服务器
        socket.send(
          JSON.stringify({
            data: dayjs().format("x"),
            md5: "",
            message_id: "",
            type: "ping",
          })
        );
      }
    }, 1000 * 10); // 每 10 秒发送一次心跳
  });
  // 3. 将 URL 赋值给 <img> 标签的 src 属性
  const imageElement = document.createElement("img");
  document.body.appendChild(imageElement);
  let base64 = "";

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type == "message_status") {
      store.updateTaskStatusPatch(data.data)
    }

    // if (data.hasOwnProperty("taskId")) {
    //   const isExist = store.taskRunStatusData.findLastIndex(
    //     (item) => item.taskId === taskId
    //   );
    //   if (isExist === -1) {
    //     store.taskRunStatusData.push(data);
    //   } else {
    //     //运行状态：1=未运行 2=运行中 3=运行结束 4=运行异常
    //     store.taskRunStatusData[isExist] = data;
    //   }

    //   console.log(store.taskRunStatusData);

    // }
    if (data.type == "video") {
      dataAll.value.push(JSON.parse(data.data));
      const chunk = {};
      dataAll.value.forEach((item, index) => {
        if (!chunk[item.key]) chunk[item.key] = [];
        chunk[item.key].push(item);

        if (item.total == item.index) {
          for (let i = 0; i < dataAll.value.length; i++) {
            base64 += dataAll.value[i].base64;
          }
          screenCastingData.value = {
            base64,
            width: item.width,
            height: item.height,
          };
          dataAll.value = [];
          base64 = "";
        }
      });
    }
    // if (data.type == "video") {
    //   //进行base64解码
    //   //在body添加一个图片
    //   // 假设你已经解码 Base64 字符串得到了一个 Uint8Array
    //   const binaryData = new Uint8Array(
    //     atob(data.data)
    //       .split("")
    //       .map((char) => char.charCodeAt(0))
    //   );
    //   console.log(binaryData);

    //   const canvas = document.getElementById("myCanvas");
    //   const ctx = canvas.getContext("2d");

    //   // 1. 创建 Blob 对象
    //   const blob = new Blob([binaryData], { type: "image/png" }); // 根据实际图片类型设置 type

    //   // 2. 创建对象 URL
    //   const imageUrl = URL.createObjectURL(blob);

    //   // 3. 创建 Image 对象
    //   const image = new Image();
    //   image.onload = () => {
    //     // 4. 设置 canvas 的宽高（根据需要）
    //     canvas.width = image.width;
    //     canvas.height = image.height;

    //     // 5. 在 canvas 上绘制图像
    //     ctx.drawImage(image, 0, 0);

    //     // 6. (可选) 释放对象 URL
    //     URL.revokeObjectURL(imageUrl);
    //   };
    //   image.src = imageUrl;
    // }
  });

  socket.addEventListener("close", () => {
    console.log("连接已关闭");
    clearInterval(pingInterval);
  });
});

onBeforeUnmount(() => {
  //关闭长连接
  socket.close();
});

/* 手机端响应式处理 */
const isMobile = computed(() => width.value < 768);

watch(
  isMobile,
  (val) => {
    collapsed.value = val;
  },
  { immediate: true }
);
</script>

<template>
  <a-layout class="layout-main">
    <a-layout-sider
      theme="light"
      v-model:collapsed="collapsed"
      breakpoint="md"
      :collapsed-width="0"
      :trigger="null"
      collapsible
      :width="240"
      :class="{
        'zy-layout-sider': true,
        'zy-layout-sider-collapsed': !collapsed && isMobile,
      }"
    >
      <div
        v-if="!collapsed && isMobile"
        class="slot"
        @click="collapsed = !collapsed"
      ></div>

      <div class="logo">
        <img width="30px" height="30px" src="@/assets/logo_1_11zon.png" alt="" />
        <span v-if="!collapsed">Chuhai</span>
      </div>

      <!-- 侧边导航 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        v-model:openKeys="openKeys"
      >
        <template v-for="item in state.routers" :key="item.path">
          <!-- 嵌套路由 -->
          <a-sub-menu v-if="item.children && item.children.length" :key="item.path">
            <!-- 父路由 -->
            <template #title>
              <span>
                <LzyIcon :name="item.icon" />
                <span class="menu-title-item">{{ item.name }}</span>
              </span>
            </template>

            <!-- 子路由 -->
            <template v-for="subItem in item.children" :key="subItem.path">
              <a-sub-menu
                v-if="subItem.children && subItem.children.length"
                :key="item.path + '/' + subItem.path"
              >
                <template #title>
                  <span>
                    <span>{{ subItem.name }}</span>
                  </span>
                </template>

                <!-- 子子路由 有三层的情况 -->
                <a-menu-item
                  v-for="child in subItem.children"
                  :key="item.path + '/' + subItem.path + '/' + child.path"
                  @click="router.push(item.path + '/' + subItem.path + '/' + child.path)"
                  :style="{ display: child.isHideMenu ? 'none' : 'block' }"
                >
                  {{ child.namePath }}
                </a-menu-item>
              </a-sub-menu>

              <!-- 普通路由 只有两层的情况 -->
              <a-menu-item
                v-else
                :key="`${item.path}/${subItem.path}`"
                @click="router.push(item.path + '/' + subItem.path)"
              >
                {{ subItem.namePath }}
              </a-menu-item>
            </template>
          </a-sub-menu>
          <a-menu-item v-else :key="`item-${item.path}`" @click="router.push(item.path)">
            <icon-component :icon="item.icon" />
            <span>{{ item.name }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="zy-layout-header">
        <!-- 顶部左侧的缩放侧边栏 和 路由面包屑 -->
        <section class="left">
          <template v-if="isMobile">
            <div
              @click="collapsed = !collapsed"
              class="logo"
              style="justify-content: start; padding-left: 20px"
            >
              <img width="30px" height="30px" src="@/assets/logo_1_11zon.png" alt="" />
              <span v-if="!collapsed">Chuhai</span>
            </div>
          </template>

          <template v-else>
            <a-button @click="collapsed = !collapsed" type="text">
              <LzyIcon v-if="collapsed" name="ant-design:menu-unfold-outlined" />
              <LzyIcon v-else name="ant-design:menu-fold-outlined" />
            </a-button>
            <!-- 面包屑 -->
            <a-breadcrumb :routes="routesBreadcrumb">
              <template #itemRender="{ route, paths }">
                <span
                  v-if="routesBreadcrumb.indexOf(route) === routesBreadcrumb.length - 1"
                >
                  {{ route.name.length > 20 ? t(route.name) : route.name }}
                </span>

                <router-link v-else :to="'/' + paths.join('/')">
                  {{ route.name.length > 20 ? t(route.name) : route.name }}
                </router-link>
              </template>
            </a-breadcrumb>
          </template>
        </section>

        <!-- 右侧按钮 -->
        <section class="right">
          <!-- 使用须知 -->
          <a-tooltip placement="bottom">
            <template #title>
              <span>{{ t("navigation.public.instructionsForUse") }}</span>
            </template>
            <a-button type="text" size="small" @click="showUsageGuidelines = true">
              <LzyIcon
                name="iconoir:priority-high"
                @click="showUsageGuidelines = true"
              ></LzyIcon>
            </a-button>
          </a-tooltip>
          <!-- 使用教程 -->
          <a-tooltip placement="bottom">
            <template #title>
              <span>{{ t("navigation.public.course") }}</span>
            </template>
            <a-button type="text" size="small">
              <LzyIcon name="hugeicons:course" @click="showTutorial = true"></LzyIcon>
            </a-button>
          </a-tooltip>
          <!-- 语言切换 -->
          <a-dropdown>
            <a-button type="text" size="small">
              <LzyIcon name="icons8:translation" /> {{ languageList[language] }}
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item
                  v-for="(item, index) of languageList"
                  :key="index"
                  @click="handleI18n(index)"
                >
                  {{ item }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- 个人头像 -->
          <a-dropdown arrow>
            <a-badge :count="0">
              <a-avatar shape="square">
                <template #icon>
                  <div class="menuLogin"></div>
                </template>
              </a-avatar>
            </a-badge>
            <template #overlay>
              <a-menu>
                <a-menu-item
                  disabled
                  style="text-align: center; width: 110px; overflow: hidden"
                  :title="userInfo.nickname ?? '未知账号'"
                >
                  <span>{{ userInfo.nickname ?? "未知账号" }}</span>
                </a-menu-item>
                <a-menu-item>
                  <a-button type="link" danger @click="getOut">
                    {{ t("navigation.login.exit") }}
                  </a-button>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </section>
      </a-layout-header>
      <a-layout-content
        :style="{
          margin: '0',
          padding: !isMobile ? '15px 10px' : '8px',
          background: '#fff',
          minHeight: 'calc(100vh - 48px - 48px)',
          overflow: 'auto',
        }"
      >
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>

  <!-- 使用须知 -->

  <a-modal
    v-model:open="showUsageGuidelines"
    width="1000px"
    :title="t('navigation.notice.title')"
    ok-text="知道了"
    @ok="showUsageGuidelines = false"
  >
    <Notice></Notice>
  </a-modal>

  <!-- 使用教程 -->

  <a-modal
    v-model:open="showTutorial"
    width="90%"
    :title="t('navigation.course.title')"
    ok-text="知道了"
    @ok="showTutorial = false"
  >
    <Course></Course>
  </a-modal>
</template>

<style scoped>
.layout-main {
  height: 100vh;
  :deep(.ant-menu-sub.ant-menu-inline) {
    background-color: #fff;
  }
  .ant-menu {
    overflow-y: auto;
    height: calc(100vh - 60px);
  }

  .menu-title-item {
    margin-left: 10px;
  }

  .ant-menu-inline-collapsed {
    .menu-title-item {
      display: none !important;
    }
  }
  .ant-layout-content {
    border-radius: 10px;
    background-color: transparent !important;
  }

  .zy-layout-sider {
    z-index: 99;
    &.zy-layout-sider-collapsed {
      transition: none;
      position: fixed;
      left: 0;
      top: 0;

      .slot {
        position: fixed;
        width: 100vw;
        height: 100vh;
        background-color: #99999990;
        z-index: -1;
      }
    }
  }

  .logo {
    height: 60px;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    background-color: #fff;
    user-select: none;
  }
  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
    color: #1890ff;
  }

  :deep(.zy-layout-header) {
    background: #fff;
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 999;
    display: flex;
    box-shadow: 0 2px 0px 0 rgb(0 0 0 / 10%);
    .left {
      display: flex;
      align-items: center;
      gap: 30px;
      flex: 1;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 5px;
      padding-right: 20px;

      .menuLogin {
        width: 45px;
        height: 45px;
        background: url(https://www.chuhai.best/statics/poster/av03141451.png) no-repeat;
        background-size: contain;
        background-position: -7px -10px;
        position: relative;
        background-color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>

<style>
.router-enter-active,
.router-leave-active {
  transition: all 0.5s ease-in-out;
}

.router-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.router-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.router-enter-to,
.router-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.zy-layout-sider.zy-layout-sider-collapsed {
  .ant-layout-sider-children {
    width: 240px !important;
  }
}

.ant-menu-submenu.ant-menu-submenu-popup {
  display: none;
}
</style>
