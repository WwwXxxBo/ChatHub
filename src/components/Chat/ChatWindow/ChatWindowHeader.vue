<script setup lang="ts">
import { reactive, toRefs } from "vue";
import { Message, Modal } from '@arco-design/web-vue'
// 引入 Chat Assistant、System 状态
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useSystemStore } from "@/stores/system"
// 引入类型检查
import { type Assistant } from "@/types";
// 引入组件
import ChatWindowForm from "@/components/Chat/ChatWindow/ChatWindowForm.vue";
// 引入复制对象方法
import { copyObj, copyFields } from "@/utils/object-util";
// 引入文件下载函数
import { exportTextFile } from "@/utils/download-util"
// 引入时间处理函数
import { nowTimestamp, formatDateTime } from "@/utils/date-util";
// 引入国际化组件
import { useI18n } from "vue-i18n";
// 引入 Assistant API
import { modifyAssistant } from '@/api/assistant';
import { deleteAssistant } from "@/api/assistant"
import { deleteAssistantMessage } from "@/api/assistant"

// 获取父组件传递的数据
const props = defineProps({
  currentChatAssistant: {
    type: Object as () => Assistant,
    default: () => ({}),
  },
});

const { t } = useI18n();
const chatAssistantStore = useChatAssistantStore();
const systemStore = useSystemStore();

// 一些数据
const data = reactive({
  currentAssistant: props.currentChatAssistant,
  editModalVisible: false,
  assistantForm: {} as Assistant
})
const { editModalVisible, assistantForm } = toRefs(data)

// 设置模态框可见
const edit = () => {
  if (systemStore.chatWindowLoading) {
    return
  }
  data.assistantForm = copyObj(data.currentAssistant)
  data.editModalVisible = true
}

// 编辑模型处理函数
const handleEditModalBeforeOk = async () => {
  await new Promise<void>((resolve, reject) => {
    if (data.assistantForm.name.trim().length === 0) {
      Message.error(`${t('assistantList.name')} ${t('common.required')}`)
      reject()
      return
    }
    if (data.assistantForm.model.trim().length === 0) {
      Message.error(`${t('assistantList.model')} ${t('common.required')}`)
      reject()
      return
    }
    // 设置聊天模型默认值
    if (!data.assistantForm.inputMaxTokens) {
      data.assistantForm.inputMaxTokens = 1024
    }
    if (!data.assistantForm.maxTokens) {
      data.assistantForm.maxTokens = 1024
    }
    if (!data.assistantForm.contextSize) {
      data.assistantForm.contextSize = 1
    }
    data.assistantForm.lastUpdateTime = nowTimestamp()
    assistantUpdate(data.assistantForm)
    resolve()
  })
  return true
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
      for (var chatMessage of data.currentAssistant.chatMessageList) {
        const res = await deleteAssistantMessage(chatMessage.id);
        if (res.status !== 0) {
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

// 删除聊天助手
const assistantDelete = async () => {
  chatAssistantStore.chatAssistantList = chatAssistantStore.chatAssistantList.filter(
    (a) => a.id != data.currentAssistant.id
  )
  const res = await deleteAssistant(data.currentAssistant.id);
  if (res.status === 0) {
    Message.success("系统对话助手删除成功");
  } else {
    Message.error("系统对话助手删除失败");
  }
  chatAssistantStore.currentChatAssistantId = null
}

// 聊天助手更新
const assistantUpdate = async (newAssistant: Assistant) => {
  const index = chatAssistantStore.chatAssistantList.findIndex((a) => a.id === newAssistant.id)
  if (index < 0) {
    return
  }
  const res = await modifyAssistant(
    newAssistant.id,
    sessionStorage.userId,
    newAssistant.name,
    newAssistant.type,
    newAssistant.instruction,
    newAssistant.provider,
    newAssistant.model,
    newAssistant.maxTokens,
    newAssistant.inputMaxTokens,
    newAssistant.contextSize,
    newAssistant.speechModel,
    newAssistant.speechVoice,
    newAssistant.speechSpeed,
    newAssistant.createTime,
    newAssistant.lastUpdateTime
  );
  if (res.status === 0) {
    Message.success("对话助手修改成功");
  } else {
    Message.error("对话助手修改失败");
  }
  copyFields(
    newAssistant,
    chatAssistantStore.chatAssistantList[index]
  )
}

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

// 暴露方法
defineExpose({
  edit,
  clearConfirm
})

</script>

<template>
  <div class="chat-window-header drag-area">
    <!-- 聊天名称 -->
    <div class="assistant-name">{{ currentChatAssistant?.name }}</div>
    <!-- 模型介绍 -->
    <div class="assistant-desc">
      <a-space :size="10">
        <a-tag color="#856cff" style="font-weight: 600;" class="no-drag-area" @click="edit()">{{
          $t(`bigModelProvider.${currentChatAssistant?.provider}`)
        }}</a-tag>
        <a-tag color="#856cff" style="font-weight: 600;" class="no-drag-area" @click="edit()">{{
          currentChatAssistant?.model }}</a-tag>
      </a-space>
    </div>
    <!-- 三个点 -->
    <a-popover v-if="true" position="br" trigger="click" :content-style="{ padding: '5px' }">
      <icon-more :class="{ 'no-drag-area': false }"
        style="font-size: var(--font-size-xxl); flex-shrink: 0; color: #856cff;" />
      <template #content>
        <a-space direction="vertical" fill>
          <a-button type="text" style="width: 100%; color: #856cff; font-weight: 600;" size="small" @click="edit">{{
            $t("chatWindow.header.editChat") }}
          </a-button>
          <a-button type="text" style="width: 100%; color: #856cff; font-weight: 600;" size="small"
            @click="exportChatMessageList">{{ $t("chatWindow.header.export") }}</a-button>
          <a-button type="text" style="width: 100%;font-weight: 600;" status="danger" size="small"
            @click="clearConfirm">{{
              $t("chatWindow.header.clear") }}</a-button>
          <a-button type="text" style="width: 100%;font-weight: 600;" status="danger" size="small"
            @click="deleteConfirm">{{
              $t("chatWindow.header.deleteChat") }}
          </a-button>
        </a-space>
      </template>
    </a-popover>

    <!-- 编辑助手Modal -->
    <a-modal v-model:visible="editModalVisible" :ok-text="$t('common.ok')" :cancel-text="$t('common.cancel')"
      unmount-on-close title-align="start" width="80vw" :on-before-ok="handleEditModalBeforeOk">
      <template #title>
        {{ $t("chatWindow.header.editChat") }}
      </template>
      <div style="height: 60vh; padding: 0 10px; overflow-y: auto">
        <ChatWindowForm v-model:assistant="assistantForm" />
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
  // border-bottom: 1px solid var(--color-border-1);
  box-sizing: border-box;
  padding: 15px;

  .assistant-name {
    flex-grow: 1;
    color: #856cff;
    font-weight: 600;
    font-size: var(--font-size-lg);
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
