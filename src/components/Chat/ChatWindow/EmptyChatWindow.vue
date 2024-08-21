<script setup lang="ts"></script>

<template>
  <div class="chat-window drag-area">
    <span class="title">{{ $t("recommend.title") }}</span>
    <span class="description">支持多种大模型</span>
    <!-- 大模型头像 -->
    <a-space size="large" direction="vertical" align="center">
      <a-space size="large">
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/moonshot.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/ollama.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/spark.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/ernie_bot.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/tongyi.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/tiangong.png" />
        </a-avatar>
      </a-space>
      <a-space size="large">
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/openai.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/zhipu.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/step_fun.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/deep_seek.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/baichuan.png" />
        </a-avatar>
      </a-space>
    </a-space>
  </div>
</template>

<style lang="less" scoped>
.chat-window {
  height: 100%;
  border-radius: var(--border-radius-small);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background-color:var(--color-fill-1);
  .title {
    font-size: var(--font-size-xxxl);
    font-weight: 900;
  }
  .description {
    font-size: var(--font-size-lg);
    font-weight: 500;
  }
  .assistant-avatar {
    :deep(.arco-avatar-image) {
      background-color: var(--color-bg-white);

      img {
        object-fit: contain;
      }
    }
  }
}
</style>
