<template>
    <a-modal v-model:visible="modalVisible" title-align="start" width="80vw" :footer="true" @ok="handleConfirm"
        :ok-button-props="{ disabled: checkedIndex === -1 }">
        <template #title>
            <div class="video-list-header">
                <a-input-search v-model="keyword" size="small" placeholder="请搜索视频" class="video-list-search-input" />
            </div>
        </template>

        <div class="video-list-body">
            <!-- 左侧列表 -->
            <div class="video-list-page">
                <div v-for="v in filteredList" :key="v.idx" class="video-item"
                    :class="{ active: checkedIndex === v.idx }" @click="checkedIndex = v.idx">
                    <a-checkbox :model-value="checkedIndex === v.idx" class="video-checkbox" />
                    <div class="video-meta">
                        <div class="video-title">{{ v.title }}</div>
                        <div class="video-url">{{ v.url }}</div>
                    </div>
                    <a-button size="mini" type="outline" shape="round" @click.stop="handlePreview(v.preview)">
                        <template #icon><icon-eye /></template>
                        预览
                    </a-button>
                </div>
            </div>

            <!-- 右侧预览区 -->
            <div class="video-preview-panel">
                <video v-if="previewUrl" :src="previewUrl" controls style="width:100%;height:100%;object-fit:contain" />
                <a-empty v-else :description="$t('chatWindow.videoPreviewPlaceholder')" />
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import videos from '@/assets/json/videos.json'
import { reactive, toRefs, computed } from 'vue'

const data = reactive({
    keyword: '',
    checkedIndex: -1,
    previewUrl: ''
})
const { keyword, checkedIndex, previewUrl } = toRefs(data)

const modalVisible = defineModel<boolean>('modalVisible', { default: false })
const emits = defineEmits<{ selectVideo: [url: string] }>()

const filteredList = computed(() =>
    videos.cn
        .map((v, idx) => ({ title: v[0], url: v[1], preview: v[2] || v[1], idx }))
        .filter(v => v.title.includes(keyword.value) || v.url.includes(keyword.value))
)

const handlePreview = (url: string) => (previewUrl.value = url)

const handleConfirm = () => {
    if (checkedIndex.value === -1) return
    emits('selectVideo', videos.cn[checkedIndex.value][1])
    modalVisible.value = false
}
</script>

<style lang="less" scoped>
.video-list-header {
    .video-list-search-input {
        border: none;
        background-color: var(--color-fill-2);
    }
}

.video-list-body {
    display: flex;
    height: 60vh;
    gap: 16px;
}

.video-list-page {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}

.video-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    background: var(--color-fill-1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--color-fill-2);
    }

    &.active {
        background: rgb(var(--primary-1));
        border: 1px solid rgb(var(--primary-6));
    }

    .video-checkbox {
        transform: scale(1.1);
    }

    .video-meta {
        flex: 1;
        overflow: hidden;
    }

    .video-title {
        font-weight: 600;
        font-size: 15px;
        color: var(--color-text-1);
        margin-bottom: 4px;
    }

    .video-url {
        font-size: 12px;
        color: var(--color-text-3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .arco-btn-size-mini {
        padding: 0 12px;
    }
}

.video-preview-panel {
    flex: 1;
    background: var(--color-fill-2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>