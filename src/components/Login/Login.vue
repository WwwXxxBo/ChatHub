<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";
// 引入接口
import { type BigModelProvider, type ChatMessage, type SystemChatMessage } from "@/types";
// 引入 UI 库中的提示组件
import { Message } from "@arco-design/web-vue";
// 引入 User、eChatAssistant 状态
import { useUserStore } from "@/stores/user";
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useAssistantStore } from "@/stores/assistant";
// 引入 Collection 状态
import { useCollectionStore } from '@/stores/collection'
import { useSettingStore } from "@/stores/setting";
import { getUserData } from "@/api/login";
import { getCommonSetting, createCommonSetting } from "@/api/setting";
import { getAssistantList, getAssistantMessageList, getNoteCollectionList, getChatCollectionList, getChatCollectionMessageList, getSystemAssistantList, getSystemAssistantMessageList } from "@/api/assistant"
import { copyObj } from "@/utils/object-util";

const userStore = useUserStore();
const chatAssistantStore = useChatAssistantStore();
const collectionStore = useCollectionStore();
const assistantStore = useAssistantStore();
const settingStore = useSettingStore();

// 向后端发送的表单数据
const loginForm = ref({
  phone: "",
  password: "",
});

// 检查登录密码
const validatePhone = (phone: string) => {
  const reg = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
  if (!reg.test(phone)) {
    return false;
  }
  return true;
};

// 检查登录密码
const validatePassword = (password: string) => {
  const reg = /^[a-z|A-Z|0-9]*$/;
  if (!reg.test(password)) {
    return false;
  }
  return true;
};

