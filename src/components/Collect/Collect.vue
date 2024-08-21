<script setup lang="ts">
import { computed, reactive, toRefs } from "vue";
// 引入类型限制
import { type CollectionItemType, type CollectionItem } from "@/types"
// 引入 UI 组件
import { Modal } from '@arco-design/web-vue'
// 引入页面组件
import ProviderAvatar from "@/components/Avatar/ProviderAvatar.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
import NoteEditor from "@/components/Collect/NoteEditor.vue"
// 引入 Collection 状态
import { useCollectionStore } from '@/stores/collection'
// 引入处理Markdown格式方法
import { renderMarkdown } from '@/utils/markdown-util'
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
// 引入下载 MarkDown 文档方法
import { exportTextFile } from '@/utils/download-util'
// 引入时间处理函数
import { nowTimestamp, formatDateTime } from "@/utils/date-util";
// 引入国际化组件
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const collectionStore = useCollectionStore();

// 响应式数据
const data = reactive({
  keyword: "",
  collectionItemType: "all" as "all" | CollectionItemType,
  currentCollectionItemId: "",
});
const { keyword, collectionItemType, currentCollectionItemId } = toRefs(data)

// 当前选中的收藏
const currentCollectionItem = computed(() => {
  return collectionStore.collectionItemList.find((c) => c.id ===data.currentCollectionItemId)
})

// 新建笔记
const newNote = () => {
  const id = randomUUID()
  const collectionItem: CollectionItem ={
    id: id,
    type: 'note',
    note: {
      title: t('collectionSet.note.defaultTitle'),
      content: ''
    },
    createTime: nowTimestamp()
  }
  collectionStore.collectionItemList.unshift(collectionItem)
  data.currentCollectionItemId = id
}

// 滚动条条件过滤
const collectionItemListFilter = computed(() => {
  let filterResult = collectionStore.collectionItemList
  if(data.collectionItemType !== 'all'){
    filterResult = collectionStore.collectionItemList.filter(
      (item) => item.type === data.collectionItemType
    )
  }
  return filterResult.filter(
    (item) => (
      item.chat && item.chat.chatMessageList.findIndex((msg) => msg.content.includes(data.keyword)) >= 0) ||
      (item.image && item.image.prompt?.includes(data.keyword)) ||
      item.note?.title.includes(data.keyword) ||
      item.note?.content.includes(data.keyword)
  )
})

// 删除确认
const deleteConfirm = (id: string) => {
  Modal.confirm({
    title: t('common.deleteConfirm'),
    content: t('common.deleteConfirmContent'),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: () => {
      const index = collectionStore.collectionItemList.findIndex((c) => c.id === id)
      console.log('删除id:',index)
      if(index >= 0){
        collectionStore.collectionItemList.splice(index, 1)
      }
    }
  })
}

// 导出聊天列表
const exportChatMessageList = (id: string) => {
  const collection = collectionStore.collectionItemList.find((c) => c.id === id)
  if(!collection){
    return
  }
  const content = collection.chat?.chatMessageList.map((r) => `[${formatDateTime(new Date(r.createTime))}] ${r.role} : \n${r.content}`).join('\n\n')
  exportTextFile(`chat-records-${nowTimestamp()}.md`, content)
}

</script>

