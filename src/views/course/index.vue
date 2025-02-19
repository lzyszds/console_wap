<script setup>
import { ref, watch, getCurrentInstance } from "vue";
import LzyIcon from "@/components/LzyIcon.vue";
import { getCourseList, getCourseDetail } from "@/api/course";
import { useEventListener, useSessionStorage } from "@vueuse/core";
import { nextTick } from "vue";
import { isBoolean } from "lodash";

const selectNode = useSessionStorage("selectNode", ""); // 选中的树节点
const { proxy } = getCurrentInstance();
// const { dialog, ipcRenderer } = window.electron;
const downloadInfo = useSessionStorage("downloadInfo", []); // 下载信息
const filterText = ref(""); // 搜索关键词
const treeRef = ref(); // 树组件实例
const sidebarData = ref([]); // 侧边栏数据
const courseContentHtml = ref(); // 课程内容html
const courseDetail = ref({
  title: "软件使用教程",
  content: "请点击左侧树节点查看教程详情",
}); // 课程详情

const defaultProps = {
  children: "children",
  label: "title",
};

watch(filterText, (val) => {
  treeRef.value.filter(val);
});

const filterNode = (value, data) => {
  if (!value) return true;
  return data.title.includes(value);
};

// 获取教程列表
const { data } = await getCourseList();
if (data.status == 200) {
  sidebarData.value = data.data.map((res) => {
    /* 防止第一层节点被选中 */
    return {
      ...res,
      selectable: false,
    };
  });
}

// 点击树节点
const handleNodeClick = async (selectedKeys, selectedNodes) => {
  selectNode.value = selectedNodes.node.id;

  const { data } = await getCourseDetail(selectNode.value);
  if (data.status == 200) {
    courseDetail.value = data.data.info;
    return;
    // 图片点击放大
    nextTick(() => {
      //给所有markdown中的a标签都添加一个download属性
      const aArr = document.querySelectorAll(".courseContent a");
      aArr.forEach((a) => {
        //获取父节点的兄弟节点的text
        const name = a.parentNode.parentElement.firstChild.innerText;
        useEventListener(a, "click", (e) => {
          e.preventDefault();
          dialog
            .showOpenDialog({
              properties: ["openDirectory"],
              defaultPath: "C:/",
              properties: ["openDirectory"],
              message: "请选择要打开的文件",
            })
            .then((result) => {
              if (result.canceled) return;
              const data = {
                fileName: a.href.split("?files_name=").pop(),
                savePath: result.filePaths[0],
                simplifyName: name,
              };
              ipcRenderer.send("downloadApp", data);
              //将数据传入sessionStorage
              downloadInfo.value.push({ ...data });
              console.log(`lzy  downloadInfo.value:`, downloadInfo.value);
            });
        });
      });
      if (aArr.length > 0) setNodeProgress(downloadInfo.value);

      //给所有markdown中的img标签都添加一个data-fancybox属性
      const imgArr = courseContentHtml.value.querySelectorAll("img");
      imgArr.forEach((img) => {
        img.setAttribute("data-fancybox", true);
      });
      proxy.$fancyapps.Fancybox.bind("data-fancybox", {
        dragToClose: false,
        Image: {
          zoom: false,
        },
      });
    });
  }
};

// 初始化选中节点
handleNodeClick(selectNode.value);
//监听downloadInfo 中是否有数据如果有数据就显示下载进度
watch(
  () => downloadInfo.value,
  (val) => {
    console.log(`lzy  downloadInfo.value:`, val);
    nextTick(() => {
      setNodeProgress(val);
    });
  },
  { deep: true, immediate: true }
);

function setNodeProgress(val) {
  /**
   *  循环所有markdown中的a标签 如果有div就删除div
   */
  document.querySelectorAll(".loader.zyprogress").forEach((item) => {
    item.previousElementSibling.style.display = "initial";
    item.remove();
  });
  if (val.length > 0) {
    //给所有markdown中的a标签都添加一个download属性
    const aArr = document.querySelectorAll(".courseContent a");
    val.forEach((item) => {
      aArr.forEach((a) => {
        const name = a.parentNode.parentElement.firstChild.innerText;
        //要判断当前父标签中是否有div 如果有就不添加
        if (item.simplifyName == name && a.parentNode.lastChild.tagName != "DIV") {
          //将a标签隐藏
          a.style.display = "none";
          //创建一个div 用来显示下载进度
          const div = document.createElement("div");
          div.style.width = "100%";
          div.style.height = "5px";
          div.classList.add("loader");
          div.classList.add("zyprogress");
          a.parentNode.appendChild(div);
        }
      });
    });
  }
}
</script>
<template>
  <div class="courseMain">
    <div class="sidebar">
      <a-input-group compact>
        <a-input v-model:value="filterText" style="width: 200px" />
        <a-button type="primary"><LzyIcon name="gg:search" /></a-button>
      </a-input-group>

      <a-tree
        ref="treeRef"
        style="max-width: 600px"
        class="filter-tree"
        :tree-data="sidebarData"
        :field-names="defaultProps"
        :default-expand-all="true"
        :highlight-current-node="true"
        :filter-method="filterNode"
        @select="handleNodeClick"
      >
      </a-tree>
    </div>

    <div class="courseContent">
      <h3>{{ courseDetail.title }}</h3>
      <div v-html="courseDetail.content" ref="courseContentHtml"></div>
      <!-- <div></div> -->
    </div>
  </div>
</template>

<style>
.courseMain {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(80vh - 100px);
  border: 1px solid #ddd;
  border-radius: 10px;

  .sidebar {
    width: 258px;
    height: calc(100% - 40px);
    padding: 20px;
    border-right: 1px solid #ddd;

    .filter-tree {
      margin-top: 20px;
    }
  }

  .courseContent {
    flex: 1;
    display: grid;
    grid-template-rows: 60px 1fr 40px;
    align-self: baseline;
    padding: 20px;

    * {
      user-select: text !important;
    }

    & > h3 {
      margin: 0 auto;
    }

    & > div {
      height: calc(80vh - 220px);
      width: auto;
      margin: 0 auto;
      overflow-y: auto;
      padding: 0 clamp(10px, 5%, 20px);
    }

    img {
      cursor: pointer;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      overflow: hidden;
    }

    th,
    td {
      padding: 15px;
      text-align: left;
    }

    th {
      background-color: var(--theme-color);
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 14px;
      min-width: 200px;
      &:first-child {
        border-top-left-radius: 8px;
      }
      &:last-child {
        border-top-right-radius: 8px;
        min-width: 100px;
      }
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #f1f1f1;
    }

    td {
      border-bottom: 1px solid #dddddd;
    }
  }
}

.el-input-group__append,
.el-input-group__prepend {
  padding: 0 10px;
}

.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: var(--el-color-primary-light-3);
  color: #fff;
}
</style>
