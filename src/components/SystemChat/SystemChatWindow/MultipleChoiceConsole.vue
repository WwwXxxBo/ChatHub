<script setup lang="ts">
import { reactive, toRefs } from "vue";
import { ChatMessage, type CollectionItem } from "@/types";
// 引入页面组件
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
// 引入状态组件
import { useAssistantStore } from "@/stores/assistant";
import { useCollectionStore } from "@/stores/collection";
// 引入工具方法
import { randomUUID } from "@/utils/id-util";
import { copyObj } from "@/utils/object-util";
import { nowTimestamp } from "@/utils/date-util";
import { renderMarkdown } from '@/utils/markdown-util'
import { exportTextFile } from '@/utils/download-util'
// 引入 UI 组件
import { Message, Modal } from "@arco-design/web-vue";
import { useI18n } from "vue-i18n";
import html2canvas from 'html2canvas'

const { t } = useI18n();
const assistantStore = useAssistantStore();
const collectionStore = useCollectionStore();

// 接收父组件传递的数据
const props = defineProps({
  multipleChoiceList: {
    type: Array,
    default: () => [] as string[],
  },
});
// 响应式数据
const data = reactive({
  currentAssistant: assistantStore.getCurrentVirtualAssistant,
  shareModalVisible: false,
});
const { currentAssistant, shareModalVisible } = toRefs(data);

const emits = defineEmits(['collect', 'delete', 'close'])

// 获取选中聊天信息
const getSelectMessageList = () => {
  const chatMessageList = [] as ChatMessage[];
  props.multipleChoiceList.forEach((id) => {
    const chatMessage = data.currentAssistant.chatMessageList.find(
      (msg) => msg.id == id
    );
    if (chatMessage) {
      chatMessageList.push(chatMessage);
    }
  });
  chatMessageList.sort((m1, m2) => m1.createTime - m2.createTime);
  return chatMessageList;
};

const multipleChoiceDownload = () => {
  console.log('长度',props.multipleChoiceList.length)
  if(props.multipleChoiceList.length === 0){
    return
  }
  const selectChatMessageList = getSelectMessageList()
  if(selectChatMessageList.length === 0){
    return
  }
  const content = selectChatMessageList.map((r) => r.role + ': \n' + r.content).join('\n\n')
  exportTextFile(`records-${nowTimestamp()}.md`, content)
  emits('close')
}

// 收藏选中聊天信息
const multipleChoiceCollect = () => {
  if (props.multipleChoiceList.length === 0) {
    return;
  }
  // 获取选中的聊天信息
  const selectChatMessageList = getSelectMessageList();
  if (selectChatMessageList.length === 0) {
    return;
  }
  // 创建一个收藏对象
  const collecttionItem: CollectionItem = {
    id: randomUUID(),
    type: "chat",
    chat: {
      ...copyObj(assistantStore.getCurrentVirtualAssistant),
      chatMessageList: selectChatMessageList,
    },
    createTime: nowTimestamp(),
  };
  collectionStore.collectionItemList.unshift(collecttionItem);
  emits("close");
  Message.success(t("chatWindow.collectSuccess"));
};

// 分享选中的消息
const multipleChoiceShare = () => {
  if (props.multipleChoiceList.length === 0) {
    return;
  }
  data.shareModalVisible = true;
};

// 生成图片下载链接
const shareModalBeforeOk = async () => {
  await new Promise<void>((resolve, reject) => {
    const el = document.getElementById('share-chat-message-list')
    if(el){
      html2canvas(el, {
        scale: 2,
        allowTaint: true,
        useCORS: true
      })
      .then((canvas) => {
        // 将图像下载到本地
        const a = document.createElement('a')
        a.download = `share-${nowTimestamp()}`
        a.href = canvas.toDataURL('image/png')
        a.dispatchEvent(new MouseEvent('click'))
        emits('close')
        resolve()
      })
      .catch((error) => {
        Message.error(error)
        reject()
      })
    }
  })
  return true
}

// 删除选中的消息
const multipleChoiceDelete = () => {
  if(props.multipleChoiceList.length === 0){
    return
  }
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: () => {
      console.log('选中消息的长度',props.multipleChoiceList.length)
      props.multipleChoiceList.forEach((id) => {
        const index = data.currentAssistant.chatMessageList.findIndex((msg) => msg.id === id)
        if(index >= 0){
          data.currentAssistant.chatMessageList.splice(index, 1)
        }
      })
      console.log('现在的消息列表', data.currentAssistant.chatMessageList)
      emits('close')
    }
  })
}

</script>

<template>
  <div class="multiple-choice-console">
    <a-button shape="circle" class="multiple-choice-console-btn" @click="multipleChoiceCollect()">
      <icon-common class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="multipleChoiceDownload()">
      <icon-download class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="multipleChoiceShare()">
      <icon-share-external class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="multipleChoiceDelete()">
      <icon-delete class="multiple-choice-console-icon" />
    </a-button>
    <a-button shape="circle" class="multiple-choice-console-btn" @click="emits('close')">
      <icon-close class="multiple-choice-console-icon" />
    </a-button>
  </div>

  <!-- 分享预览模态框 -->
  <a-modal
    v-model:visible="shareModalVisible"
    :ok-text="$t('chatWindow.shareDownload')"
    :cancel-text="$t('common.cancel')"
    unmount-on-close
    title-align="start"
    width="80vw"
    :on-before-ok="shareModalBeforeOk"
  >
    <!-- 标题 -->
    <template #title>
      {{ $t('chatWindow.sharePreview') }}
    </template>

    <div
      class="chat-message-list-container"
      style="height: 60vh; padding: 0 10px; overflow-y: auto"
    >
      <!-- 消息列表 -->
      <div id="share-chat-message-list" class="chat-message-list">
        <div v-for="msg in getSelectMessageList()" :key="msg.id" class="chat-message">
          <!-- 消息头像 -->
          <div class="chat-message-avatar">
            <UserAvatar v-if="msg.role === 'user'" :size="30" />
            <ProviderAvatar 
              v-else-if="msg.role === 'assistant'"
              :provider="currentAssistant.provider"
              :size="30"
            />
          </div>
          <!-- 消息内容 -->
          <div class="chat-message-content select-text">
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'">{{ msg.content }}</div>
            <div
              v-else-if="msg.role === 'assistant'"
              class="chat-message-md"
              v-html="renderMarkdown(msg.content, false)"
            >
            </div>
          </div>
        </div>
        <!-- 尾部 -->
        <div class="share-image-footer">
          <div>{{ currentAssistant.provider }}</div>
          <div>{{ currentAssistant.model }}</div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style lang="less" scoped>
@import "@/assets/css/chat-window.less";

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
