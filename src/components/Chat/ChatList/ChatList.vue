<script setup lang="ts">
import { reactive, toRefs, onMounted } from "vue";
// 引入页面组件
import ChatItem from "@/components/Chat/ChatList/ChatItem.vue";
import { Message } from "@arco-design/web-vue";
// 引入接口
import { type Assistant, type ChatMessage } from "@/types"
// 引入国际化组件
import { useI18n } from "vue-i18n";
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入 Chat Assistant 状态
import { useChatAssistantStore } from "@/stores/chatAssistant";
// 引入默认 Assistant
import { defaultAssistant } from "@/utils/base-util";
// 引入随机生成 ID 值方法
import { randomUUID } from "@/utils/id-util";
// 引入获取时间方法
import { nowTimestamp } from "@/utils/date-util";
// 引入 draggable 组件
import draggable from 'vuedraggable'
import { createAssistant } from "@/api/assistant"


const { t } = useI18n();
const chatAssistantStore = useChatAssistantStore();

const data = reactive({
  assistantForm: copyObj(defaultAssistant) as Assistant,
  keyword: "",
  newChatAssistantList: [] as any
});
const { assistantForm, keyword } = toRefs(data);

// 新增 Assistant
const newChatAssistant = async () => {
  const id = randomUUID();
  chatAssistantStore.chatAssistantList.unshift({
    ...copyObj(
      chatAssistantStore.getCurrentChatAssistant.id
        ? chatAssistantStore.getCurrentChatAssistant
        : defaultAssistant
    ),
    name: t("assistantList.newChat"),
    id: id,
    createTime: nowTimestamp(),
    lastUpdateTime: nowTimestamp(),
    chatMessageList: new Array<ChatMessage>(),
  });
  // 将新建的 Chat Assistant 设置为当前 Chat Assistant
  chatAssistantStore.currentChatAssistantId = id;

  // 获取当前聊天助手信息
  let currentChatAssistant = { ...copyObj(chatAssistantStore.getCurrentChatAssistant) }
  const res = await createAssistant(
    currentChatAssistant.id,
    1,
    currentChatAssistant.name,
    currentChatAssistant.type,
    currentChatAssistant.instruction,
    currentChatAssistant.provider,
    currentChatAssistant.model,
    currentChatAssistant.maxTokens,
    currentChatAssistant.inputMaxTokens,
    currentChatAssistant.contextSize,
    currentChatAssistant.createTime,
    currentChatAssistant.lastUpdateTime,
  )
  if (res.status) {
    Message.success("对话助手创建成功");
  } else {
    Message.error("对话助手创建失败");
  }
};

onMounted(async () => {
  // 将当前 Chat Assistant 显示到视窗
  document.querySelector('.assistant-item-active')?.scrollIntoView()
})

</script>

<template>
  <div class="assistant-list">
    <div class="assistant-header drag-area">
      <!-- 输入框 -->
      <a-input-search v-model="keyword" :placeholder="$t('chatList.search')" class="search-input no-drag-area" />
      <a-button type="primary" class="assistant-new-btn no-drag-area" @click="newChatAssistant()">
        <icon-plus :size="16" />
      </a-button>
    </div>
    <!-- 滚动条 -->
    <a-scrollbar v-if="
      chatAssistantStore.chatAssistantList.filter(
        (a) =>
          !keyword ||
          a.chatMessageList.findIndex((m) => m.content.includes(keyword)) > -1
      ).length > 0
    " outer-class="assistant-list-container arco-scrollbar-small" style="height: calc(100vh - 60px); overflow-y: auto">
      <!-- 可拖拽区域 -->
      <draggable v-model="chatAssistantStore.chatAssistantList" group="assistant-list" item-key="id"
        class="assistant-list-draggable">
        <template #item="{ element }">
          <ChatItem v-show="!keyword ||
            element.chatMessageList.findIndex((m) =>
              m.content.includes(keyword)
            ) > -1
            " :assistant="element" class="assistant-item" />
        </template>
      </draggable>
    </a-scrollbar>
    <div v-else class="assistant-list-empty">
      <a-empty description="暂无对话" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.assistant-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;

  .assistant-header {
    flex-shrink: 0;
    box-sizing: border-box;
    padding: 15px 15px 0 15px;
    display: flex;
    gap: 5px;
    align-items: center;

    .search-input {
      flex-grow: 1;
      border: none;
      background-color: var(--color-fill-2);
    }

    .assistant-new-btn {
      flex-shrink: 0;
      display: flex;
      background-color: #856cff;
      align-items: center;
      justify-content: center;
      height: 30px;
      width: 30px;
      padding: 0;
    }
  }

  .assistant-list-container {
    .assistant-list-draggable {
      box-sizing: border-box;
      padding: 0 15px 15px 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }

  .assistant-list-empty {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
