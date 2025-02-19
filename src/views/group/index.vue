<template>
  <div class="home">
    <el-form :model="form" label-width="120px">
      <ElFormItem label="选择任务类型：">
        <ElRadioGroup v-model="form.type" class="ml-4">
          <el-radio label="10" size="large" @input="handel_chooes_type(10)"
            >基本设置</el-radio
          >
          <el-radio label="1" size="large" @input="handel_chooes_type(1)"
            >新建群</el-radio
          >
          <el-radio label="2" size="large" @input="handel_chooes_type(2)"
            >群拉人</el-radio
          >
          <el-radio label="3" size="large" @input="handel_chooes_type(3)"
            >群设置</el-radio
          >
          <el-radio label="4" size="large" @input="handel_chooes_type(4)"
            >群广告</el-radio
          >
        </ElRadioGroup>
      </ElFormItem>

      <div v-if="form.type == 10">
        <ElFormItem label="头像路径：">
          <ElInput type="text" v-model="form.avatar_path" style="width: 300px" />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">
            设置上传头像路径指的是你电脑和模拟器共享路径，你可以从模拟器中复制电脑共享路径
          </div>
        </ElFormItem>
        <ElFormItem label="上传头像">
          <ElUpload
            class="upload-demo"
            action="/"
            :multiple="true"
            :limit="10"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleUploadAvatar"
          >
            <template #trigger>
              <ElButton type="primary">上传</ElButton>
            </template>
          </ElUpload>
        </ElFormItem>
      </div>

      <div v-if="form.type == 1">
        <!-- <ElFormItem label="创群数量：">
            <ElInput type="text" v-model="form.group_number" style="width: 300px" />
          </ElFormItem> -->

        <ElFormItem label="群名称：">
          <ElInput type="text" v-model="form.group_name" style="width: 300px" />
        </ElFormItem>

        <!-- <ElFormItem label="推荐用户：">
            <ElInput type="textarea" v-model="form.name_text" style="width: 300px" />
          </ElFormItem> -->

        <!-- <ElFormItem label="推荐列表：" >
            <ElInput type="text" v-model="form.recommend_number" style="width: 150px" >
              <template #append>人</template>
            </ElInput>
          </ElFormItem> -->

        <ElFormItem label="自定义用户：">
          <ElInput
            type="textarea"
            v-model="form.name_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>

        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">
            请用","分隔 ,自定义用户指的是通过搜索功能添加用户
          </div>
        </ElFormItem>

        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton type="primary" @click="handelUploadTextarea('name_text')"
                >上传用户</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>

        <!-- <ElFormItem label="自定义博主：">
            <ElInput type="textarea" v-model="form.blogger_name_text" style="width: 400px; " rows="5" />
          </ElFormItem>

          <ElFormItem>
            <div style="font-size: 14px;color:#d2d2d2">请用","分隔 ,自定义博主指的是添加该博主下的粉丝,博主数过多可能会引发脚本运行时间过长并产生异常 </div>
          </ElFormItem>

          <ElFormItem label="博主粉丝数：" >
            <ElInput type="text" v-model="form.blogger_fans_number" style="width: 150px" >
              <template #append>人</template>
            </ElInput>
          </ElFormItem> -->

        <!-- <ElFormItem label="注册完成：">
            <ElRadioGroup v-model="form.resource">
              <el-radio label="自动暂停等待人工操作" />
              <el-radio label="自动关闭并退出" />
            </ElRadioGroup>
          </ElFormItem> -->
      </div>

      <div v-if="form.type == 2">
        <ElFormItem label="群链接：">
          <ElInput
            type="textarea"
            v-model="form.link_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">请用","分隔</div>
        </ElFormItem>
        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton type="primary" @click="handelUploadTextarea('link_text')"
                >上传群链接</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>

        <ElFormItem label="拉人总数：">
          <ElInput
            type="text"
            v-model="form.total_people"
            style="width: 100px"
          ></ElInput>
        </ElFormItem>

        <ElFormItem label="拉人时间间隔：">
          <ElInput
            type="text"
            v-model="form.pull_timeinterval_b"
            style="width: 100px"
          ></ElInput>
          <div style="margin-left: 20px; margin-right: 20px">-</div>
          <ElInput
            type="text"
            v-model="form.pull_timeinterval_e"
            style="width: 100px"
          ></ElInput>
          &nbsp;秒
        </ElFormItem>

        <ElFormItem label="自定义用户：">
          <ElInput
            type="textarea"
            v-model="form.name1_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">
            请用","分隔 ,自定义用户指的是通过搜索功能添加用户
          </div>
        </ElFormItem>
        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton type="primary" @click="handelUploadTextarea('name1_text')"
                >上传用户</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>
      </div>

      <div v-if="form.type == 3">
        <ElFormItem label="群链接：">
          <ElInput
            type="textarea"
            v-model="form.group_set_link_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">请用","分隔</div>
        </ElFormItem>
        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton
                type="primary"
                @click="handelUploadTextarea('group_set_link_text')"
                >上传群链接</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>

        <ElFormItem label="设置管理员：">
          <ElInput
            type="textarea"
            v-model="form.group_set_manager_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">请用","分隔</div>
        </ElFormItem>
        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton
                type="primary"
                @click="handelUploadTextarea('group_set_manager_text')"
                >上传管理员</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>

        <!-- <ElFormItem label="需要批准加入：">
          <el-switch v-model="form.is_approval" active-value="1" inactive-value="2" @change="handel_isAproval"  />
        </ElFormItem> -->
      </div>

      <div v-if="form.type == 4">
        <ElFormItem label="群发广告：">
          <ElInput
            type="textarea"
            v-model="form.group_ad_link_text"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
        <ElFormItem>
          <div style="font-size: 14px; color: #d2d2d2">请用","分隔</div>
        </ElFormItem>
        <ElFormItem>
          <ElUpload
            class="upload-demo"
            action="/"
            :limit="1"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleChangeUploadTxt"
          >
            <template #trigger>
              <ElButton
                type="primary"
                @click="handelUploadTextarea('group_ad_link_text')"
                >上传群链接</ElButton
              >
            </template>
          </ElUpload>
        </ElFormItem>

        <ElFormItem label="内容：">
          <ElInput
            type="textarea"
            v-model="form.group_ad_content"
            style="width: 400px"
            rows="5"
          />
        </ElFormItem>
      </div>

      <ElButton style="margin-left: 10px" type="primary" @click="saveConfigGroup"
        >保存</ElButton
      >
    </el-form>
  </div>
