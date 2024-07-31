<script setup lang="ts">
import { nextTick, onMounted, reactive, toRefs, watch } from 'vue'
// 引入接口
import { type Assistant, type ChatMessage } from "@/types";
// 引入国际化组件
import { useI18n } from 'vue-i18n'
// 引入页面组件
import AssistantAvatar from '@/components/Avatar/ProviderAvatar.vue'
// 引入 Setting 状态
import { useSettingStore } from '@/stores/setting'

// 接收父组件传递的参数
const props = defineProps({
  assistant: {
    type: Object as () => Assistant,
    default: () => ({})
  }
})

const settingStore = useSettingStore()
const { t } = useI18n()
const data = reactive({
  welcomeText: ''
})
const { welcomeText } = toRefs(data)

// 语言设置监听
watch(
  () => settingStore.app.locale,
  () => {
    showWelcomeText()
  }
)

// 提供商切换监听
watch(
  () => props.assistant.provider,
  () => {
    showWelcomeText()
  }
)

// 展开欢迎提示语
const showWelcomeText = () => {
  nextTick(() => {
    data.welcomeText = ''
    const welcomeTextArray = t(`bigModelProviderWelcome.${props.assistant.provider}`).split('_')
    const welcomeTextInterval = setInterval(() => {
      const item = welcomeTextArray.shift()
      if (!item) {
        clearInterval(welcomeTextInterval)
        return
      }
      data.welcomeText += item
    }, 100)
  })
}

onMounted(() => {
  showWelcomeText()
})
</script>

<template>
  <div class="chat-window-welcome">
    <AssistantAvatar :provider="assistant.provider" :size="40" />
    <div class="welcome-text">
      <span>{{ welcomeText }}</span>
      <span class="welcome-text-loading">丨</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.chat-window-welcome {
  height: 100%;
  border-radius: var(--border-radius-small);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  .welcome-text {
    font-size: var(--font-size-lg);
    font-weight: 500;
    color: var(--color-text-1);

    :deep(.welcome-text-loading) {
      font-weight: 500;
      color: rgb(var(--primary-6));
      animation: alternate-hide-show 900ms ease-in-out infinite;
    }

    @keyframes alternate-hide-show {
      0%,
      50%,
      100% {
        opacity: 1;
      }
      60%,
      90% {
        opacity: 0;
      }
    }
  }
}
</style>