<script setup>
import { useLocalStorage } from "@vueuse/core";
import { uploadUrl } from "@/api/resource/video";
import { mixedVideoList, mixedVideoListDel } from "@/api/clip/mixed";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { Button, message, Modal, Card } from "ant-design-vue";
import dayjs from "dayjs";

//存储当前组件的数据 相当于路由参数
const matInfoData = useLocalStorage("matInfoData", {});

const dataList = ref([]);
const selectListArr = ref([]); // 选中的混剪列表
const loading = ref(false);

getDataListFn();

async function getDataListFn() {
  loading.value = true;
  try {
    const res = await mixedVideoList({
      video_id: matInfoData.value.id,
      page: 1,
      pageSize: 1000,
    });
    dataList.value = res.data.data.list;
    const isPreparing = dataList.value.some(
      (item) => item.mediaBasicInfo.status == "Preparing"
    );
    if (isPreparing) {
      setTimeout(async () => {
        await getDataListFn();
      }, 3000);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
}

//删除混剪
const deleteMat = () => {
  if (selectListArr.value.length === 0) {
    message.warning(t("navigation.btn.selectListArr3")); // 请选择要删除的混剪
    return;
  }

  Modal.confirm({
    title: t("navigation.btn.deleteConfirm"), // 是否删除混剪
    content: t("navigation.btn.deleteContent"), // 提示内容
    okText: t("navigation.btn.confirm"), // 确定
    cancelText: t("navigation.btn.cancel"), // 取消
    onOk: async () => {
      try {
        const res = await mixedVideoListDel({
          video_id: matInfoData.value.id,
          ids: selectListArr.value.map((item) => ({
            id: item.mediaId,
            ossid: item.mediaBasicInfo.inputURL,
          })),
        });
        if (res.status === 200) {
          message.success(t("navigation.btn.deleteSuccess")); // 删除成功
          await getDataListFn();
          selectListArr.value = [];
        }
      } catch (error) {
        message.error(t("navigation.btn.deleteFailed")); // 删除失败
        console.error("Error deleting materials:", error);
      }
    },
  });
};

//选中混剪
const selectVideo = (item) => {
  const index = selectListArr.value.findIndex((i) => i.id === item.id);
  if (index > -1) {
    selectListArr.value.splice(index, 1);
  } else {
    selectListArr.value.push(item);
  }
};

//全部取消
const clearSelect = () => {
  selectListArr.value = [];
};

//全部选择
const allSelect = () => {
  selectListArr.value = [...dataList.value];
};

//推送资源
const pushResources = () => {
  if (selectListArr.value.length === 0) {
    message.warning(t("navigation.btn.selectListArr3")); // 请选择要推送的混剪
    return;
  }

  Modal.confirm({
    title: t("navigation.btn.pushConfirm"), // 是否推送资源到视频资源下
    content: t("navigation.btn.pushContent"), // 提示内容
    okText: t("navigation.btn.confirm"), // 确定
    cancelText: t("navigation.btn.cancel"), // 取消
    onOk: async () => {
      try {
        await Promise.all(
          selectListArr.value.map((item) => {
            const inputUrl = item.mediaBasicInfo.inputURL;
            const url = new URL(inputUrl);
            const suffix = url.pathname.split(".").pop();
            const filename = url.pathname.split("/").pop();
            //推送资源
            return uploadUrl({
              url: inputUrl,
              filename,
              suffix,
              mediaIds: item.mediaId,
            });
          })
        );
        message.success(t("navigation.btn.pushSuccess")); // 推送成功
        await getDataListFn();
        selectListArr.value = [];
      } catch (e) {
        message.error(t("navigation.btn.pushFailed")); // 推送失败
        console.error("Error pushing resources:", e);
      }
    },
  });
};
</script>

<template>
  <div class="header">
    <p>【{{ matInfoData.yun_name }}】 {{ t("navigation.btn.listTitle") }}</p>
    <div class="tools">
      <Button type="danger" v-if="selectListArr.length > 0">
        {{
          t("navigation.btn.selectListArr1") +
          selectListArr.length +
          t("navigation.btn.selectListArr2")
        }}
      </Button>

      <Button type="primary" @click="allSelect">
        {{ t("navigation.btn.allSelect") }}
      </Button>
      <Button type="primary" @click="clearSelect">
        {{ t("navigation.btn.cancelSelect") }}
      </Button>
      <Button type="primary" @click="pushResources" :loading="loading">
        {{ t("navigation.btn.pushResources") }}
      </Button>

      <Button type="danger" @click="deleteMat" :loading="loading">
        {{ t("navigation.btn.sourceMaterialDelect") }}
      </Button>
    </div>
  </div>
  <div class="content">
    <div
      v-for="item in dataList"
      :key="item.id"
      @click="selectVideo(item)"
      :class="{
        active: selectListArr.value.some((i) => i.id === item.id),
        listitem: true,
        isPreparing: item.mediaBasicInfo.status == 'Preparing',
      }"
    >
      <Card hoverable>
        <video :src="item.mediaBasicInfo.inputURL" controls muted></video>
        <p class="resDetBrief">
          {{ t("navigation.dashboard.aiClip.uploadTime") }}：
          {{ dayjs(item.mediaBasicInfo.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </p>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.tools {
  display: flex;
  gap: 10px;
}
.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.listitem {
  cursor: pointer;
}
.active {
  border: 2px solid #1890ff; /* Ant Design 主题色 */
}
.isPreparing {
  opacity: 0.5;
  pointer-events: none;
}
.resDetBrief {
  font-size: 12px;
  color: #999;
}
</style>
