<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick } from "vue";
// 引入接口
import { type BigModelProvider } from "@/types";
// 引入 UI 库中的提示组件
import { Message } from "@arco-design/web-vue";
// 引入 User、System 状态
import { useSystemStore } from "@/stores/system";
import { useUserStore } from "@/stores/user";
// 引入 ProviderAvatar 组件
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
// 引入模拟线程等待方法
import { simulateThreadWait } from "@/utils/thread-util";
// 引入系统时间方法
import { nowTimestamp } from "@/utils/date-util";
import { getUserData } from "@/api/login";

const systemStore = useSystemStore();
const userStore = useUserStore();

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
    Message.success("登录成功");
  }
  // 存储用户登录状态
  if (userData.data) {
    sessionStorage.userId = userData.data.id;
    sessionStorage.name = userData.data.name;
    sessionStorage.email = userData.data.email;
    sessionStorage.phone = userData.data.phone;
    sessionStorage.userType = userData.data.type;
    sessionStorage.userName = userData.data.user_name;
    sessionStorage.idcard = userData.data.idcard;
  }
  // 关闭登录页
  systemStore.isWelcomeShow = false;
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
      <div class="introduction-footer">&copy; 2024 北京邮电大学 MAIR</div>
    </div>
    <!-- 右侧区域 -->
    <div class="right-panel">
      <a-space direction="vertical" size="large">
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
    // 右侧登录区背景颜色
    background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
    width: 50%;
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
.function-avatar {
  :deep(.arco-avatar-image) {
    background-color: var(--color-bg-white);

    img {
      object-fit: contain;
    }
  }
}
</style>