<template>
  <div class="collection-set">
    <div class="collection-set-left">
      <div class="collection-set-list-search drag-area">
        <div class="search-type-select no-drag-area">
          <a-select v-model="collectionItemType" :fallback-option="false">
            <a-option value="all">{{ $t("collectionSet.type.all") }}</a-option>
            <a-option value="chat">{{ $t("collectionSet.type.chat") }}</a-option>
            <a-option value="image">{{ $t("collectionSet.type.image") }}</a-option>
            <a-option value="note">{{ $t("collectionSet.type.note") }}</a-option>
          </a-select>
        </div>
        <a-input-search
          v-model="keyword"
          :placeholder="$t('collectionSet.search')"
          class="search-input no-drag-area"
        />
      </div>
      <!-- 新建笔记 -->
      <a-button type="primary" class="new-note-btn" @click="newNote()">
        <a-space :size="10">
          <icon-plus-circle :size="18" :stroke-width="3" />
          <span>{{ $t('collectionSet.note.new') }}</span>
        </a-space>
      </a-button>
      <!-- 滚动条 -->
      <a-scrollbar 
        outer-class="collection-set-list-container arco-scrollbar-small"
        style="height: calc(100vh - 60px - 45px); overflow-y: auto"
      >
        <div class="collection-set-list">
          <div 
            v-for="c in collectionItemListFilter"
            :key="c.id"
            class="collection item-click"
            :class="{ 'item-active': c.id === currentCollectionItemId }"
            @click="currentCollectionItemId = c.id"
          >
            <!-- 收藏消息体 -->
            <div class="collection-body">
              <!-- 对话类型 -->
              <template v-if="c.type === 'chat'">
                <ProviderAvatar
                  :size="35"
                  :provider="c.chat?.provider"
                  class="collection-avatar"
                />
                <div class="collection-content">
                  {{
                    c.chat?.chatMessageList[0].content
                    ? c.chat?.chatMessageList[0].content
                    : c.chat?.chatMessageList[0].image
                    ? $t('assistantItem.content.image')
                    : ''
                  }}
                </div>
              </template>
              <!-- 图片类型 -->
              <template v-else-if="c.type === 'image'">
                <ProviderAvatar
                  :size="35"
                  :provider="c.image?.provider"
                  class="collection-avatar"
                />
                <div class="collection-content">
                  {{ c.image?.prompt }}
                </div>
              </template>
              <!-- 笔记类型 -->
              <template v-else-if="c.type === 'note'">
                <div class="collection-note-body">
                  <div class="collection-note-title">
                    {{ c.note?.title || $t('collectionSet.note.titlePlaceholder') }}
                  </div>
                  <div class="collection-content">{{ c.note?.content }}</div>
                </div>
              </template>
            </div>
            <!-- 收藏消息体尾部 -->
            <div class="collection-footer">
              <div class="collection-time">{{ formatDateTime(new Date(c.createTime)) }}</div>
                <a-popover
                  position="br"
                  trigger="click"
                  :content-style="{ padding: '5px' }"
                  @click.stop
                >
                  <icon-more class="collection-more-btn" />
                  <template #content>
                    <a-space direction="vertical" fill>
                      <a-button
                        type="text"
                        style="width: 100%"
                        status="danger"
                        size="small"
                        @click="deleteConfirm(c.id)"
                      >
                        {{ $t('common.delete') }}
                      </a-button>
                      <a-button
                        v-if="c.type === 'chat'"
                        type="text"
                        style="width: 100%; color: var(--color-text-1)"
                        size="small"
                        @click="exportChatMessageList(c.id)"
                      >
                        {{ $t('common.export') }}
                      </a-button>
                    </a-space>
                  </template>
                </a-popover>
            </div>
          </div>
          <div v-if="collectionItemListFilter.length === 0" class="collection-set-list-empty">
            <a-empty description="" />
          </div>
        </div>
      </a-scrollbar>
    </div>
    <!-- 右边内容展示区域 -->
    <div class="collection-set-right">
      <template v-if="currentCollectionItem">
        <div class="collection-set-header drag-area">
          <!-- 笔记标题 -->
          <a-input
            v-if="currentCollectionItem.type === 'note'"
            v-model="currentCollectionItem.note!.title"
            class="note-title-input no-drag-area"
          />
          <!-- 显示模型名称和供应商 -->
          <template v-else>
            <div class="assistant-name">
              <template v-if="currentCollectionItem.type === 'chat'">
                {{ currentCollectionItem.chat?.name }}
              </template>
              <template v-else-if="currentCollectionItem.type === 'image'">
                {{ $t('aiDrawing.name') }}
              </template>
            </div>
            <div class="assistant-desc">
              <a-space :size="10">
                <!-- 对话模型 -->
                <template v-if="currentCollectionItem.type === 'chat'">
                  <a-tag>
                   {{ $t(`bigModelProvider.${currentCollectionItem.chat?.provider}`) }} 
                  </a-tag>
                  <a-tag>
                    {{ currentCollectionItem.chat?.model }}
                  </a-tag>
                </template>
                <!-- 图片模型 -->
                <template v-else-if="currentCollectionItem.type === 'image'">
                  <a-tag>
                    {{ $t(`bigModelProvider.${currentCollectionItem.image?.provider}`) }}
                  </a-tag>
                  <a-tag>
                    {{ currentCollectionItem.image?.model }}
                  </a-tag>
                </template>
              </a-space>
            </div>
          </template>
        </div>
        <!-- 收藏 对话信息展示 -->
        <template v-if="currentCollectionItem.type === 'chat'">
          <a-scrollbar
            outer-class="chat-message-list-container arco-scrollbar-small"
            style="height: calc(100vh - 55px); overflow-y: auto"
          >
            <div class="chat-message-list">
              <div 
                v-for="msg in currentCollectionItem.chat?.chatMessageList"
                :key="msg.id"
                class="chat-message"
              >
                <!-- 消息头像 -->
                <div class="chat-message-avatar">
                  <UserAvatar v-if="msg.role === 'user'" :size="30" />
                  <ProviderAvatar
                    v-else-if="msg.role === 'assistant'"
                    :provider="currentCollectionItem.chat?.provider"
                    :size="30"
                  />
                </div>
                <!-- 消息内容 -->
                <div class="chat-message-content select-text">
                  <!-- 用户消息 -->
                  <div v-if="msg.role === 'user'">
                    {{ msg.content }}
                  </div>
                  <!-- 大模型消息 -->
                  <div
                    v-else-if="msg.role === 'assistant'"
                    class="chat-message-md"
                    v-html="renderMarkdown(msg.content, false)"
                  >
                  </div>
                  <!-- 图片展示 -->
                  <a-image
                    v-if="msg.image"
                    width="300"
                    height="300"
                    :src="`file://${msg.image}`"
                    show-loader
                    fit="cover"
                  >
                    <template #preview-actions>
                      <a-image-preview-action
                        :name="$t('common.download')"
                        @click="downloadFile(`file://${msg.image}`, `img-${msg.id}.png`)"
                      >
                        <icon-download />
                      </a-image-preview-action>
                    </template>
                  </a-image>
                  <div
                    v-if="msg.fileList && msg.fileList.length > 0"
                    class="chat-message-file-list"
                  >
                    <!-- <ChatMessageFile v-for="f in msg.fileList" :key="f.id" :message-file="f" /> -->
                  </div>
                </div>
              </div>
            </div>
          </a-scrollbar>
        </template>
        <!-- 图片收藏 -->
        <template v-else-if="currentCollectionItem.type === 'image'">
          <div class="collection-set-image-detail">
            <a-image
              width="500"
              height="500"
              :src="`file://${currentCollectionItem.image?.imageList[0]}`"
              show-loader
              fit="cover"
            >
              <template #preview-actions>
                <a-image-preview-action
                  :name="$t('common.download')"
                  @click="downloadFile(
                    `file://${currentCollectionItem?.image?.imageList[0]}`,
                    `img-${currentCollectionItem?.image?.imageList[0]}`
                  )"
                >
                  <icon-download />
                </a-image-preview-action>
              </template>
            </a-image>
            <div class="collection-set-image-detail-prompt select-text">
              {{ currentCollectionItem.image?.prompt }}
            </div>
          </div>
        </template>
        <!-- 编辑笔记 -->
        <NoteEditor 
          v-else-if="currentCollectionItem.type === 'note'"
          v-model:content="currentCollectionItem.note!.content"
          class="note-editor"
        />
      </template>
      <!-- 空笔记 -->
      <div v-else class="collection-window-empty drag-area">
        <a-empty>
          <template #image>
            <icon-common />
          </template>
          {{ $t('collectionSet.empty') }}
        </a-empty>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/chat-window.less";

