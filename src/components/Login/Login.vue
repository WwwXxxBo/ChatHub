<script setup lang="ts">
import { ref } from 'vue'
// 引入 UI 库中的提示组件
import { Message } from "@arco-design/web-vue";
import { getUserData } from "@/api/login"

const loginForm = ref({
  phone:'',
  password:''
})

// 检查登录密码
const validatePhone = (phone: string) => {
  const reg = /^1[3|4|5|6|7|8|9][0-9]{9}$/
  if(!reg.test(phone)){
    return false
  }
  return true
}

// 检查登录密码
const validatePassword = (password: string) => {
  const reg = /^[a-z|A-Z|0-9]*$/
  if(!reg.test(password)){
    return false
  }
  return true
}

// 登录
const toLogin = async () => {
  if(!validatePhone(loginForm.value.phone)){
    Message.error('手机号码格式错误')
  }
  if (!validatePassword(loginForm.value.password)){
    Message.error('密码格式错误，密码由字母与数字组成')
  }
  const data = await getUserData(loginForm.value.phone, loginForm.value.password)
  console.log('返回的数据', data)
}
</script>

<template>
  <div class="login-page">
    <!-- 左侧区域 -->
    <div class="login-box">
      <a-space direction="vertical" size="large">
        <h1>欢迎来到大模型对话平台</h1>
        <a-form :model="loginForm" :style="{ width: '400px' }">
          <a-form-item required label="手机号">
            <a-input v-model="loginForm.phone" />
          </a-form-item>
          <a-form-item required label="密码">
            <a-input v-model="loginForm.password" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" long @click="toLogin">登录</a-button>
          </a-form-item>
        </a-form>
      </a-space>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  // 设置渐变背景
  background-color: hsla(221, 94%, 51%, 1);
  background-image: radial-gradient(
      at 12% 50%,
      hsla(10, 21%, 87%, 0.87) 0px,
      transparent 50%
    ),
    radial-gradient(at 65% 9%, hsla(12, 80%, 86%, 1) 0px, transparent 50%),
    radial-gradient(at 86% 74%, hsla(12, 28%, 83%, 1) 0px, transparent 50%);
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-box {
  background-color: white;
  border-radius: 10px;
  height: 500px;
  width: 500px;
  display: flex;
  text-align: center;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