// 登录
const toLogin = async () => {
  if (!validatePhone(loginForm.value.phone)) {
    Message.error("手机号码格式错误");
  }
  if (!validatePassword(loginForm.value.password)) {
    Message.error("密码格式错误，密码由字母与数字组成");
  }

  const userData = await getUserData(
    loginForm.value.phone,
    loginForm.value.password
  );
  if (userData.status == 0) {
    // 关闭登录页
    userStore.isLogin = true;
    Message.success("登录成功");

    if (userData.data) {
      // 保存用户的登录信息状态
      userStore.nickname = userData.data.name;
      // 存储用户登录状态
      sessionStorage.userId = userData.data.id;
      sessionStorage.name = userData.data.name;
      sessionStorage.email = userData.data.email;
      sessionStorage.phone = userData.data.phone;
      sessionStorage.userType = userData.data.type;
      sessionStorage.userName = userData.data.user_name;
      sessionStorage.idcard = userData.data.idcard;
      localStorage.setItem('loginflag', 'true');
    }

    // 初始化聊天助手和用户消息
    const assistantListRes = await getAssistantList(sessionStorage.userId);
    for (var assistant of assistantListRes.data) {
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
        speechModel: assistant.speechModel,
        speechVoice: assistant.speechVoice,
        speechSpeed: assistant.speechSpeed
      }
      for (var assistant_message of res.data) {
        newChatAssistant.chatMessageList.push({
          id: assistant_message.messageId,
          type: assistant_message.type,
          role: assistant_message.role,
          content: assistant_message.content,
          image: assistant_message.image,
          createTime: assistant_message.createTime
        })
      }
      data.newChatAssistantList.unshift(newChatAssistant);
    }
    chatAssistantStore.updateChatAssistantList(data.newChatAssistantList);

    // 初始化系统聊天助手和用户信息
    const systemAssistantListRes = await getSystemAssistantList(sessionStorage.userId);
    for (var systemAssistant of systemAssistantListRes.data) {
      // 获取该助手的消息列表
      const res = await getSystemAssistantMessageList(systemAssistant.assistantId);
      const newVirtualAssistant = {
        id: systemAssistant.assistantId,
        type: systemAssistant.type,
        name: systemAssistant.name,
        provider: systemAssistant.provider,
        model: systemAssistant.model,
        createTime: systemAssistant.createTime,
        lastUpdateTime: systemAssistant.lastUpdateTime,
        chatMessageList: new Array<SystemChatMessage>(),
        instruction: systemAssistant.instruction,
        inputMaxTokens: systemAssistant.inputMaxTokens,
        maxTokens: systemAssistant.maxTokens,
        contextSize: systemAssistant.contextSize,
        speechModel: systemAssistant.speechModel,
        speechVoice: systemAssistant.speechVoice,
        speechSpeed: systemAssistant.speechSpeed
      }
      for (var system_assistant_message of res.data) {
        newVirtualAssistant.chatMessageList.push({
          id: system_assistant_message.messageId,
          role: system_assistant_message.role,
          name: system_assistant_message.name,
          content: system_assistant_message.content,
          createTime: system_assistant_message.createTime
        })
      }

      data.newVirtualAssistantList.unshift(newVirtualAssistant);
    }
    assistantStore.updateVirtualAssistantList(data.newVirtualAssistantList);

    // 初始化笔记收藏
    const noteCollectionRes = await getNoteCollectionList(sessionStorage.userId);
    for (var noteCollection of noteCollectionRes.data) {
      collectionStore.collectionItemList.unshift({
        id: noteCollection.noteCollectionId,
        type: 'note',
        note: {
          title: noteCollection.title,
          content: noteCollection.content
        },
        createTime: noteCollection.createTime
      })
    }

    // 初始化聊天收藏列表
    const chatCollectionRes = await getChatCollectionList(sessionStorage.userId);
    for (var chatCollection of chatCollectionRes.data) {
      const chatCollectionMessageRes = await getChatCollectionMessageList(chatCollection.chatCollectionId);
      const newChatCollection = {
        id: chatCollection.chatCollectionId,
        type: 'chat',
        chat: {
          ...copyObj(chatAssistantStore.chatAssistantList.find((c) => c.id === chatCollection.assistantId)),
          chatMessageList: []
        },
        createTime: chatCollection.createTime
      }
      for (var chatCollectionMessage of chatCollectionMessageRes.data) {
        newChatCollection.chat.chatMessageList.push({
          id: chatCollectionMessage.messageId,
          type: chatCollectionMessage.type,
          role: chatCollectionMessage.role,
          name: chatCollectionMessage.name,
          content: chatCollectionMessage.content,
          image: chatCollectionMessage.image,
          createTime: chatCollectionMessage.createTime
        })
      }
      collectionStore.collectionItemList.unshift(newChatCollection);
    }

    // 获取用户通用设置
    const commonSettingRes = await getCommonSetting(sessionStorage.userId);
    if (commonSettingRes.data.length === 0) {
      const res = await createCommonSetting(
        sessionStorage.userId,
        settingStore.openAI.key,
        settingStore.zhipuAI.apiKey,
        settingStore.ernie.apiKey,
        settingStore.ernie.secretKey,
        settingStore.spark.appId,
        settingStore.spark.secret,
        settingStore.spark.key,
        settingStore.tongyi.apiKey,
        settingStore.moonshotAI.apiKey,
        settingStore.tiangong.appKey,
        settingStore.tiangong.appSecret,
        settingStore.stepFun.apiKey,
        settingStore.deepSeek.apiKey,
        settingStore.baichuan.apiKey
      )
      if (res.status === 0) {
        Message.success("通用设置初始化成功");
      } else {
        Message.success("通用设置初始化失败");
      }
    } else {
      settingStore.openAI.key = commonSettingRes.data[0].openAIKey
      settingStore.zhipuAI.apiKey = commonSettingRes.data[0].zhipuAIKey
      settingStore.ernie.apiKey = commonSettingRes.data[0].ernieAPIKey
      settingStore.ernie.secretKey = commonSettingRes.data[0].ernieSecretKey
      settingStore.spark.appId = commonSettingRes.data[0].sparkAppId
      settingStore.spark.secret = commonSettingRes.data[0].sparkSecret
      settingStore.spark.key = commonSettingRes.data[0].sparkKey
      settingStore.tongyi.apiKey = commonSettingRes.data[0].tongyiKey
      settingStore.moonshotAI.apiKey = commonSettingRes.data[0].moonshotAIKey
      settingStore.tiangong.appKey = commonSettingRes.data[0].tiangongAppKey
      settingStore.tiangong.appSecret = commonSettingRes.data[0].tiangongAppSecret
      settingStore.stepFun.apiKey = commonSettingRes.data[0].stepFunKey
      settingStore.deepSeek.apiKey = commonSettingRes.data[0].deepSeekKey
      settingStore.baichuan.apiKey = commonSettingRes.data[0].baichuanKey
    }
  }
};
</script>

<template>
  <div class="login-page z-index-max">
    <div class="login-layout">
      <div class="login-left">
        <a-space direction="vertical" size="large">
          <div class="login-title">登录</div>
          <!-- 手机号输入 -->
          <el-input v-model="loginForm.phone" style="width: 240px" size="large" placeholder="Please Input" />
          <a-input placeholder="请输入您的手机号" v-model="loginForm.phone">
            <template #prefix>
              <icon-phone />
            </template>
          </a-input>
          <!-- 密码输入 -->
          <a-input-password placeholder="请输入您的密码" v-model="loginForm.password">
            <template #prefix>
              <icon-stamp />
            </template>
          </a-input-password>
          <a-button shape="round" @click="toLogin" long>登录</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-page {
  height: 100%;
  width: 100%;
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  background: #F3F3F3;
  overflow: hidden;

  .login-layout {
    display: flex;
    width: 60%;
    max-width: 500px;
    height: 80%;
    max-height: 400px;
    border-radius: 24px;
    overflow: hidden;
    background-color: #EDDDA2;
    align-items: center;
    justify-content: center;
  }

}


.login-title {
  font-weight: 1000;
  font-size: 40px;
  text-align: center;
  margin-bottom: 10px;
}
</style>