</template>

<script>
import { saveConfigGroup, getConfig, getConfigGroupByType } from "@/api/configGroup";

import { random } from "lodash";


export default {
  data() {
    return {
      form: {
        type: "1",
        avatarList: [],
        avatar_path: "",
        group_number: 1,
        is_approval: "",
        group_name: "",
        name_text: "",
        recommend_number: 0,
        blogger_name_text: "",
        blogger_fans_number: 0,

        link_text: "",
        name1_text: "",

        group_set_link_text: "",
        group_set_manager_text: "",

        group_ad_link_text: "",
        group_ad_content: "",
        total_people: 200,
        pull_timeinterval_b: 2,
        pull_timeinterval_e: 10,
      },
      type: 10,
      upload_textarea: "",
    };
  },

  async created() {
    this.getConfigGroupByType();
  },
  computed: {},
  methods: {
    async getConfigGroupByType() {
      let params = {
        type: this.type,
      };
      let response = await getConfigGroupByType(params);
      let data = response.data.data;
      if (response.data.code == 1) {
        this.form.type = data.type.toString();
        this.form.group_number = data.group_number;
        this.form.group_name = data.group_name;
        this.form.is_approval = data.is_approval.toString();
        this.form.name_text = data.name_text;
        this.form.recommend_number = data.recommend_number;
        this.form.blogger_name_text = data.blogger_name_text;
        this.form.blogger_fans_number = data.blogger_fans_number;

        this.form.link_text = data.link_text;
        this.form.name1_text = data.name1_text;

        this.form.group_set_link_text = data.group_set_link_text;
        this.form.group_set_manager_text = data.group_set_manager_text;

        this.form.group_ad_link_text = data.group_ad_link_text;
        this.form.group_ad_content = data.group_ad_content;

        this.form.avatar_path = data.avatar_path;
        this.form.total_people = data.total_people;

        this.form.pull_timeinterval_b = data.pull_timeinterval_b;
        this.form.pull_timeinterval_e = data.pull_timeinterval_e;
      }
    },

    //保存
    async saveConfigGroup() {
      let _this = this;

      let params = {
        type: this.form.type,
        avatar_path: this.form.avatar_path,
        group_number: this.form.group_number,
        group_name: this.form.group_name,
        is_approval: this.form.is_approval,
        name_text: this.form.name_text,
        recommend_number: this.form.recommend_number,
        blogger_name_text: this.form.blogger_name_text,
        blogger_fans_number: this.form.blogger_fans_number,
        link_text: this.form.link_text,
        name1_text: this.form.name1_text,
        group_set_link_text: this.form.group_set_link_text,
        group_set_manager_text: this.form.group_set_manager_text,
        group_ad_link_text: this.form.group_ad_link_text,
        group_ad_content: this.form.group_ad_content,
        total_people: this.form.total_people,
        pull_timeinterval_b: this.form.pull_timeinterval_b,
        pull_timeinterval_e: this.form.pull_timeinterval_e,
      };

      if (this.form.type == 10) {
        if (this.form.avatarList) {
          new Promise((resolve, reject) => {
            for (let i = 0; i < _this.form.avatarList.length; i++) {
              let num = Math.random() * 100000000;
              fse
                .copy(
                  _this.form.avatarList[i].raw.path,
                  _this.form.avatar_path + "/avatar_" + num + ".jpg"
                )
                .then(() => {});
            }
            //ElMessage({message: '上传成功',type: 'success'});
            resolve(1);
          });
        }
      }

      let response = await saveConfigGroup(params);
      let data = response.data.data;
      if (response.data.code == 1) {
        ElMessage({ message: response.data.msg, type: "success" });
      } else {
        ElMessage.error(response.data.msg);
      }
    },

    handel_chooes_type(v) {
      if (v == 10) {
        this.type = 10;
      }
      if (v == 1) {
        this.type = 1;
      }
      if (v == 2) {
        this.type = 2;
      }
      if (v == 3) {
        this.type = 3;
      }
      if (v == 4) {
        this.type = 4;
      }

      this.getConfigGroupByType();
    },

    handel_isAproval(val) {
      this.form.is_approval = val;
    },

    handelUploadTextarea(value) {
      this.upload_textarea = value;
    },

    handleChangeUploadTxt(file) {
      if (file.raw.type != "text/plain") {
        ElMessage.error("只支持上传Txt文件");
        return false;
      }

      let _this = this;
      //let fileName = file.raw.name;
      let filePath = file.raw.path;
      new Promise((resolve, reject) => {
        fse.readFile(filePath, "utf8").then((fileContents) => {
          let contentStr = fileContents.replace(/\n|\r\n/g, ",");

          if (_this.upload_textarea == "name_text") {
            _this.form.name_text = contentStr;
          }
          if (_this.upload_textarea == "blogger_name_text") {
            _this.form.blogger_name_text = contentStr;
          }
          if (_this.upload_textarea == "link_text") {
            _this.form.link_text = contentStr;
          }
          if (_this.upload_textarea == "name1_text") {
            _this.form.name1_text = contentStr;
          }
          if (_this.upload_textarea == "group_set_link_text") {
            _this.form.group_set_link_text = contentStr;
          }
          if (_this.upload_textarea == "group_set_manager_text") {
            _this.form.group_set_manager_text = contentStr;
          }
          if (_this.upload_textarea == "group_ad_link_text") {
            _this.form.group_ad_link_text = contentStr;
          }

          ElMessage({ message: "上传成功", type: "success" });
          resolve(1); //异步处理
        });
      });
    },

    handleUploadAvatar(file, fileList) {
      let _this = this;
      if (!_this.form.avatar_path) {
        ElMessage.error("请输入头像路径");
        return false;
      }

      if (!_this.form.avatarList.length >= 10) {
        ElMessage.error("一次只能上传10张图片");
        return false;
      }

      // if(file.raw.type != 'text/plain'){
      //   ElMessage.error('只支持上传Txt文件')
      //   return false;
      // }
      this.form.avatarList = [];
      this.form.avatarList.push(file);
    },
  },
};
</script>
<style></style>
