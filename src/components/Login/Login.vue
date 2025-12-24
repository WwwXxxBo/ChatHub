<script setup lang="ts">
import { ref } from "vue";
import { type ChatMessage, type SystemChatMessage } from "@/types";
import { Message } from '@arco-design/web-vue'
import { useUserStore } from "@/stores/user";
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { getUserData, resgisterUser } from "@/api/login";
import { getAssistantList } from "@/api/assistant"
import axios from "axios";

const userStore = useUserStore();
const chatAssistantStore = useChatAssistantStore();

const errorMessage = ref('');
const successMessage = ref('');

const activeKey = ref('login');

// 向后端发送的表单数据
const loginForm = ref({
  phone: "",
  password: "",
});

const registerForm = ref({
  name: "",
  email: "",
  phone: "",
  password: "",
  validatePassword: "",
});

// 注册
const toRegister = async () => {
  try {
    const registerRes = await resgisterUser(
      registerForm.value.name,
      registerForm.value.email,
      registerForm.value.phone,
      registerForm.value.password,
    );
    if (registerRes.status) {
      errorMessage.value = '';
      successMessage.value = registerRes.message;
      // 回填登录表单数据
      loginForm.value.phone = registerForm.value.phone;
      loginForm.value.password = registerForm.value.password;
      // 清空表单数据
      registerForm.value.name = "";
      registerForm.value.email = "";
      registerForm.value.phone = "";
      registerForm.value.password = "";
      registerForm.value.validatePassword = "";
      // 切换到登录界面
      activeKey.value = "login";
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试。';
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response && response.data) {
        const responseData = response.data;
        // 优先使用 errors 数组中的错误信息
        if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage.value = responseData.errors.join('；');
        }
        else if (typeof responseData.message === 'string') {
          errorMessage.value = responseData.message;
        }
      }
    }
  }
}

// 登录
const toLogin = async () => {
  try {
    const loginRes = await getUserData(
      loginForm.value.phone,
      loginForm.value.password
    );
    // 登录成功，关闭登录页
    userStore.isLogin = true;
    Message.success(loginRes.message);

    // 获取聊天助手数据
    const assistantListRes = await getAssistantList(1);
    const newChatAssistantList = []
    for (var assistant of assistantListRes.data.assistants) {
      const newChatAssistant = {
        id: assistant.assistantId,
        type: assistant.type,
        name: assistant.name,
        provider: assistant.provider,
        model: assistant.model,
        createTime: assistant.createTime,
        lastUpdateTime: assistant.lastUpdateTime,
        chatMessageList: new Array<ChatMessage>(),
        instruction: assistant.instruction,
        inputMaxTokens: assistant.inputMaxTokens,
        maxTokens: assistant.maxTokens,
        contextSize: assistant.contextSize,
      }
      newChatAssistantList.unshift(newChatAssistant);
    }
    chatAssistantStore.updateChatAssistantList(newChatAssistantList);

  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试。';
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response && response.data) {
        const responseData = response.data;
        // 优先使用 errors 数组中的错误信息
        if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          errorMessage.value = responseData.errors.join('；');
        }
        else if (typeof responseData.message === 'string') {
          errorMessage.value = responseData.message;
        }
      }
    }
  }
};
</script>