.collection-set {
  // 增加边距和圆角
  margin: 10px 10px 10px 0px;
  border-radius: 10px;
  // 增加背景颜色
  background-color: var(--color-bg-1);
  
  width: 100%;
  flex-grow: 1;
  display: flex;
  overflow: hidden;

  .collection-set-left {
    flex-shrink: 0;
    width: 270px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 15px;
    border-right: 1px solid var(--color-border-1);
    box-sizing: border-box;

    .collection-set-list-search {
      box-sizing: border-box;
      padding: 15px 15px 0 15px;
      display: flex;

      .search-type-select {
        flex-shrink: 0;
        width: 80px;

        :deep(.arco-select-view-single) {
          border: none;
          background-color: var(--color-fill-2);
        }
      }

      .search-input {
        flex-grow: 1;
        border: none;
        background-color: var(--color-fill-2);
      }
    }

    .new-note-btn {
      margin: 0 15px;
      padding: 3px 0;
    }

    .collection-set-list-container {
      .collection-set-list {
        min-height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-sizing: border-box;
        padding: 0 15px 15px 15px;

        .collection-set-list-empty {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .collection {
          box-sizing: border-box;
          padding: 15px;
          background-color: var(--color-fill-1);
          border-radius: var(--border-radius-small);
          display: flex;
          flex-direction: column;
          gap: 15px;

          .collection-body {
            flex-grow: 1;
            display: flex;
            gap: 10px;

            .collection-avatar {
              flex-shrink: 0;
              margin-top: 3px;
            }

            .collection-note-body {
              width: 100%;
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              gap: 10px;

              .collection-note-title {
                flex-shrink: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 500;
              }
            }

            .collection-content {
              flex-grow: 1;
              line-height: var(--line-height-sm);
              overflow: hidden;
              display: -webkit-box;
              text-overflow: ellipsis;
              word-break: break-all;
              line-break: anywhere;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }
          }

          .collection-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .collection-time {
              flex-shrink: 0;
              font-size: var(--font-size-sm);
            }

            .collection-more-btn {
              font-size: var(--font-size-md);
              font-weight: 500;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }

  .collection-set-right {
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .collection-set-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      border-bottom: 1px solid var(--color-border-1);
      box-sizing: border-box;
      padding: 15px;

      .note-title-input {
        border: none;
        background-color: transparent;
        padding: 0;

        :deep(.arco-input) {
          font-size: var(--font-size-lg);
          font-weight: 500;
          padding: 0;
        }
      }

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

    .collection-set-image-detail {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      box-sizing: border-box;
      padding: 15px;

      .collection-set-image-detail-prompt {
        line-height: var(--line-height-md);
        white-space: pre-wrap;
        line-break: anywhere;
        text-align: center;
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
      }
    }

    .note-editor {
      flex-grow: 1;
    }

    .collection-window-empty {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
