<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, computed, nextTick } from "vue";
// 引入模型接口
import { CommonChatOption, chat2bigModel } from "@/utils/bigmodel"
// 引入接口
import { type Assistant, type ChatMessage, type ChatRole } from "@/types"
// 引入页面组件
import SystemChatWindowHeader from "@/components/SystemChat/SystemChatWindow/SystemChatWindowHeader.vue";
import SystemChatWindowWelcome from "@/components/SystemChat/SystemChatWindow/SystemChatWindowWelcome.vue"
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
import MultipleChoiceConsole from "@/components/SystemChat/SystemChatWindow/MultipleChoiceConsole.vue"
// 引入提示词列表
import Prompt from "@/components/Modal/Prompt.vue";
// 引入 Assistant、System、Setting、Notification 状态
import { useAssistantStore } from '@/stores/assistant'
import { useSystemStore } from "@/stores/system"
import { useSettingStore } from "@/stores/setting"
import { useNotificationStore } from "@/stores/notification"
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
import { renderMarkdown } from '@/utils/markdown-util'
// 引入时间处理函数
import { nowTimestamp } from "@/utils/date-util"
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入计算用户输入 Token 函数
import { getContentTokensLength } from "@/utils/gpt-tokenizer-util"
// 引入组件
import { FileItem, Message, Modal, RequestOption } from '@arco-design/web-vue'
// 引入发音标识枚举类型
import { SpeechStatus } from '@/utils/constant'
// 引入时间组件
import dayjs from 'dayjs'
// 引入国际化
import { useI18n } from 'vue-i18n'
import { APIUserAbortError } from 'openai'
// 引入 vue-clipboard3 组件
import useClipboard from "vue-clipboard3";
// 引入页面选中信息组件
import { getSelectedText } from "@/utils/window-util";
import { chat2system } from "@/utils/system-chat-util"
import { type SystemChatOption } from "@/utils/systemchat"

const { t } = useI18n()
// 状态
const assistantStore = useAssistantStore()
const systemStore = useSystemStore()
const settingStore = useSettingStore()
const notificationStore = useNotificationStore()
// 阻断控制
let abortCtr = new AbortController()

const SystemChatWindowHeaderRef = ref()

// 数据绑定
const data = reactive({
  // 聊天窗口加载完毕
  isLoad: false,
  // 用于判断会话是否变换
  currentSessionId: randomUUID(),
  // 当前的助手
  currentAssistant:assistantStore.getCurrentVirtualAssistant,
  // 输入的问题
  question: '',
  // 上传文件选择
  selectFileList: [] as FileItem[],
  // 上传图片选择
  selectImageList: [] as FileItem[],
  // 判断大模型是否已经回答
  waitAnswer: false,
  // 是否打开多选
  multipleChoiceFlag: false,
  // 多选消息列表
  multipleChoiceList: [] as string[],
  // 是否显示置底按钮
  isToBottomBtnShow: false,
  // 分页
  page: {
    number: 1,
    size: 20
  },
  // 发音标识
  speechStatus: SpeechStatus.STOP,
  speechSessionId: randomUUID(),
  // 提示词列表modal
  promptListModalVisible: false,
  // 文件上传列表modal
  fileListModalVisible: false
})
const {
  isLoad,
  currentAssistant,
  question,
  selectFileList,
  selectImageList,
  waitAnswer,
  multipleChoiceFlag,
  multipleChoiceList,
  isToBottomBtnShow,
  page,
  speechStatus,
  promptListModalVisible,
  fileListModalVisible
} = toRefs(data)

// 元素 ref
const chatMessageListScrollbarRef = ref()
const chatInputTextareaRef = ref()
const chatWindowHeaderRef = ref()


// 复制
const { toClipboard } = useClipboard();
const clipboardWriteText = async (text: string) => {
  try {
    await toClipboard(text);
    Message.success(t("common.copySuccess"));
  } catch (e) {
    Message.warning(e);
  }
};


// 计算分页数据
const chatMessageListPageData = computed(() => {
  let start = data.currentAssistant.chatMessageList.length - data.page.number * data.page.size
  start = start > 0 ? start : 0
  return data.currentAssistant.chatMessageList.slice(
    start,
    data.currentAssistant.chatMessageList.length
  )
})

