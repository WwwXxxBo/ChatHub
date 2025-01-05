<script setup lang="ts">
import { reactive, ref, toRefs } from "vue";
import { Message, Modal } from '@arco-design/web-vue'
// 引入 Assistant 状态
import { useAssistantStore } from "@/stores/assistant";
import { useSystemStore } from "@/stores/system"
import { nowTimestamp, formatDateTime } from "@/utils/date-util";
import { exportTextFile } from "@/utils/download-util"
import { deleteSystemAssistant } from "@/api/assistant"
// 引入接口
import { ChatMessage, type Assistant } from "@/types";
// 引入页面组件
import SystemChatWindowForm from "@/components/SystemChat/SystemChatWindow/SystemChatWindowForm.vue";
// 引入国际化组件
import { useI18n } from "vue-i18n";
import { deleteSystemAssistantMessage } from "@/api/assistant"

// 获取父组件传递的数据
const props = defineProps({
  currentAssistant: {
    type: Object as () => Assistant,
    default: () => ({}),
  },
});

const { t } = useI18n();

const assistantStore = useAssistantStore();
const systemStore = useSystemStore();

// 一些数据
const data = reactive({
  currentAssistant: props.currentAssistant,
  editModalVisible: false,
  assistantForm: {} as Assistant
})
const { editModalVisible, assistantForm } = toRefs(data)


// 导出聊天记录
const exportChatMessageList = () => {
  if (systemStore.chatWindowLoading) {
    return
  }
  const content = data.currentAssistant.chatMessageList
  .map((r) => `[${formatDateTime(new Date(r.createTime))}] ${r.role} : \n${r.content}`)
  .join('\n\n')
  exportTextFile(`chat-records-${nowTimestamp()}.md`, content)
}

// 删除聊天助手确认
const deleteConfirm = () => {
  if (systemStore.chatWindowLoading) {
    return
  }
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: () => {
      assistantDelete()
    }
  })
}

// 清空聊天记录
const clearConfirm = () => {
  if (systemStore.chatWindowLoading) {
    return
  }
  Modal.confirm({
    title: t('common.clearConfirm'),
    content: t('common.clearConfirmContent'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      for(var chatMessage of data.currentAssistant.chatMessageList){
        const res = await deleteSystemAssistantMessage(chatMessage.id);
        if(res.status !== 0){
          Message.error("聊天记录清空失败！");
        }
      }
      data.currentAssistant.chatMessageList = []
      // 清除上下文 ID 设置为 NULL
      data.currentAssistant.clearContextMessageId = null
      Message.success("聊天记录清空成功！");
    }
  })
}

// 删除聊天助手
const assistantDelete = async () => {
  assistantStore.virtualAssistantList = assistantStore.virtualAssistantList.filter(
      (a) => a.id != data.currentAssistant.id
    )
  const res = await deleteSystemAssistant(data.currentAssistant.id);
  if(res.status === 0) {
    Message.success("系统对话助手删除成功");
  } else {
    Message.error("系统对话助手删除失败");
  }
  assistantStore.currentVirtualAssistantId = null
}


defineExpose({
  clearConfirm
})
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
