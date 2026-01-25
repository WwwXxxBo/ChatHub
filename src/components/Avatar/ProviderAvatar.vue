<script setup lang="ts">
defineProps({
  provider: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 30
  }
})
</script>

<template>
  <a-avatar v-if="provider === 'OpenAI'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/openai.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Ollama'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/ollama.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Gemini'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/gemini.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Spark'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/spark.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'ERNIE'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/ernie_bot.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Tongyi'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/tongyi.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Tiangong'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/tiangong.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'MoonshotAI'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/moonshot.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'ZhipuAI'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/zhipu.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'StepFun'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/step_fun.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'DeepSeek'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/deep_seek.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'BaiChuan'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/baichuan.png" />
  </a-avatar>
  <a-avatar v-else-if="provider === 'Doubao'" shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/doubao.png" />
  </a-avatar>
</template>

<style lang="less" scoped>
.assistant-avatar {
  :deep(.arco-avatar-image) {
    background-color: var(--color-bg-white);

    img {
      object-fit: contain;
    }
  }
}
</style>
