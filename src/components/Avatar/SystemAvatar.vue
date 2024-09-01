<script setup lang="ts">
// 系统对话头像
defineProps({
  size: {
    type: Number,
    default: 30,
  },
});
</script>

<template>
  <a-avatar shape="square" :size="size" class="assistant-avatar">
    <img alt="avatar" src="@/assets/images/bot.png" />
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
