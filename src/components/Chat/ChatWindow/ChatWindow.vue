<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, nextTick, computed } from "vue";
// 引入模型接口
import { CommonChatOption, chat2bigModel } from "@/utils/bigmodel"
// 引入类型检查
import { type Assistant, type ChatMessage, type ChatRole, type MessageFile } from "@/types"
// 引入页面组件
import ChatWindowHeader from "@/components/Chat/ChatWindow/ChatWindowHeader.vue";
import ChatWindowWelcome from "@/components/Chat/ChatWindow/ChatWindowWelcome.vue";
import ChatMultipleChoice from "@/components/Chat/ChatWindow/ChatMultipleChoice.vue"
import ChatWindowFileList from '@/components/Chat/ChatWindow/ChatWindowFileList.vue'
import ChatMessageFile from '@/components/Chat/ChatWindow/ChatMessageFile.vue'
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
// 引入提示词列表
import Prompt from "@/components/Modal/Prompt.vue";
// 引入 Chat Assistant、System、Notification、Setting 状态
import { useChatAssistantStore } from "@/stores/chatAssistant";
import { useSystemStore } from "@/stores/system"
import { useSettingStore } from "@/stores/setting"
import { useNotificationStore } from "@/stores/notification"
// 引入模型能力检查
import { isSupportImage } from "@/utils/base-util"
// 引入文件处理方法
import { saveFileByPath } from '@/utils/file-util'
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入时间处理函数
import { nowTimestamp } from "@/utils/date-util";
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
// 引入处理Markdown格式方法
import { renderMarkdown } from '@/utils/markdown-util'
// 引入计算用户输入 Token 函数
import { getContentTokensLength } from "@/utils/gpt-tokenizer-util"
// 引入组件
import { FileItem, Message, Modal, RequestOption } from '@arco-design/web-vue'
// 引入发音标识枚举类型
import { SpeechStatus } from '@/utils/constant'
// 引入页面选中信息组件
import { getSelectedText } from '@/utils/window-util'
// 引入时间组件
import dayjs from 'dayjs'
// 引入国际化
import { useI18n } from 'vue-i18n'
// 引入 OpenAI 组件
import { APIUserAbortError } from 'openai'
// 引入 vue-clipboard3 组件
import useClipboard from 'vue-clipboard3'


const { t } = useI18n()
// 状态
const chatAssistantStore = useChatAssistantStore();
const systemStore = useSystemStore();
const notificationStore = useNotificationStore();
const settingStore = useSettingStore();
// 阻断控制
let abortCtr = new AbortController()

const SystemChatWindowHeaderRef = ref()

// 复制
const { toClipboard } = useClipboard()
const clipboardWriteText = async (text: string) => {
  try{
    await toClipboard(text)
    Message.success(t('common.copySuccess'))
  }catch(e){
    Message.warning(e)
  }
}

