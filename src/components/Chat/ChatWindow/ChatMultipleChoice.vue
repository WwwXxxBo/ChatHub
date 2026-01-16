<script setup lang="ts">
import { reactive, toRefs } from 'vue';
// 引入基础类型检查
import { type ChatMessage, type CollectionItem } from '@/types'
// 引入页面组件
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
// 引入 Chat Assistant、Collection 状态
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useCollectionStore } from '@/stores/collection'
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
// 引入处理Markdown格式方法
import { renderMarkdown } from '@/utils/markdown-util'
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入时间处理函数
import { nowTimestamp } from "@/utils/date-util";
// 引入文件下载函数
import { exportTextFile } from '@/utils/download-util'
// 引入 UI 组件
import { Message, Modal } from '@arco-design/web-vue'
// 引入国际化
import { useI18n } from 'vue-i18n'
// 引入绘图库
import html2canvas from 'html2canvas'
// 引入 Assistant Message API
import { deleteAssistantMessage, createChatCollection, createChatCollectionMessage } from "@/api/assistant"

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
const { currentChatAssistant, shareModalVisible } = toRefs(data)

// 获取选中聊天信息
const getSelectMessageList = () => {
  const chatMessageList = [] as ChatMessage[]
  props.multipleChoiceList.forEach((id) => {
    const chatMessage = data.currentChatAssistant.chatMessageList.find((msg) => msg.id === id)
    if (chatMessage) {
      chatMessageList.push(chatMessage)
    }
  })
  chatMessageList.sort((m1, m2) => m1.createTime - m2.createTime)
  return chatMessageList
}

// 收藏选中聊天信息
const multipleChoiceCollect = async () => {
  if (props.multipleChoiceList.length === 0) {
    return
  }
  // 获取选中的聊天信息
  const selectChatMessageList = getSelectMessageList()
  if (selectChatMessageList.length === 0) {
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

  // for (var message of selectChatMessageList) {
  //   const chatCollectionMessageRes = await createChatCollectionMessage(
  //     message.id,
  //     collectionItem.id,
  //     message.name,
  //     message.role,
  //     message.type,
  //     message.content,
  //     message.image,
  //     message.createTime
  //   );
  // }
  collectionStore.collectionItemList.unshift(collectionItem)
  // const res = await createChatCollection(collectionItem.id, chatAssistantStore.getCurrentChatAssistant.id, sessionStorage.userId, collectionItem.type, collectionItem.createTime);
  emits('close')
  Message.success(t('chatWindow.collectSuccess'))
}

// 下载选中的消息
const multipleChoiceDownload = () => {
  if (props.multipleChoiceList.length === 0) {
    return
  }
  const selectChatMessageList = getSelectMessageList()
  if (selectChatMessageList.length === 0) {
    return
  }
  const content = selectChatMessageList.map((r) => r.role + ': \n' + r.content).join('\n\n')
  exportTextFile(`records-${nowTimestamp()}.md`, content)
  emits('close')
}

// 分享选中的消息
const multipleChoiceShare = () => {
  if (props.multipleChoiceList.length === 0) {
    return
  }
  data.shareModalVisible = true
}

// 生成图片
const shareModalBeforeOk = async () => {
  await new Promise<void>((resolve, reject) => {
    const el = document.getElementById('share-chat-message-list')
    if (el) {
      html2canvas(el, {
        scale: 2, //缩放比例
        allowTaint: true, // 是否允许跨域图像污染画布
        useCORS: true // 是否尝试使用CORS从服务器加载图像
      })
        .then((canvas) => {
          // 将图像下载到本地
          const a = document.createElement('a') // 生成一个a元素
          a.download = `share-${nowTimestamp()}` // 设置图片名称没有设置则为默认
          a.href = canvas.toDataURL('image/png') // 将生成的URL设置为a.href属性
          a.dispatchEvent(new MouseEvent('click')) // 触发a的单击事件
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

// 删除选中消息
const multipleChoiceDelete = () => {
  if (props.multipleChoiceList.length === 0) {
    return
  }
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: () => {
      props.multipleChoiceList.forEach(async (id) => {
        // 找到选中消息的序号
        const index = data.currentChatAssistant.chatMessageList.findIndex((msg) => msg.id === id)
        if (index >= 0) {
          // 如果清除上下文的 ID 值指向的消息被删除，清除上下文的 ID 值设置为上一条消息的 ID
          if (index > 0 && id === data.currentChatAssistant.clearContextMessageId) {
            data.currentChatAssistant.clearContextMessageId = data.currentChatAssistant.chatMessageList[index - 1].id
          }
          // 删除数据库中选中的消息
          const res = await deleteAssistantMessage(data.currentChatAssistant.chatMessageList[index].id);
          if (res.status === 0) {
            Message.success("消息删除成功!");
          } else {
            Message.success("消息删除失败!");
          }

          data.currentChatAssistant.chatMessageList.splice(index, 1)
        }
      })
      emits('close')
    }
  })
}
</script>

<template>
  <div class="multiple-choice-console">
    <!-- 收藏 -->
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
    <!-- 分享预览模态框 -->
    <a-modal v-model:visible="shareModalVisible" :ok-text="$t('chatWindow.shareDownload')"
      :cancel-text="$t('common.cancel')" unmount-on-close title-align="start" width="80vw"
      :on-before-ok="shareModalBeforeOk"
      :ok-button-props="{ style: { backgroundColor: '#856cff', borderColor: '#856cff' } }">
      <template #title> {{ $t('chatWindow.sharePreview') }} </template>
      <div class="chat-message-list-container" style="height: 60vh; padding: 0 10px; overflow-y: auto">
        <div id="share-chat-message-list" class="chat-message-list">
          <div v-for="msg in getSelectMessageList()" :key="msg.id" class="chat-message">
            <!-- 消息头像 -->
            <div class="chat-message-avatar">
              <UserAvatar v-if="msg.role === 'user'" :size="30" />
              <ProviderAvatar v-else-if="msg.role === 'assistant'" :provider="currentChatAssistant.provider"
                :size="30" />
            </div>
            <!-- 消息内容 -->
            <div class="chat-message-content select-text">
              <!-- 用户消息 -->
              <div v-if="msg.role === 'user'">{{ msg.content }}</div>
              <div v-else-if="msg.role === 'assistant'" class="chat-message-md"
                v-html="renderMarkdown(msg.content, false)">
              </div>
              <a-image v-if="msg.image" width="300" height="300" :src="`file://${msg.image}`" show-loader fit="cover">
                <!-- 预览 -->
                <template #preview-actions>
                  <a-image-preview-action :name="$t('common.download')"
                    @click="downloadFile(`file://${msg.image}`, `img-${msg.id}.png`)">
                    <icon-download />
                  </a-image-preview-action>
                </template>
              </a-image>
              <!-- 文件列表 -->
              <div v-if="msg.fileList && msg.fileList.length > 0" class="chat-message-file-list">
                <!-- <ChatMessageFile v-for="f in msg.fileList" :key="f.id" :message-file="f" /> -->
              </div>
            </div>
          </div>
          <!-- 尾部 -->
          <div class="share-image-footer">
            <div>{{ currentChatAssistant.provider }}</div>
            <div>{{ currentChatAssistant.model }}</div>
          </div>
        </div>
      </div>
    </a-modal>
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