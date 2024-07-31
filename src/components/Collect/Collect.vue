<script setup lang="ts">
import { reactive, toRefs } from "vue";
// 引入类型限制
import { type CollectionItemType } from "@/types"
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const data = reactive({
  keyword: "",
  collectionItemType: "all" as "all" | CollectionItemType,
  currentCollectionItemId: "",
});
const { keyword, collectionItemType, currentCollectionItemId } = toRefs(data)
</script>

<template>
  <div class="collection-set">
    <div class="collection-set-left">
      <div class="collection-set-list-search drag-area">
        <div class="search-type-select no-drag-area">
          <a-select v-model="collectionItemType" :fallback-option="false">
            <a-option value="all">{{ $t("collectionSet.type.all") }}</a-option>
            <a-option value="chat">{{
              $t("collectionSet.type.chat")
            }}</a-option>
            <a-option value="image">{{
              $t("collectionSet.type.image")
            }}</a-option>
            <a-option value="note">{{
              $t("collectionSet.type.note")
            }}</a-option>
          </a-select>
        </div>
        <a-input-search
          v-model="keyword"
          :placeholder="$t('collectionSet.search')"
          class="search-input no-drag-area"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/chat-window.less";

.collection-set {
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