// 数据绑定
const data = reactive({
  // 聊天窗口加载完毕
  isLoad: false,
  // 用于判断会话是否变换
  currentSessionId: randomUUID(),
  // 当前的助手
  currentChatAssistant:chatAssistantStore.getCurrentChatAssistant,
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
  currentChatAssistant,
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

// 计算分页数据
const chatMessageListPageData = computed(() => {
  let start = data.currentChatAssistant.chatMessageList.length - data.page.number * data.page.size
  start = start > 0 ? start : 0
  return data.currentChatAssistant.chatMessageList.slice(
    start,
    data.currentChatAssistant.chatMessageList.length
  )
})

function selectImageClick() {}

// 支持图片上传
const isSupportImageComputed = computed(() => {
  console.log('是否支持图片',isSupportImage(data.currentChatAssistant.provider,data.currentChatAssistant.model))
  return isSupportImage(data.currentChatAssistant.provider,data.currentChatAssistant.model)
})

// 加载更多分页数据
const chatMessageLoadMore = (id: string) => {
  data.page.number++
  nextTick(() => {
    // 重新定位到当前消息
    document.querySelector(`#chat-message-${id}`)?.scrollIntoView()
  })
}

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

// 发送提问
const sendQuestion = async (event?: KeyboardEvent) => {
  // 加载中、内容为空、输入法回车，不发送消息
  if (systemStore.chatWindowLoading || !data.question.trim() || event?.isComposing) {
    event?.preventDefault()
    return
  } else if (event?.shiftKey) {
    return
  } else {
    event?.preventDefault()
  }

  // 检查输入 Token 数
  if (getContentTokensLength(data.question.trim()) > data.currentChatAssistant.inputMaxTokens) {
    Message.error(t('chatWindow.inputTokensLimit'))
    return
  }

  // 大模型调用
  try {
    await useBigModel()
  } catch (e: any) {
    // Logger.error('big model error: ', e?.message)
    // 除了手动中断异常
    if (!(e instanceof APIUserAbortError)) {
      const errMsg = e ? e + '' : t(`chatWindow.error.${data.currentChatAssistant.provider}`)
      Message.error(errMsg)
      notificationStore.error(errMsg)
    }
    systemStore.chatWindowLoading = false
    data.waitAnswer = false
  }
}

// 使用大模型
const useBigModel = async () => {
  // 检查大模型配置
  if(settingStore.checkBigModelConfig(data.currentChatAssistant.provider)){
    Modal.confirm({
      title: t('common.configError'),
      content: t(`chatWindow.configMiss.${data.currentChatAssistant.provider}`),
      okText: t('common.goSetting'),
      cancelText: t('common.cancel'),
      onOk: () => {
        systemStore.openSettingModal('bigModel')
      }
    })
    return
  }
  // 开启等待
  systemStore.chatWindowLoading = true
  data.waitAnswer = true
  // 处理并清空问题输入
  const question = data.question.trim()
  data.question = ''

  // 处理并清空文件列表
  // const questionFileList: MessageFile[] = []
  // if(data.selectFileList.length > 0){
  //   for(const f of data.selectFileList){
  //     const fileSavePath = await saveFileByPath(f.file!.path, `${randomUUID()}${f.file!.name}`)
  //     questionFileList.push({
  //       id: randomUUID(),
  //       name: f.file!.name,
  //       path: fileSavePath,
  //       size: f.file!.size
  //     })
  //   }
  //   data.selectFileList = []
  // }


  // 用户消息追加
  data.currentChatAssistant.chatMessageList.push({
    id: randomUUID(),
    type: 'text',
    role: 'user',
    content: question,
    // fileList: questionFileList,
    createTime: nowTimestamp()
  })
  scrollToBottom(false)
  // 大模型接收的消息列表
  let bigModelMessageList = data.currentChatAssistant.chatMessageList
  // 找到清空上下文的位置
  const clearContextMessageIndex = bigModelMessageList.findIndex(
    (msg) => msg.id === data.currentChatAssistant.clearContextMessageId
  )
  if (clearContextMessageIndex >= 0) {
    bigModelMessageList = bigModelMessageList.slice(clearContextMessageIndex + 1)
  }
  // 大模型通用选项
  const chat2bigModelOption: CommonChatOption = {
    sessionId: data.currentSessionId,
    model: data.currentChatAssistant.model,
    instruction: data.currentChatAssistant.instruction,
    inputMaxTokens: data.currentChatAssistant.inputMaxTokens,
    maxTokens: data.currentChatAssistant.maxTokens,
    contextSize: data.currentChatAssistant.contextSize,
    messages: copyObj(bigModelMessageList),
    abortCtr: abortCtr,
    // chatPlugins: chatPluginStore.getPluginListByIds(data.currentAssistant.chatPluginIdList, true),
    startAnswer: (sessionId: string, content?: string) => {
      if (data.currentSessionId != sessionId) {
        return
      }
      data.currentChatAssistant.chatMessageList.push({
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
      data.currentChatAssistant.chatMessageList[
        data.currentChatAssistant.chatMessageList.length - 1
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
  const otherOption = settingStore.getBigModelConfig(data.currentChatAssistant.provider)

  // 大模型能力调用
  await chat2bigModel(data.currentChatAssistant.provider, {
    ...chat2bigModelOption,
    ...otherOption
  })
}

// 选择提示词
const selectPrompt = (prompt: string) => {
  data.question = prompt
}

// 清空上下文
const clearContext = () => {
  if (systemStore.chatWindowLoading || data.currentChatAssistant.chatMessageList.length === 0) {
    return
  }
  // 找到最后一条 ID
  const lastMessageId = data.currentChatAssistant.chatMessageList.at(-1)?.id
  // 清空或者恢复
  if(data.currentChatAssistant.clearContextMessageId === lastMessageId){
    data.currentChatAssistant.clearContextMessageId = null
  }else{
    data.currentChatAssistant.clearContextMessageId = lastMessageId
  }
  scrollToBottom(false)
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
  console.log('多选状态',data.multipleChoiceFlag)
}

// 关闭多选
const multipleChoiceClose = () => {
  data.multipleChoiceList = []
  data.multipleChoiceFlag = false
  calcToBottomShow()
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

// 监听消息列表滚动
const onChatMessageListScroll = () => {
  calcToBottomShow()
}

// 手动结束回答
const stopAnswer = () => {
  data.currentSessionId = randomUUID()
  systemStore.chatWindowLoading = false
  data.waitAnswer = false
  abortCtr.abort()
  abortCtr = new AbortController()
}

// 挂载完毕
onMounted(() => {
  // 对话记录滚动到底部
  scrollToBottom(false)
  // 防止滚动闪烁
  data.isLoad = true
})
</script>

<template>
  <div class="chat-window">
    <!-- 头部 -->
    <ChatWindowHeader 
      ref="chatWindowHeaderRef"
      :currentChatAssistant="currentChatAssistant"
    />
    <!-- 消息列表滚动 -->
    <a-scrollbar
      ref="chatMessageListScrollbarRef"
      outer-class="chat-message-list-container arco-scrollbar-small"
      style="height: calc(100vh - 158px - 55px); overflow-y: auto"
      @scroll="onChatMessageListScroll"
    >
    <!-- 对话欢迎窗口 -->
      <ChatWindowWelcome
        v-if="currentChatAssistant.chatMessageList.length === 0"
        :assistant="currentChatAssistant"
      />
      <!-- 消息列表-->
      <div 
        v-else 
        class="chat-message-list fade-in-from" 
        :class="{ 'fade-in-to': isLoad }"
      >
        <!-- 加载更多 -->
        <a-button
          v-if="currentChatAssistant.chatMessageList.length - page.number * page.size > 0"
          style="background-color: transparent"
          type="text"
          size="mini"
          @click="chatMessageLoadMore(chatMessageListPageData[0].id)"
          >{{ $t('common.loadMore') }}
        </a-button>

        <!-- 消息体 -->
        <template 
          v-for="(msg, index) in chatMessageListPageData" 
          :key="msg.id">
          <!-- 输出消息时间 -->
          <div
            v-if="calcMessageTime(msg, index === 0)"
            :key="`chat-message-time-${msg.id}-${systemStore.dayKey}`"
            class="chat-message-time"
          >
            {{ calcMessageTime(msg, index === 0) }}
          </div>
          <!-- 右键点击菜单 -->
          <a-dropdown 
            :align-point="true" 
            trigger="contextMenu"
          >
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
                  :provider="currentChatAssistant.provider"
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
              <!-- 复制 -->
              <a-doption @click="clipboardWriteText(getSelectedText(msg.content))">
                {{ $t('chatWindow.copy') }}
              </a-doption>
              <!-- 多选 -->
              <a-doption @click="multipleChoiceOpen(msg.id)">
                {{ $t('chatWindow.multipleChoice') }}
              </a-doption>
            </template>
          </a-dropdown>
          <!-- 清空上下文提示 -->
          <transition name="fadein">
            <a-divider
              v-if="currentChatAssistant.clearContextMessageId === msg.id"
              class="chat-message-clear-context"
              orientation="center"
              @click="currentChatAssistant.clearContextMessageId = null"
            >
              {{ $t('chatWindow.clearContextTip') }}
            </a-divider>
          </transition>
        </template>
        <!-- 等待回答占位显示 -->
        <div v-if="waitAnswer" class="chat-message">
          <div class="chat-message-avatar">
            <ProviderAvatar :provider="currentChatAssistant.provider" :size="30" />
          </div>
          <div class="chat-message-content">
            <a-spin :size="15" />
          </div>
        </div>
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
          <a-button size="mini" shape="round" @click="chatWindowHeaderRef.edit()">
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
          <a-button size="mini" shape="round" @click="clearContext()">
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
          <a-button size="mini" shape="round" @click="chatWindowHeaderRef.clearConfirm()">
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
        <!-- 选择图片 -->
        <div v-if="isSupportImageComputed" class="chat-input-select-image">
          <a-upload
            :file-list="selectImageList"
            :limit="1"
            accept="image/*"
            :show-file-list="false"
          >
            <template #upload-button>
              <a-tooltip
                :content="$t('chatWindow.selectImage')"
                position="top"
                mini
                :content-style="{ fontSize: 'var(--font-size-xs)' }"
              >
                <a-button size="mini" shape="round">
                  <icon-image :size="15" />
                </a-button>
              </a-tooltip>
            </template>
          </a-upload>
        </div>

        <!-- 选择文档 -->
        <a-tooltip
          :content="$t('chatWindow.selectFile')"
          position="top"
          mini
          :content-style="{ fontSize: 'var(--font-size-xs)' }"
        >
          <a-button
            size="mini"
            :type="selectFileList.length > 0 ? 'primary' : undefined"
            shape="round"
            @click="fileListModalVisible = true"

          >
            <icon-file :size="15" />
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
          @keydown.enter="sendQuestion"
        />
        <!-- 发送按钮 -->
        <div class="chat-input-button">
          <a-button 
            v-if="!systemStore.chatWindowLoading" 
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
          <a-button 
            v-if="systemStore.chatWindowLoading" 
            size="small"
            @click="stopAnswer()"
          >
            <a-space :size="5">
              <icon-record-stop :size="15" />
              <span>{{ $t("chatWindow.stop") }}</span>
            </a-space>
          </a-button>
        </div>
        <!-- 底部多选操作区域 -->
          <transition name="slide2top">
            <ChatMultipleChoice
              v-if="multipleChoiceFlag"
              :current-assistant="currentChatAssistant"
              :multiple-choice-list="multipleChoiceList"
              @close="multipleChoiceClose()"
            />
          </transition>
      </div>
    </div>

    <!-- 提示词列表模态框 -->
    <Prompt
      v-model:modal-visible="promptListModalVisible"
      @select-prompt="selectPrompt"
    />
    <!-- 上传文件模态框 -->
    <ChatWindowFileList 
      v-model:modal-visible="fileListModalVisible"
      v-model:select-file-list="selectFileList"
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
