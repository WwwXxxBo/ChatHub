<script setup>
const emits = defineEmits(['collect', 'delete', 'close'])
</script>

<template>
<div class="multiple-choice-console">
    <a-button shape="circle" class="multiple-choice-console-btn" @click="">
      <icon-common class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="">
      <icon-download class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="">
      <icon-share-external class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="">
      <icon-delete class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="emits('close')">
      <icon-close class="multiple-choice-console-icon" />
    </a-button>
</div>
</template>

<style lang="less" scoped>
@import '@/assets/css/chat-window.less';

.multiple-choice-console {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-1);
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  .multiple-choice-console-btn {
    height: 50px;
    width: 50px;

    .multiple-choice-console-icon {
      stroke-width: 2;
      font-size: var(--font-size-xxxl);
    }
  }
}

#share-chat-message-list {
  background-color: var(--color-bg-1);

  .share-image-footer {
    border-top: 1px solid var(--color-fill-3);
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-xs);
  }
}
</style>