<script setup lang="ts"></script>

<template>
  <div class="chat-window drag-area">
    <span class="title">{{ $t("recommend.title") }}</span>
    <span class="description">{{ $t("recommend.detail") }}</span>
    <!-- 大模型头像 -->
    <a-space size="large" direction="vertical" align="center">
      <a-space size="large">
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/deep_seek.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/tongyi.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/moonshot.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/doubao.png" />
        </a-avatar>
        <a-avatar :size="50" shape="square" class="assistant-avatar">
          <img alt="avatar" src="@/assets/images/zhipu.png" />
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
  background-color: var(--color-fill-1);

  .title {
    color: #856cff;
    font-size: var(--font-size-xxxl);
    font-weight: 900;
  }

  .description {
    color: #856cff;
    font-weight: 700;
    font-size: var(--font-size-lg);
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
