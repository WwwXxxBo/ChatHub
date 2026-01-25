<script setup lang="ts">
import { ref, reactive } from "vue";
import { type ChatMessage } from "@/types";
import { Message } from '@arco-design/web-vue'
import { randomUUID } from "@/utils/id-util";
import { useUserStore } from "@/stores/user";
import { useCollectionStore } from '@/stores/collection'
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useSettingStore } from "@/stores/setting";
import { getUserData, resgisterUser } from "@/api/user";
import { getAssistantList, getAssistantMessageList, getNoteList, getNoteMessageList } from "@/api/assistant"
import { getProviderListByUserId, createProvider } from '@/api/setting'
import axios from "axios";
import { copyObj } from "@/utils/object-util";
import type { FormInstance } from '@arco-design/web-vue';

const userStore = useUserStore();
const collectionStore = useCollectionStore();
const chatAssistantStore = useChatAssistantStore();
const settingStore = useSettingStore();

const errorMessage = ref('');
const successMessage = ref('');

const activeKey = ref('login');

// 向后端发送的表单数据
const loginForm = ref({
  phone: "",
  password: "",
});

// 注册表单实例
const registerFormRef = ref<FormInstance>();

// 注册表单数据
const registerForm = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  validatePassword: "",
});

// 注册表单验证规则
const registerRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { minLength: 2, message: '用户名至少2个字符', trigger: ['blur', 'change'] },
    { maxLength: 20, message: '用户名最多20个字符', trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'change'] },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'change']
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
    {
      match: /^1[3-9]\d{9}$/,
      message: '请输入有效的11位手机号',
      trigger: ['blur', 'change']
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
    { minLength: 6, message: '密码长度至少为6位', trigger: ['blur', 'change'] },
    { maxLength: 20, message: '密码长度最多为20位', trigger: ['blur', 'change'] },
  ],
  validatePassword: [
    { required: true, message: '请再次输入密码', trigger: ['blur', 'change'] },
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== registerForm.password) {
          callback('两次输入的密码不一致');
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change']
    },
  ],
};

