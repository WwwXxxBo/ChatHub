<script setup lang="ts">
import { watch } from 'vue'
import { Message } from '@arco-design/web-vue'
// 引入 Assistant 状态
import { useAssistantStore } from "@/stores/assistant";
// 引入 System 状态
import { useSystemStore } from "@/stores/system";
// 引入国际化组件
import { useI18n } from "vue-i18n";
// 引入接口
import { type Assistant, type ChatMessage } from "@/types"
// 引入时间组件
import dayjs from 'dayjs'
import { deleteSystemAssistant } from "@/api/assistant"

const { t } = useI18n();
const assistantStore = useAssistantStore();
const systemStore = useSystemStore();

// 接收父组件传递的数据
const props = defineProps({
  assistant: {
    type: Object as () => Assistant,
    default: () => ({}),
  },
});

// 计算显示的消息时间
const calcMessageTime = (current?: ChatMessage) => {
  if (current) {
    // 如果与当日日期相同，则表示对话是今日发生的，只显示小时和分钟
    if (dayjs(current.createTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
      return dayjs(current.createTime).format('HH:mm')
    } else {
    // 如果与当日日期不同，则表示对话是过去发生的，显示具体日期
      return dayjs(current.createTime).format('YYYY/MM/DD')
    }
  }
  return null
}

// 点击激活对话
const assistantItemActive = () => {
  if (systemStore.chatWindowLoading) {
    return
  }
  assistantStore.currentVirtualAssistantId = props.assistant.id
}

// 删除对话
const deleteChat = async () => {
  assistantStore.virtualAssistantList = assistantStore.virtualAssistantList.filter(
    (a) => a.id != props.assistant.id
  )
  if (assistantStore.currentVirtualAssistantId === props.assistant.id) {
    assistantStore.currentVirtualAssistantId = null
  }
  const res = await deleteSystemAssistant(props.assistant.id);
  if(res.status === 0) {
    Message.success("系统对话助手删除成功");
  } else {
    Message.error("系统对话助手删除失败");
  }
}

// 监听对话记录并设置标题
watch(
  () => props.assistant.chatMessageList,
  () => {
    // 如果是默认标题，则修改
    if (
      props.assistant.name === t('assistantList.newChat') &&
      props.assistant.chatMessageList.length === 1
    ) {
      assistantStore.getCurrentVirtualAssistant.name = props.assistant.chatMessageList[0].content
    }
  },
  {
    deep: true
  }
)
</script>

<template>
  <div
    class="assistant-item item-click"
    :class="{
      'item-active': assistantStore.currentVirtualAssistantId === assistant.id,
    }"
    @click="assistantItemActive"
  >
    <div class="virtual-assistant-item-body">
      <div class="assistant-item-content">
        {{ assistant.name }}
      </div>
      <div class="assistant-item-footer">
        <div class="assistant-item-message-count">
          {{ assistant.chatMessageList.length }}
          {{ $t("assistantItem.messageCount") }}
        </div>
        <div
          :key="`assistant-item-time-${assistant.id}-${systemStore.dayKey}`"
          class="assistant-item-time"
        >
          {{ calcMessageTime(assistant.chatMessageList.at(-1)) }}
        </div>
      </div>
    </div>
    <!-- 删除按钮 -->
    <icon-close-circle class="assistant-item-delete-btn" @click.stop="deleteChat()"/>
  </div>
</template>

<style lang="less" scoped>
.assistant-item {
  width: 100%;
  box-sizing: border-box;
  padding: 15px;
  background-color: var(--color-fill-1);
  border-radius: var(--border-radius-small);
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;

  .assistant-item-avatar {
    flex-shrink: 0;
  }

  .virtual-assistant-item-body {
    min-width: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .assistant-item-content {
      flex-grow: 1;
      font-size: var(--font-size-md);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .assistant-item-footer {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .assistant-item-message-count {
        flex-shrink: 0;
        font-size: var(--font-size-xs);
        color: var(--color-text-3);
      }

      .assistant-item-time {
        flex-shrink: 0;
        font-size: var(--font-size-xs);
        color: var(--color-text-3);
      }
    }
  }

  .assistant-item-body {
    height: 35px;
    flex-grow: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .assistant-item-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 5px;

      .assistant-item-name {
        flex-grow: 1;
        font-size: var(--font-size-md);
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .assistant-item-time {
        flex-shrink: 0;
        font-size: var(--font-size-xxs);
        color: var(--color-text-3);
      }
    }

    .assistant-item-content {
      font-size: var(--font-size-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-text-3);
    }
  }

  .assistant-item-delete-btn {
    font-size: var(--font-size-xl);
    color: var(--color-text-3);
    position: absolute;
    top: 5px;
    right: 5px;
    opacity: 0;
    transition: all 100ms linear;

    &:hover {
      color: var(--color-text-2);
    }
  }

  &:hover {
    .assistant-item-delete-btn {
      opacity: 1;
    }
  }
}
</style>
