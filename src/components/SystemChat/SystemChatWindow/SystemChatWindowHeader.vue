<script setup lang="ts">
import { onMounted, ref } from "vue";
// 引入 Assistant 状态
import { useAssistantStore } from "@/stores/assistant";
// 引入接口
import { type Assistant, type ChatMessage } from "@/types";
// 引入页面组件
import SystemChatWindowForm from "@/components/SystemChat/SystemChatWindow/SystemChatWindowForm.vue";
// 引入国际化组件
import { useI18n } from "vue-i18n";

// 获取父组件传递的数据
const props = defineProps({
  currentAssistant: {
    type: Object as () => Assistant,
    default: () => ({}),
  },
});

const { t } = useI18n();

const assistantStore = useAssistantStore();
const editModalVisible = ref(false);

// 打开模态框
const edit = () => {
  editModalVisible.value = true;
};
</script>

<template>
  <div class="chat-window-header drag-area">
    <!-- 聊天名称 -->
    <div class="assistant-name">
      {{ currentAssistant?.name }}
    </div>
    <!-- 三个点 -->
    <a-popover
      v-if="true"
      position="br"
      trigger="click"
      :content-style="{ padding: '5px' }"
    >
      <icon-more
        :class="{ 'no-drag-area': false }"
        style="font-size: var(--font-size-xxl); flex-shrink: 0"
      />
      <template #content>
        <a-space direction="vertical" fill>
          <a-button
            type="text"
            style="width: 100%; color: var(--color-text-1)"
            size="small"
            @click="edit"
            >{{ $t("chatWindow.header.editChat") }}
          </a-button>
          <a-button
            type="text"
            style="width: 100%; color: var(--color-text-1)"
            size="small"
            @click="exportChatMessageList"
            >{{ $t("chatWindow.header.export") }}</a-button
          >
          <a-button
            type="text"
            style="width: 100%"
            status="danger"
            size="small"
            @click="clearConfirm"
            >{{ $t("chatWindow.header.clear") }}</a-button
          >
          <a-button
            type="text"
            style="width: 100%"
            status="danger"
            size="small"
            @click="deleteConfirm"
            >{{ $t("chatWindow.header.deleteChat") }}
          </a-button>
        </a-space>
      </template>
    </a-popover>

    <!-- 编辑助手Modal -->
    <a-modal
      v-model:visible="editModalVisible"
      :ok-text="$t('common.ok')"
      :cancel-text="$t('common.cancel')"
      unmount-on-close
      title-align="start"
      width="80vw"
    >
      <template #title>
        {{ $t("chatWindow.header.editChat") }}
      </template>
      <div style="height: 60vh; padding: 0 10px; overflow-y: auto">
        <SystemChatWindowForm />
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.chat-window-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid var(--color-border-1);
  box-sizing: border-box;
  padding: 15px;

  .assistant-name {
    flex-grow: 1;
    font-size: var(--font-size-lg);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .assistant-desc {
    flex-shrink: 0;
    margin-left: auto;

    :deep(.arco-tag) {
      font-size: var(--font-size-xs);
    }
  }
}
</style>