// 注册
const toRegister = async () => {

  const error = await registerFormRef.value?.validate();
  if (error) {
    return;
  }

  try {
    const registerRes = await resgisterUser(
      registerForm.name,
      registerForm.email,
      registerForm.phone,
      registerForm.password,
    );
    if (registerRes.status) {
      errorMessage.value = '';
      successMessage.value = registerRes.message;
      // 回填登录表单数据
      loginForm.value.phone = registerForm.phone;
      loginForm.value.password = registerForm.password;
      // 清空表单数据
      registerForm.name = "";
      registerForm.email = "";
      registerForm.phone = "";
      registerForm.password = "";
      registerForm.validatePassword = "";
      // 切换到登录界面
      activeKey.value = "login";
    }
  } catch (error) {
    errorMessage.value = '注册失败，请稍后重试';
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

    // 存储用户信息
    if (loginRes.data.user) {
      // 存储用户登录状态
      userStore.id = loginRes.data.user.id;
      userStore.name = loginRes.data.user.name;
      userStore.email = loginRes.data.user.email;
      userStore.phone = loginRes.data.user.phone;
      sessionStorage.userId = loginRes.data.user.id;
    }

    /* ----------------------聊天助手初始化---------------------- */
    const assistantListRes = await getAssistantList(loginRes.data.user.id);
    const newChatAssistantList = []
    for (var assistant of assistantListRes.data.assistants) {
      // 获取该助手的消息列表
      const res = await getAssistantMessageList(assistant.assistantId);
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
      for (var assistant_message of res.data.messages) {
        newChatAssistant.chatMessageList.push({
          id: assistant_message.messageId,
          type: assistant_message.type,
          role: assistant_message.role,
          content: assistant_message.content,
          image: assistant_message.image,
          createTime: assistant_message.createTime
        })
      }
      newChatAssistantList.unshift(newChatAssistant);
    }
    chatAssistantStore.updateChatAssistantList(newChatAssistantList);

    /* ----------------------笔记初始化---------------------- */
    const chatCollectionRes = await getNoteList(sessionStorage.userId);
    if (!chatCollectionRes.status) {
      Message.error(chatCollectionRes.message);
    }
    for (var chatCollection of chatCollectionRes.data.notes) {
      if (chatCollection.type === 'note') {
        collectionStore.collectionItemList.unshift({
          id: chatCollection.noteId,
          type: 'note',
          note: {
            title: chatCollection.title,
            content: chatCollection.content
          },
          createTime: chatCollection.createTime
        })
      } else {
        const chatCollectionMessageRes = await getNoteMessageList(chatCollection.noteId);
        const newChatCollection = {
          id: chatCollection.noteId,
          type: 'chat',
          chat: {
            ...copyObj(chatAssistantStore.chatAssistantList.find((c) => c.id === chatCollection.assistantId)),
            chatMessageList: []
          },
          comment: chatCollection.comment,
          createTime: chatCollection.createTime
        }
        for (var chatCollectionMessage of chatCollectionMessageRes.data.messages) {
          newChatCollection.chat.chatMessageList.push({
            id: chatCollectionMessage.messageId,
            type: chatCollectionMessage.type,
            role: chatCollectionMessage.role,
            name: chatCollectionMessage.name,
            content: chatCollectionMessage.content,
            comment: chatCollectionMessage.comment,
            image: chatCollectionMessage.image,
            createTime: chatCollectionMessage.createTime
          })
        }
        collectionStore.collectionItemList.unshift(newChatCollection);
      }
    }
    /* ----------------------设置初始化---------------------- */
    const providerRes = (await getProviderListByUserId(loginRes.data.user.id));
    if (!providerRes.status) {
      Message.error(providerRes.message);
    }
    if (providerRes.data.providers.length === 0) {
      // 没有API信息则创建
      const deepseekId = randomUUID();
      const tongyiId = randomUUID();
      const moonshotAIId = randomUUID();
      const zhipuAIId = randomUUID();
      const doubaoId = randomUUID();

      const deepseekRes = await createProvider(deepseekId, loginRes.data.user.id, 'deepseek', '', '');
      const tongyiRes = await createProvider(tongyiId, loginRes.data.user.id, 'tongyi', '', '');
      const moonshotAIRes = await createProvider(moonshotAIId, loginRes.data.user.id, 'moonshotAI', '', '');
      const zhipuAIRes = await createProvider(zhipuAIId, loginRes.data.user.id, 'zhipuAI', '', '');
      const doubaoRes = await createProvider(doubaoId, loginRes.data.user.id, 'doubao', '', '');

      if (deepseekRes.status && tongyiRes.status && moonshotAIRes.status && zhipuAIRes.status && doubaoRes.status) {
        Message.success('大模型API初始化成功');
      } else {
        Message.error('大模型API初始化失败');
      }
    } else {
      for (var provider of providerRes.data.providers) {
        if (provider.provider === 'deepseek') {
          settingStore.deepSeek.apiKey = provider.apiKey;
          settingStore.deepSeek.id = provider.providerId;
        } else if (provider.provider === 'tongyi') {
          settingStore.tongyi.apiKey = provider.apiKey;
          settingStore.tongyi.id = provider.providerId;
        } else if (provider.provider === 'moonshotAI') {
          settingStore.moonshotAI.apiKey = provider.apiKey;
          settingStore.moonshotAI.id = provider.providerId;
        } else if (provider.provider === 'zhipuAI') {
          settingStore.zhipuAI.apiKey = provider.apiKey;
          settingStore.zhipuAI.id = provider.providerId;
        } else if (provider.provider === 'doubao') {
          settingStore.doubao.apiKey = provider.apiKey;
          settingStore.doubao.id = provider.providerId;
        }
      }
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试';
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
        面向教学视频的片段检索与智能问答系统
      </div>
      <!-- 版权信息 -->
      <div class="login-left-copyright">
        © 2026 王轩 版权所有
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
              <a-form ref="registerFormRef" :model="registerForm" :rules="registerRules" layout="vertical"
                auto-label-width @submit="toRegister">
                <a-form-item field="name" label="用户名" hide-label>
                  <a-input placeholder="请输入您的用户名" v-model="registerForm.name" allow-clear>
                    <template #prefix>
                      <icon-user />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item field="phone" label="手机号" hide-label>
                  <a-input placeholder="请输入您的手机号" v-model="registerForm.phone" allow-clear>
                    <template #prefix>
                      <icon-phone />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item field="email" label="邮箱" hide-label>
                  <a-input placeholder="请输入您的邮箱" v-model="registerForm.email" allow-clear>
                    <template #prefix>
                      <icon-email />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item field="password" label="密码" hide-label>
                  <a-input-password placeholder="请输入您的密码（至少6位）" v-model="registerForm.password" allow-clear>
                    <template #prefix>
                      <icon-lock />
                    </template>
                  </a-input-password>
                </a-form-item>

                <a-form-item field="validatePassword" label="确认密码" hide-label>
                  <a-input-password placeholder="请再次输入您的密码" v-model="registerForm.validatePassword" allow-clear>
                    <template #prefix>
                      <icon-lock />
                    </template>
                  </a-input-password>
                </a-form-item>

                <a-form-item>
                  <a-button html-type="submit" type="primary" long style="background-color: #856cff; font-weight: 600;">
                    注册
                  </a-button>
                </a-form-item>
              </a-form>

              <!-- 全局错误信息显示区域 -->
              <div v-if="errorMessage" class="global-error-message">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="global-success-message">
                {{ successMessage }}
              </div>
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
      margin-top: 8px;
    }

    .success-message {
      color: #856cff;
      font-weight: 1000;
      font-size: 14px;
      text-align: left;
      margin-top: 8px;
    }

    .global-error-message {
      color: red;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      margin-top: 12px;
      padding: 8px;
      background-color: rgba(255, 0, 0, 0.05);
      border-radius: 4px;
      border-left: 3px solid red;
    }

    .global-success-message {
      color: #856cff;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      margin-top: 12px;
      padding: 8px;
      background-color: rgba(133, 108, 255, 0.05);
      border-radius: 4px;
      border-left: 3px solid #856cff;
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

  /* 表单样式调整 */
  :deep(.arco-form-item) {
    margin-bottom: 12px;
  }

  :deep(.arco-form-item:last-child) {
    margin-bottom: 0;
  }

  :deep(.arco-form-item-label-col) {
    padding-bottom: 0;
  }

  :deep(.arco-form-item-message) {
    font-size: 12px;
    margin-top: 4px;
    text-align: left;
  }
}
</style>