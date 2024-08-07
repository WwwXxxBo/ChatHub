<script setup lang="ts">
import { reactive } from 'vue';
// 引入基础类型检查
import { type ChatMessage, type CollectionItem } from '@/types'
// 引入 Chat Assistant、Collection 状态
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useCollectionStore } from '@/stores/collection'
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入时间处理函数
import { nowTimestamp } from "@/utils/date-util";
// 引入 UI 组件
import { Message, Modal } from '@arco-design/web-vue'
// 引入国际化
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
// 引入状态
const chatAssistantStore = useChatAssistantStore();
const collectionStore = useCollectionStore();

const emits = defineEmits(['collect', 'delete', 'close'])

// 接收父组件传递的数据
const props = defineProps({
  multipleChoiceList: {
    type: Array,
    default: () => [] as string[]
  }
})
// 响应式数据
const data = reactive({
  currentChatAssistant: chatAssistantStore.getCurrentChatAssistant,
  shareModalVisible: false
})

// 获取选中聊天信息
const getSelectMessageList = () => {
  const chatMessageList = [] as ChatMessage[]
  props.multipleChoiceList.forEach((id) => {
    const chatMessage = data.currentChatAssistant.chatMessageList.find((msg) => msg.id === id)
    if(chatMessage){
      chatMessageList.push(chatMessage)
    }
  })
  chatMessageList.sort((m1, m2) => m1.createTime - m2.createTime)
  return chatMessageList
}


// 收藏选中聊天信息
const multipleChoiceCollect = () => {
  if(props.multipleChoiceList.length === 0){
    return
  }
  // 获取选中的聊天信息
  const selectChatMessageList = getSelectMessageList()
  if(selectChatMessageList.length === 0){
    return
  }
  // 创建一个收藏对象
  const collectionItem: CollectionItem = {
    id: randomUUID(),
    type: 'chat',
    chat: {
        ...copyObj(chatAssistantStore.getCurrentChatAssistant),
        chatMessageList: selectChatMessageList
    },
    createTime: nowTimestamp()
  }
  collectionStore.collectionItemList.unshift(collectionItem)
  emits('close')
  Message.success(t('chatWindow.collectSuccess'))
}
</script>

<template>
<div class="multiple-choice-console">
    <!-- 收藏 -->
    <a-button shape="circle" class="multiple-choice-console-btn" @click="multipleChoiceCollect()">
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