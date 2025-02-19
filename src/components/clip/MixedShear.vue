<script setup>
import { audioList, captionsList } from "@/store/mixedShearData";
import LzyIcon from "@/components/LzyIcon.vue";
import { getCreditsTypeList } from "@/api/clip/credits";
import { getScflTypeList } from "@/api/clip/preClip";
import { getAudioTypeList } from "@/api/clip/musicMat";
import { getCaptionsList } from "@/api/clip/captions";
import { mixedVideo } from "@/api/clip/mixed";
import { getStickersTypeList } from "@/api/clip/stickerMat";
import { message } from "ant-design-vue";

const emit = defineEmits(["outputResult"]);
const obj = {
  mixedType: "senior", //混剪类型
  yun_name: "", //混剪库名称
  yun_num: 1, //单次生成数量
  piantou: "", //片头
  sucai1: "", //预剪辑素材
  alreadCutMat: [], //已经剪辑的素材
  pianwei: "", //片尾
  audio: "", //选择声音
  stickers: "", //贴纸素材
  yun_max: "20", //生成时长
  yun_maxAnimate: false, //报错时提醒动画
  aspectRatio: "9/16", //视频比例
  resolutionRatio: 720, //分辨率
  yun_ftitle: "", //主标题
  yun_ftitlesize: "70", //主标题大小
  yun_ftitlecolor: "#248B81", //主标题颜色
  yun_title: "", //副标题
  yun_titlesize: "40", //副标题大小
  yun_titlecolor: "#A74445", //副标题颜色
  titlePosition: "1", //标题位置 选择标题位置 "1" >顶部 "2" >居中
  yun_zimu: "", //字幕
  yun_zimusize: "80", //字幕大小
  yun_zimucolor: "#000000", //字幕颜色 暂时未用到
  yun_zimuvideo: "xiaoyun", //配音 人声播放
  yun_hyzt: [1], //字幕字体
  yun_spsy: "0", //视频原声
  yun_pintu: "0", //动态拼图特效
  yun_dong: 1, //背景音乐大小
  yun_jie: "1", //视频速度 视频节奏 1" title="正常 2" title="快节奏 3" title="慢节奏
};

const loading = ref(false); //下拉框请求loading
const formLoading = ref(false); //表单提交loading

const optionArr = reactive({
  piantou: [],
  sucai1: [],
  alreadCutMat: [],
  pianwei: [],
  audio: [],
  stickers: [],
  yun_ftitle: [],
  yun_title: [],
  yun_zimu: [],
  yun_zimuvideo: [],
  yun_hyzt: [],
});

const form = reactive({ ...obj });

const resetForm = () => {
  for (const key in obj) {
    form[key] = obj[key];
  }
};
const audioListnew = audioList.map((res) => {
  return {
    text: res.text,
    audio: res.audio,
    value: res.value,
    isPlay: false,
  };
});
const voiceoverList = ref(audioListnew.slice(0, 2));

//处理配音列表收展
const handleVoiceover = () => {
  if (voiceoverList.value.length === 2) {
    voiceoverList.value = audioListnew;
  } else {
    voiceoverList.value = audioListnew.slice(0, 2);
  }
};

const handleFontFamily = (val) => {
  //只能单选
  if (val.length > 1) {
    form.yun_hyzt = [val[val.length - 1]];
  }
};