<template>
  <div class="login-page z-index-max">
    <!-- 左侧紫色背景 -->
    <div class="login-left">
      <!-- 主标题 -->
      <div class="login-left-title">
        基于MD-CLIP的双通道教学视频对话平台
      </div>
      <!-- 版权信息 -->
      <div class="login-left-copyright">
        © 2025 王轩 版权所有
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="login-right">
      <div class="login-layout">
        <!-- 选项卡 -->
        <div class="radio-group-wrapper">
          <a-radio-group v-model="activeKey" type="button">
            <a-radio value="login" style="color: #856cff; font-weight: 600;">登录</a-radio>
            <a-radio value="register" style="color: #856cff; font-weight: 600;">注册</a-radio>
          </a-radio-group>
        </div>
        <!-- 登录/注册区 -->
        <a-tabs :active-key="activeKey" class="custom-tabs">
          <a-tab-pane key="login">
            <div class="form-content">
              <a-space direction="vertical" size="large" fill style="width: 100%">
                <a-input placeholder="请输入您的用户名/手机号/邮箱" v-model="loginForm.phone">
                  <template #prefix>
                    <icon-email />
                  </template>
                </a-input>
                <a-input-password placeholder="请输入您的密码" v-model="loginForm.password">
                  <template #prefix>
                    <icon-lock />
                  </template>
                </a-input-password>
                <a-button block @click="toLogin" type="primary"
                  style="width: 100%;background-color: #856cff;font-weight: 600;">登录</a-button>
                <!-- 错误信息显示区域 -->
                <div v-if="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="error-message">
                  {{ successMessage }}
                </div>
              </a-space>
            </div>
          </a-tab-pane>
          <a-tab-pane key="register">
            <div class="form-content">
              <a-space direction="vertical" size="large" fill style="width: 100%">
                <a-input placeholder="请输入您的用户名" v-model="registerForm.name">
                  <template #prefix>
                    <icon-user />
                  </template>
                </a-input>
                <a-input placeholder="请输入您的手机号" v-model="registerForm.phone">
                  <template #prefix>
                    <icon-phone />
                  </template>
                </a-input>
                <a-input placeholder="请输入您的邮箱" v-model="registerForm.email">
                  <template #prefix>
                    <icon-email />
                  </template>
                </a-input>
                <a-input-password placeholder="请输入您的密码" v-model="registerForm.password">
                  <template #prefix>
                    <icon-lock />
                  </template>
                </a-input-password>
                <a-input-password placeholder="请再次输入您的密码" v-model="registerForm.validatePassword">
                  <template #prefix>
                    <icon-lock />
                  </template>
                </a-input-password>
                <a-button @click="toRegister()" type="primary"
                  style="width: 100%; background-color: #856cff; font-weight: 600;">注册</a-button>
                <!-- 错误信息显示区域 -->
                <div v-if="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="success-message">
                  {{ successMessage }}
                </div>
              </a-space>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-page {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-left,
  .login-right {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .error-message {
      color: red;
      font-weight: 1000;
      font-size: 14px;
      text-align: left;
    }

    .success-message {
      color: #856cff;
      font-weight: 1000;
      font-size: 14px;
      text-align: left;
    }
  }

  .login-left {
    color: white;
    position: relative;
    padding: 0 40px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(30deg,
        #ff6da1 0%,
        #ff6da1 10%,
        #ff77a4 10%,
        #ff77a4 20%,
        #ff7ba7 20%,
        #ff7ba7 30%,
        #ff79aa 30%,
        #ff79aa 40%,
        #ff71ad 40%,
        #ff71ad 50%,
        #eb65af 50%,
        #eb65af 60%,
        #cd5ab2 60%,
        #cd5ab2 70%,
        #ad51b4 70%,
        #ad51b4 80%,
        #8c4fb6 80%,
        #8c4fb6 90%,
        #6b53b7 90%,
        #6b53b7 100%);

    /* 动画设置：扩展背景并移动 */
    background-size: 200% 200%;
    animation: gradientFlow 15s ease-in-out infinite alternate;
  }

  /* 渐变流动动画 */
  @keyframes gradientFlow {
    0% {
      background-position: 0% 0%;
    }

    100% {
      background-position: 100% 100%;
    }
  }

  /* 光泽效果：对角线光带 */
  .login-left::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to right,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent);
    transform: rotate(30deg);
    /* 与渐变角度一致，更协调 */
    filter: blur(12px);
    z-index: 1;
    animation: shineGlow 4s infinite ease-in-out;
  }

  /* 光泽移动动画 */
  @keyframes shineGlow {
    0% {
      transform: rotate(30deg) translateX(-30%);
    }

    100% {
      transform: rotate(30deg) translateX(30%);
    }
  }

  .login-left>* {
    position: relative;
    z-index: 2;
  }

  .login-left-title {
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 30px;
    font-weight: bold;
    font-style: italic; // ← 斜体
    line-height: 1.6; // ← 增大行高，让文字更舒展
    letter-spacing: 1px; // ← 可选：增加字母间距，提升可读性
    max-width: 80%;
    word-break: break-word;
  }

  .login-left-copyright {
    font-size: 12px;
    opacity: 0.8;
    margin-top: auto;
    /* 确保在底部 */
    padding-bottom: 20px;
    /* 底部留白 */
  }

  .login-right {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
  }

  .login-layout {
    width: 320px;
    text-align: center;
  }

  .radio-group-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  .custom-tabs .arco-tabs-nav::before {
    display: none !important;
  }

  .form-content {
    display: flex;
    justify-content: center;
  }

  .form-content .arco-space {
    width: 100%;
  }

  .login-title {
    font-weight: 1000;
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
  }
}
</style>