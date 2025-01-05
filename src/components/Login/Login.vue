<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick } from "vue";
// 引入接口
import { type BigModelProvider, type ChatMessage, type CollectionItem, type SystemChatMessage } from "@/types";
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

// 引入大模型提供商图标
const data = reactive({
  providers: [
    "OpenAI",
    "Ollama",
    "ZhipuAI",
    "Tongyi",
    "ERNIE",
    "Spark",
    "Tiangong",
    "MoonshotAI",
    "StepFun",
    "DeepSeek",
    "BaiChuan",
  ] as BigModelProvider[],
  providerShowIndex: -1,
  newChatAssistantList: [] as any,
  newVirtualAssistantList: [] as any
});
const { providers, providerShowIndex } = toRefs(data);

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
    for(var assistant of assistantListRes.data) {
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
      for(var assistant_message of res.data){
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
    for(var systemAssistant of systemAssistantListRes.data) {
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
      for(var system_assistant_message of res.data){
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
    for(var noteCollection of noteCollectionRes.data){
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
    for(var chatCollection of chatCollectionRes.data){
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
      for(var chatCollectionMessage of chatCollectionMessageRes.data){
        newChatCollection.chat.chatMessageList.push({
          id:  chatCollectionMessage.messageId,
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
    if(commonSettingRes.data.length === 0){
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
      if(res.status === 0){
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
    <!-- 左侧区域 -->
    <div class="left-panel">
      <div class="introduction-container">
        <div class="introduction-title">大模型对话平台</div>
        <div class="introduction-content">北京邮电大学MAIR团队开发的一款支持多种大语言模型的智能辅助问答系统</div>
        <div class="introduction-list">
          <a-row :gutter="[25, 12]">
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/model.png" />
                </a-avatar>
                <div class="instruction-title">模型支持</div>
                <div class="instruction-content">
                  支持OpenAI、MoonShot、智谱AI等国内外流行大模型
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/local.png" />
                </a-avatar>
                <div class="instruction-title">本地模型支持</div>
                <div class="instruction-content">
                  支持用户使用Ollama部署的本地模型
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/image.png" />
                </a-avatar>
                <div class="instruction-title">多模态支持</div>
                <div class="instruction-content">
                  支持使用多模态模型处理用户上传的图片
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/file.png" />
                </a-avatar>
                <div class="instruction-title">文件上传支持</div>
                <div class="instruction-content">
                  支持用户上传PPTX、DOCX、TXT、PDF等类型的文件
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/agent.png" />
                </a-avatar>
                <div class="instruction-title">支持智能化操作</div>
                <div class="instruction-content">
                  用户可与模型对话，支持选课等操作
                </div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="content">
                <a-avatar :size="30" shape="square" class="function-avatar">
                  <img alt="avatar" src="@/assets/images/Login/record.png" />
                </a-avatar>
                <div class="instruction-title">支持记录导出</div>
                <div class="instruction-content">
                  用户可以自由导出与大模型的历史对话记录
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>
    <!-- 右侧区域 -->
    <div class="right-panel">
      <a-space direction="vertical" size="large">
        <div class="login-tile">登录</div>
        <!-- 手机号输入 -->
        <a-input placeholder="请输入您的手机号" :style="{width:'320px'}" v-model="loginForm.phone">
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
          <a-button type="primary" shape="round" @click="toLogin" long>登录</a-button>
      </a-space>
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
  // 设置渐变背景
  background-color: white;
  display: flex;
  .left-panel {
    width: 50%;
    display: flex;
    padding: 15px;
    flex-direction: column;
    justify-content: center;
    .introduction-container {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
      .introduction-title {
        width: 100%;
        display: flex;
        justify-content: center;
        font-weight: 1000;
        font-size: var(--font-size-xxxl);
        // 设置字体颜色渐变
        background: linear-gradient(-225deg, #2CD8D5 0%, #C5C1FF 56%, #FFBAC3 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .introduction-content {
        width: 100%;
        display: flex;
        justify-content: center;
        font-size: var(--font-size-sm);
        color: var(--color-neutral-8);
        font-weight: 600;
      }
      .introduction-list {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
  .right-panel {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    // 右侧登录区背景颜色
    background-color: #8EC5FC;
    background-image: -webkit-linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
    background-image: -moz-linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
    background-image: -o-linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
    background-image: linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
    width: 50%;
    .login-tile {
      font-weight: 1000;
      font-size: var(--font-size-xxxl);
      color: rgb(var(--arcoblue-6));
    }
  }
}
.content {
  background-color: var(--color-neutral-2);
  border-radius: 10px;
  height: 100px;
  padding: 10px;
  .instruction-title {
    font-size: 15px;
    font-weight: 600;
    margin-top: 15px;
    margin-bottom: 5px;
  }
  .instruction-content {
    font-size: 12px;
    font-weight: 500;
  }
}
  .content:hover {
    transform: translateY(-4px);
    box-shadow: #e2ebf0;
    background-color: rgb(var(--arcoblue-1));
  }
.function-avatar {
  :deep(.arco-avatar-image) {
    background-color: var(--color-bg-white);

    img {
      object-fit: contain;
    }
  }
}

</style>