const playAudio = (item) => {
  const audioEle = new Audio(item.audio);
  item.isPlay = !item.isPlay;
  if (item.isPlay) {
    audioEle.pause();
  } else {
    audioEle.play();
    audioEle.onended = () => {
      audioEle.currentTime = 0;
    };
  }
};
//获取片头列表
const findPiantou = async (uname) => {
  loading.value = true;
  const { data } = await getCreditsTypeList({
    type: 1,
    uname: uname,
    page: 1,
    limit: 20,
  });
  optionArr.piantou = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

//获取预剪辑素材列表
const findSucai1 = async (uname) => {
  loading.value = true;
  const { data } = await getScflTypeList({
    uname,
    page: 1,
    limit: 20,
  });
  optionArr.sucai1 = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const findPianwei = async (uname) => {
  loading.value = true;
  const { data } = await getCreditsTypeList({
    type: 2,
    uname: uname,
    page: 1,
    limit: 20,
  });
  optionArr.pianwei = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const findAudio = async (uname) => {
  loading.value = true;
  const { data } = await getAudioTypeList({
    uname: uname,
    page: 1,
    limit: 20,
  });
  optionArr.audio = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const findStickers = async (uname) => {
  loading.value = true;
  const { data } = await getStickersTypeList({
    uname: uname,
    page: 1,
    limit: 20,
  });
  optionArr.stickers = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const findZimu = async (uname) => {
  loading.value = true;
  const { data } = await getCaptionsList({
    uname: uname,
    page: 1,
    limit: 20,
  });
  optionArr.yun_zimu = data.data.list;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

//提交混剪数据
const handleCreate = async () => {
  formLoading.value = true;
  const radio = form.aspectRatio.split("/");

  //计算生成视频的宽高
  let yun_width = form.resolutionRatio;
  let yun_height = form.resolutionRatio / eval(form.aspectRatio);
  if (radio[0] < radio[1]) {
    yun_width = form.resolutionRatio * eval(form.aspectRatio);
    yun_height = form.resolutionRatio;
  }
  //混剪数据集合
  const data = {
    ...form,
    yun_width,
    yun_height,
    yun_hyzt: form.yun_hyzt[0],
  };

  const res = await mixedVideo(data);
  formLoading.value = false;
  if (res.data.status == "200") {
    message.success(res.data.msg);
    emit("outputResult");
    resetForm();
  } else {
    if (res.data.msg.indexOf("片头片尾时长超出总时长") != -1) {
      message.error({
        content:
          "出现这个错误，代表着你的生成时长的值小于你素材的时长，请调整<span style='color:red'>生成时长</span>的值。",
        key: "error",
        duration: 5,
        style: {
          color: "red",
        },
      });
      form.yun_maxAnimate = true;
      setTimeout(() => {
        form.yun_maxAnimate = false;
      }, 1000);
    } else {
      message.error(res.data.msg);
    }
  }
};
</script>

<template>
  <a-spin :spinning="formLoading">
    <a-form
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      :label-align="formLabelAlign"
      class="mixedForm"
    >
      <a-form-item label="选择混剪类型" required>
        <a-radio-group v-model:value="form.mixedType">
          <a-radio value="senior">高级混剪</a-radio>
          <a-radio value="order">顺序混剪</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="混剪库名称" required>
        <a-row>
          <a-col :span="16">
            <a-input v-model:value="form.yun_name" />
          </a-col>
          <a-col :span="8">
            <span style="font-size: 12px; color: #999; margin-left: 10px">
              混剪完毕后，可到混剪库列表查找。
            </span>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="单次生成数量" required>
        <a-row>
          <a-col :span="16">
            <a-input-number v-model:value="form.yun_num" :min="1" />
          </a-col>
          <a-col :span="8">
            <span style="font-size: 12px; color: #999; margin-left: 10px">
              建议单次最多生成<b>20</b>条视频！如不够可点击n次生成,即可生成(单次生成量*n)条视频！
            </span>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item label="选择片头">
        <a-select
          v-model:value="form.piantou"
          placeholder="请选择片头"
          :loading="loading"
          :filter-option="false"
          @search="findPiantou"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.piantou"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="选择预剪素材" required>
        <a-select
          v-model:value="form.sucai1"
          placeholder="请选择预剪素材"
          :loading="loading"
          :filter-option="false"
          @search="findSucai1"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.sucai1"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="选择片尾">
        <a-select
          v-model:value="form.pianwei"
          placeholder="请选择片尾素材"
          :loading="loading"
          :filter-option="false"
          @search="findPianwei"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.pianwei"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="选择音乐" required>
        <a-select
          v-model:value="form.audio"
          placeholder="请选择音乐素材"
          :loading="loading"
          :filter-option="false"
          @search="findAudio"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.audio"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="贴纸素材">
        <a-select
          v-model:value="form.stickers"
          placeholder="请选择贴纸素材"
          :loading="loading"
          :filter-option="false"
          @search="findStickers"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.stickers"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item
        label="生成时长"
        required
        v-if="form.mixedType === 'senior'"
        :class="{
          'animate__animated animate__faster animate__shakeX': form.yun_maxAnimate,
        }"
      >
        <a-input-number
          v-model:value="form.yun_max"
          :min="1"
          :style="{ width: 'calc(100% - 60px)' }"
        />
        <span style="margin-left: 10px">秒</span>
      </a-form-item>

      <a-form-item label="视频比例" required v-if="form.mixedType === 'senior'">
        <a-radio-group v-model:value="form.aspectRatio" class="radio-group">
          <a-radio value="9/16">
            <lzy-icon name="fluent:document-fit-16-regular" />
            9/16
          </a-radio>
          <a-radio value="16/9">
            <lzy-icon name="fluent:page-fit-16-regular" />
            16/9
          </a-radio>
          <a-radio value="4/3">
            <lzy-icon name="fluent:code-block-16-regular" />
            4/3
          </a-radio>
        </a-radio-group>
        <a-radio-group v-model:value="form.resolutionRatio" style="margin-left: 10px">
          <a-radio value="720">720P</a-radio>
          <a-radio value="1080">1080P</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="主标题">
        <a-input v-model:value="form.yun_ftitle" />
      </a-form-item>

      <a-form-item label="主标题大小">
        <a-input-number v-model:value="form.yun_ftitlesize" :min="1" />
      </a-form-item>

      <a-form-item label="主标题颜色">
        <a-color-picker v-model:value="form.yun_ftitlecolor" />
      </a-form-item>

      <a-form-item label="副标题">
        <a-input v-model:value="form.yun_title" />
      </a-form-item>

      <a-form-item label="副标题大小">
        <a-input-number v-model:value="form.yun_titlesize" :min="1" />
      </a-form-item>

      <a-form-item label="副标题颜色">
        <a-color-picker v-model:value="form.yun_titlecolor" />
      </a-form-item>

      <a-form-item label="标题位置">
        <a-radio-group v-model:value="form.titlePosition">
          <a-radio value="1">顶部</a-radio>
          <a-radio value="2">居中</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="选择字幕" required>
        <a-select
          v-model:value="form.yun_zimu"
          placeholder="请选择字幕素材"
          :loading="loading"
          :filter-option="false"
          @search="findZimu"
          allow-clear
          show-search
        >
          <a-select-option
            v-for="item in optionArr.yun_zimu"
            :key="item.id"
            :value="item.id"
          >
            {{ item.uname }}
          </a-select-option>
          <template #notFoundContent>
            <a-spin :spinning="loading" size="small" />
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="字幕大小">
        <a-input-number v-model:value="form.yun_zimusize" :min="1" />
      </a-form-item>

      <a-form-item label="配音 人声播放" required>
        <div class="voiceover-box">
          <div class="voiceover-item" v-for="item in voiceoverList" :key="item.text">
            <a-radio v-model:value="form.yun_zimuvideo" :label="item.value">
              {{ item.text }}
            </a-radio>
            <lzy-icon
              :name="item.isPlay ? 'gg:play-pause-o' : 'gg:play-button-o'"
              @click="playAudio(item)"
            />
          </div>
          <span @click="handleVoiceover">
            <a-button type="primary" size="samll">
              {{ voiceoverList.length > 2 ? "收起" : "更多" }}
            </a-button>
            提示：(外语需使用当地文字字幕)
          </span>
        </div>
      </a-form-item>

      <a-form-item label="字幕字体" required>
        <a-select
          v-model:value="form.yun_hyzt"
          mode="multiple"
          placeholder="请选择字幕字体"
          class="font-select"
          @change="handleFontFamily"
          :max-tag-count="1"
        >
          <a-select-option
            v-for="(item, index) in captionsList"
            :key="index"
            :value="index"
            class="font-select-option"
          >
            <img style="height: 60px; margin-right: 10px" :src="item" alt="" />
          </a-select-option>
          <template #tag>
            <div
              class="tagImg"
              :style="{
                'background-image': 'url(' + captionsList[form.yun_hyzt] + ')',
              }"
            ></div>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="视频原声" required>
        <a-switch
          v-model:checked="form.yun_spsy"
          :checked-children="'开启'"
          :un-checked-children="'关闭'"
          :checked-value="'1'"
          :un-checked-value="'0'"
        />
      </a-form-item>

      <a-form-item label="动态拼图特效" required>
        <a-switch
          v-model:checked="form.yun_pintu"
          :checked-children="'开启'"
          :un-checked-children="'关闭'"
          :checked-value="'1'"
          :un-checked-value="'0'"
        />
      </a-form-item>

      <a-form-item label="背景音乐大小" required>
        <a-slider
          v-model:value="form.yun_dong"
          :min="0"
          :max="10"
          :style="{ maxWidth: '31.5%', flexDirection: 'row-reverse', gap: '25px' }"
        />
      </a-form-item>

      <a-form-item label="视频速度" required>
        <a-radio-group v-model:value="form.yun_jie">
          <a-radio value="1">正常</a-radio>
          <a-radio value="2">快节奏</a-radio>
          <a-radio value="3">慢节奏</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-spin>
  <div class="filter-container">
    <a-button type="primary" @click="handleCreate"> 立即混剪 </a-button>
    <a-button @click="resetForm"> 重置 </a-button>
  </div>
</template>

<style scoped>
.filter-container {
  border-top: 1px solid #f0f0f0;
  padding: 20px 0 0 0;
  display: flex;
  flex-direction: row-reverse;
}
/* .mixed-shear {
  max-height: 600px;
  overflow: auto;
  overflow-x: hidden;
  .mixedForm {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;

    &.el-form {
      padding: 0 !important;
    } */

.voiceover-box {
  display: flex;
  flex-wrap: wrap;
  width: 90%;
  .voiceover-item {
    display: grid;
    grid-template-columns: 1fr auto;
    margin-right: 20px;
    width: 180px;
    align-items: center;
  }
  & > span {
    cursor: pointer;
    color: var(--ant-primary-color);
    border: 1px solid var(--ant-primary-color);
    padding: 5px;
    border-radius: 5px;
    line-height: 20px;
  }
}
.ant-input,
.ant-select {
  width: 100%;
}
/* }
} */
.radio-group {
  display: flex;
  gap: 20px;
}
</style>

<style>
.font-select {
  .ant-select-selection-item {
    height: 32px;
    img {
      margin-right: 10px;
    }
  }
  .tagImg {
    width: 260px;
    height: 32px;
    background-size: 85%;
    background-repeat: no-repeat;
    background-position: 20px 0;
  }
}
.font-select-option {
  .ant-select-item-option-content {
    height: 32px;
  }
}
</style>