// 计算显示的消息时间
let lastShowTime: number = 0
let lastShowTimeMessageId: string = ''
const calcMessageTime = (current: ChatMessage, isFirst: boolean) => {
  if (
    isFirst ||
    (current.createTime - lastShowTime) / 1000 / 60 >= 5 ||
    current.id === lastShowTimeMessageId
  ) {
    lastShowTime = current.createTime
    lastShowTimeMessageId = current.id
    if (dayjs(current.createTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
      return dayjs(current.createTime).format('HH:mm')
    } else {
      return dayjs(current.createTime).format('YYYY-MM-DD HH:mm')
    }
  }
  return null
}

// 加载更多分页数据
const chatMessageLoadMore = (id: string) => {
  data.page.number++
  nextTick(() => {
    // 重新定位到当前消息
    document.querySelector(`#chat-message-${id}`)?.scrollIntoView()
  })
}

// 多选选择事件
const multipleChoiceChange = (id: string) => {
  if (data.multipleChoiceList.includes(id)) {
    data.multipleChoiceList = data.multipleChoiceList.filter((i) => i != id)
  } else {
    data.multipleChoiceList.push(id)
  }
}

// 开启多选
const multipleChoiceOpen = (id?: string) => {
  if (systemStore.chatWindowLoading) {
    return
  }
  data.multipleChoiceFlag = true
  if (id) {
    multipleChoiceChange(id)
  }
}

// 关闭多选
const multipleChoiceClose = () => {
  data.multipleChoiceList = []
  data.multipleChoiceFlag = false
  calcToBottomShow()
}

// 监听消息列表滚动
const onChatMessageListScroll = () => {
  calcToBottomShow()
}

// 对话记录滚动到底部
const scrollToBottom = (isAuto: boolean) => {
  nextTick(() => {
    if (!isAuto || !data.isToBottomBtnShow) {
      chatMessageListScrollbarRef.value.scrollTop(
        chatMessageListScrollbarRef.value.containerRef.scrollHeight
      )
    }
  })
}

// 计算置底按钮是否显示
const calcToBottomShow = () => {
  // 滚动超过一定高度时，显示置底按钮
  data.isToBottomBtnShow =
    chatMessageListScrollbarRef.value.containerRef.scrollHeight -
      chatMessageListScrollbarRef.value.containerRef.clientHeight -
      chatMessageListScrollbarRef.value.containerRef.scrollTop >
    50
}

// 选择提示词
const selectPrompt = (prompt: string) => {
  data.question = prompt
}


// 发送提问
const sendQuestion = async (event?: KeyboardEvent) => {
  // 加载中、内容为空、输入法回车，不发送消息
  if(systemStore.systemChatWindowLoading || !data.question.trim() || event?.isComposing){
    event?.preventDefault()
    return
  } else if (event?.shiftKey){
    return
  } else {
    event?.preventDefault()
  }

  // 检查输入 Token 数
  if(getContentTokensLength(data.question.trim()) > data.currentAssistant.inputMaxTokens){
    Message.error(t('chatWindow.inputTokensLimit'))
    return
  }

  // 用户发送的消息
  let id = randomUUID()
  let assistant_id  = assistantStore.getCurrentVirtualAssistant.id;
  let role =  'user'
  let content = data.question.trim();
  let createTime = nowTimestamp()
  console.log('assistant_id值', assistant_id)

  // 大模型调用
  try{
    await chat2system(id, assistant_id, role, content, createTime)
  }catch (e: any){
    Message.error(e.message)
  }

  data.waitAnswer = false
  systemStore.systemChatWindowLoading = false
}

// // 发送提问
// const sendQuestion = async (event?: KeyboardEvent) => {
//   // 加载中、内容为空、输入法回车，不发送消息
//   if (systemStore.chatWindowLoading || !data.question.trim() || event?.isComposing) {
//     event?.preventDefault()
//     return
//   } else if (event?.shiftKey) {
//     return
//   } else {
//     event?.preventDefault()
//   }

//   // 检查输入 Token 数
//   if (getContentTokensLength(data.question.trim()) > data.currentAssistant.inputMaxTokens) {
//     Message.error(t('chatWindow.inputTokensLimit'))
//     return
//   }

//   // 大模型调用
//   try {
//     await useBigModel()
//   } catch (e: any) {
//     // Logger.error('big model error: ', e?.message)
//     // 除了手动中断异常
//     if (!(e instanceof APIUserAbortError)) {
//       const errMsg = e ? e + '' : t(`chatWindow.error.${data.currentAssistant.provider}`)
//       Message.error(errMsg)
//       notificationStore.error(errMsg)
//     }
//     systemStore.chatWindowLoading = false
//     data.waitAnswer = false
//   }
// }

// 系统对话通用选项
const useSystemChat = async () => {
  // 开启等待
  systemStore.systemChatWindowLoading = true
  data.waitAnswer = true
  // 处理并清空问题输入
  const question = data.question.trim()
  data.question = ''
  // 用户消息追加
  data.currentAssistant.chatMessageList.push({
    id: randomUUID(),
    role: 'user',
    name: 'system chat',
    content: question,
    createTime: nowTimestamp()
  })
  scrollToBottom(false)
  // 后端接收的消息列表
  let systemChatMessageList = data.currentAssistant.chatMessageList;
  // 向后端传递的消息列表（此处只传递用户发出的最新一条消息)
  const chat2systemOption: SystemChatOption = {
    sessionId: data.currentSessionId,
    messages: systemChatMessageList,
    startAnswer: (sessionId: string, content?: string) => {
      if(data.currentSessionId != sessionId){
        return
      }
      data.currentAssistant.chatMessageList.push({
        id: randomUUID(),
        role: 'assistant',
        name: 'system chat',
        content: content ?? '',
        createTime: nowTimestamp()
      })
      scrollToBottom(true)
      data.waitAnswer = false
    },
    abortCtr: abortCtr,
  }

}


// 使用大模型
const useBigModel = async () => {

  const chat2bigModelOption: CommonChatOption = {
    sessionId: data.currentSessionId,
    model: data.currentAssistant.model,
    instruction: data.currentAssistant.instruction,
    inputMaxTokens: data.currentAssistant.inputMaxTokens,
    maxTokens: data.currentAssistant.maxTokens,
    contextSize: data.currentAssistant.contextSize,
    messages: copyObj(bigModelMessageList),
    abortCtr: abortCtr,
    // chatPlugins: chatPluginStore.getPluginListByIds(data.currentAssistant.chatPluginIdList, true),
    startAnswer: (sessionId: string, content?: string) => {
      if (data.currentSessionId != sessionId) {
        return
      }
      data.currentAssistant.chatMessageList.push({
        id: randomUUID(),
        type: 'text',
        role: 'assistant' as ChatRole,
        content: content ?? '',
        createTime: nowTimestamp()
      })
      scrollToBottom(true)
      data.waitAnswer = false
    },
    appendAnswer: (sessionId: string, content: string) => {
      if (data.currentSessionId != sessionId) {
        return
      }
      data.currentAssistant.chatMessageList[
        data.currentAssistant.chatMessageList.length - 1
      ].content += content
      scrollToBottom(true)
    },
    end: (sessionId: string, errMsg: any) => {
      if (data.currentSessionId != sessionId) {
        return
      }
      if (errMsg != null) {
        // 错误提示
        Message.error(errMsg)
        // 添加提醒
        notificationStore.error(errMsg)
      }
      // 关闭等待
      data.waitAnswer = false
      systemStore.chatWindowLoading = false
    }
  }
  // 各家大模型特有选项
  const otherOption = settingStore.getBigModelConfig(data.currentAssistant.provider)

  // 大模型能力调用
  await chat2bigModel(data.currentAssistant.provider, {
    ...chat2bigModelOption,
    ...otherOption
  })
}


// 挂载完毕
onMounted(() => {
  // 防止滚动闪烁
  data.isLoad = true
})
</script>

<template>
  <div class="chat-window">
    <!-- 头部 -->
    <SystemChatWindowHeader 
      ref="chatWindowHeaderRef"
      :current-assistant="currentAssistant"
    />
    <!-- 消息列表滚动 -->
    <a-scrollbar
      ref="chatMessageListScrollbarRef"
      outer-class="chat-message-list-container arco-scrollbar-small"
      style="height: calc(100vh - 158px - 55px); overflow-y: auto"
      @scroll="onChatMessageListScroll"
    >
    <!-- 对话欢迎窗口 -->
      <SystemChatWindowWelcome
        v-if="currentAssistant.chatMessageList.length === 0"
        :assistant="currentAssistant"
      />
      <!-- 消息列表-->
      <div v-else class="chat-message-list fade-in-from" :class="{ 'fade-in-to': isLoad }">
        
        <!-- 加载更多 -->
        <a-button
          v-if="currentAssistant.chatMessageList.length - page.number * page.size > 0"
          style="background-color: transparent"
          type="text"
          size="mini"
          @click="chatMessageLoadMore(chatMessageListPageData[0].id)"
          >{{ $t('common.loadMore') }}
        </a-button>
        
        <!-- 消息体 -->
        <template v-for="(msg, index) in chatMessageListPageData" :key="msg.id">
          <!-- 输出消息时间 -->
          <div
            v-if="calcMessageTime(msg, index === 0)"
            :key="`chat-message-time-${msg.id}-${systemStore.dayKey}`"
            class="chat-message-time"
          >
            {{ calcMessageTime(msg, index === 0) }}
          </div>
          <!-- 右键点击菜单 -->
          <a-dropdown :align-point="true" trigger="contextMenu">
            <!-- 消息块 -->
            <div
              :id="`chat-message-${msg.id}`"
              class="chat-message"
              :class="{ 'chat-message-user': msg.role === 'user' }"
            >
              <!-- 多选框 -->
              <a-checkbox 
                v-if="multipleChoiceFlag" 
                class="chat-message-checkbox"
                :default-checked="multipleChoiceList.includes(msg.id)"
                @change="multipleChoiceChange(msg.id)"
              />

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
                <!-- 用户消息：文本内容 -->
                <div v-if="msg.role === 'user'">{{ msg.content }}</div>
                <!-- 大模型消息：Markdown 内容 -->
                <div
                  v-else-if="msg.role === 'assistant'"
                  class="chat-message-md"
                  v-html="
                    renderMarkdown(
                      msg.content,
                      index === chatMessageListPageData.length - 1 && systemStore.chatWindowLoading
                    )
                  "
                ></div>
              </div>
            </div>

            <!-- 右键菜单内容 -->
            <template #content>
              <a-doption 
                @click="clipboardWriteText(getSelectedText(msg.content))"
              >
                {{ $t('chatWindow.copy') }}
              </a-doption>
              <a-doption  @click="multipleChoiceOpen(msg.id)">
                {{ $t('chatWindow.multipleChoice') }}
              </a-doption>
            </template>
          </a-dropdown>
        </template>
      </div>
    </a-scrollbar>

    <!-- 输入区 -->
    <div class="chat-input-container">
      <!-- 回到底部 -->
      <div
        v-if="isToBottomBtnShow"
        class="chat-message-list-to-bottom"
        @click="scrollToBottom(false)"
      >
        <icon-arrow-down class="chat-message-list-to-bottom-icon" />
      </div>

      <!-- 工具栏 -->
      <div class="chat-input-tools">
        <!-- 打开设置 -->
        <a-tooltip
          :content="$t('chatWindow.header.editChat')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button size="mini" shape="round">
            <icon-settings :size="15" />
          </a-button>
        </a-tooltip>

        <!-- 清空上下文 -->
        <a-tooltip
          :content="$t('chatWindow.clearContext')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button size="mini" shape="round">
            <icon-eraser :size="15" />
          </a-button>
        </a-tooltip>

        <!-- 清空记录 -->
        <a-tooltip
          :content="$t('chatWindow.header.clear')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button size="mini" shape="round">
            <icon-delete :size="15" />
          </a-button>
        </a-tooltip>

        <!-- 打开多选菜单 -->
        <a-tooltip
          :content="$t('chatWindow.multipleChoice')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button size="mini" shape="round" @click="multipleChoiceOpen()">
            <icon-select-all :size="15" />
          </a-button>
        </a-tooltip>

        <!-- 快捷指令 -->
        <a-tooltip
          :content="$t('chatWindow.fastPrompt')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button
            size="mini"
            shape="round"
            @click="promptListModalVisible = true"
          >
            <icon-bulb :size="15" />
          </a-button>
        </a-tooltip>
      </div>
      <div class="chat-input">
        <!-- 文本域 -->
        <a-textarea
          ref="chatInputTextareaRef"
          v-model="question"
          class="chat-input-textarea"
          :placeholder="$t('chatWindow.inputPlaceholder.chat')"
          :auto-size="{
            minRows: 4,
            maxRows: 4,
          }"
          allow-clear
        />
        <!-- 按钮区域 -->
        <div class="chat-input-button">
          <!-- 发送按钮 -->
          <a-button 
            v-if="true" 
            type="primary" 
            size="small"
            @click="sendQuestion()"
          >
            <a-space :size="5">
              <icon-send :size="15" />
              <span>{{ $t("chatWindow.send") }}</span>
            </a-space>
          </a-button>

          <!-- 停止回答按钮 -->
          <a-button v-if="false" size="small">
            <a-space :size="5">
              <icon-record-stop :size="15" />
              <span>{{ $t("chatWindow.stop") }}</span>
            </a-space>
          </a-button>
        </div>
        <!-- 底部多选操作区域 -->
        <transition name="slide2top">
          <MultipleChoiceConsole
            v-if="multipleChoiceFlag"
            :multiple-choice-list="multipleChoiceList"
            @close="multipleChoiceClose()"
          />
        </transition>
      </div>
    </div>

    <!-- 提示词列表modal -->
    <Prompt
      v-model:modal-visible="promptListModalVisible"
      @select-prompt="selectPrompt"
    />
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/chat-window.less";
.chat-plugin-select {
  max-height: 40vh;
  overflow-y: auto;
  padding: 0 5px;
}
</style>
