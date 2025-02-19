<script setup>
import { login } from "@/api/login";
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useStorage } from "@vueuse/core";
import { message } from "ant-design-vue";
const { t, locale } = useI18n();
const token = useStorage("token", "");

const router = useRouter();

const loginForm = reactive({
  invitationCode: "",
  username: "",
  password: "",
});
async function handleLogin() {
  if (!loginForm.username) {
    message.info("用户名不能为空");
    return false;
  }

  if (!loginForm.password) {
    message.error("密码不能为空");
    return false;
  }

  let params = {
    account: loginForm.username,
    password: loginForm.password,
  };
  let response = await login(params);
  let data = response.data;

  console.log(data.data);

  if (data.status == 200) {
    token.value = "Bearer " + data.data.token;
    message.success(data.msg);
    router.push({ path: "/" });
  } else {
    message.error(data.msg);
  }
}
</script>

<template>
  <div id="poster">
    <a-form
      :model="loginForm"
      name="normal_login"
      class="login-form"
      @finish="handleLogin"
      labelAlign="left"
      :label-col="{ span: 5 }"
    >
      <h3 class="login_title">
        {{ t("navigation.login.title") }}
      </h3>
      <a-form-item
        :label="t('navigation.login.username')"
        name="username"
        :rules="[{ required: true, message: t('navigation.login.rules.usernameEmpty') }]"
      >
        <a-input v-model:value="loginForm.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        :label="t('navigation.login.password')"
        name="password"
        :rules="[{ required: true, message: t('navigation.login.rules.passwordEmpty') }]"
      >
        <a-input-password v-model:value="loginForm.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
        >
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.login-form {
  border-radius: 15px;
  background-clip: padding-box;
  width: 400px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 15px #cac6c6;
  margin: 0 20px;

  button {
    width: 100%;
  }
}

.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}

#poster {
  background: url("@/assets/login_bg.png") no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;
  background-size: cover;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;

  /* background-color: #2a2c2e */
}
body {
  margin: 0px;
}
</style>
