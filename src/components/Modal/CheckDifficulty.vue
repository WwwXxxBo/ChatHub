<!-- components/Modal/DifficultyModal.vue -->
<script setup lang="ts">
import { Modal, Tag, Space, Button } from '@arco-design/web-vue'

interface Props {
    visible: boolean
    videoData: {
        title?: string
        tags?: string[]
        difficulty?: string
    } | null
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'close'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const handleClose = () => {
    emits('update:visible', false)
    emits('close')
}
</script>

<template>
    <Modal :visible="props.visible" :title="videoData?.title ? `难点分析 - ${videoData.title}` : '难点分析'" width="700px"
        @ok="handleClose" @cancel="handleClose">
        <!-- 标签区域 -->
        <div v-if="videoData?.tags && videoData.tags.length > 0" class="tags-section">
            <h4 class="section-title">相关标签</h4>
            <Space wrap :size="8">
                <Tag v-for="tag in videoData.tags" :key="tag" color="arcoblue" size="medium">
                    {{ tag }}
                </Tag>
            </Space>
        </div>

        <!-- 难点内容区域 -->
        <div v-if="videoData?.difficulty" class="difficulty-section">
            <h4 class="section-title">学习难点分析</h4>
            <div class="difficulty-content">
                {{ videoData.difficulty }}
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <p>暂无难点分析内容</p>
        </div>

        <!-- 操作按钮 -->
        <template #footer>
            <Space>
                <Button @click="handleClose">关闭</Button>
            </Space>
        </template>
    </Modal>
</template>

<style lang="less" scoped>
.section-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-1);
    margin: 0 0 12px 0;
}

.tags-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-2);
}

.difficulty-section {
    .difficulty-content {
        padding: 12px;
        background-color: var(--color-fill-1);
        border-radius: 4px;
        font-size: 14px;
        line-height: 1.6;
        color: var(--color-text-2);
        white-space: pre-line;
        max-height: 400px;
        overflow-y: auto;
    }
}

.empty-state {
    text-align: center;
    padding: 40px 0;
    color: var(--color-text-3);
}
</style>