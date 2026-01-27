<!-- VideoPlayer.vue -->
<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { Modal, Tag, Button, ButtonGroup, Message } from '@arco-design/web-vue'
import { type VideoItem } from '@/types/video'

// 定义组件属性
interface Props {
    visible: boolean
    videoData?: VideoItem | null  // 使用 VideoItem 类型
}
// 筛选选项
const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '计算机科学', value: 'computer_science' },
    { label: '数学', value: 'math' },
    { label: '化学', value: 'chemistry' },
    { label: '艺术设计学', value: 'art_and_design' },
]

const props = defineProps<Props>()
const emit = defineEmits(['update:visible', 'close'])

// 使用计算属性来包装 visible prop
const modalVisible = computed({
    get: () => props.visible,
    set: (value) => {
        emit('update:visible', value)
    }
})

// 视频播放器引用
const videoRef = ref<HTMLVideoElement>()

// 播放状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

// 当弹窗显示时初始化视频数据
watch(() => props.visible, (newVal) => {
    if (newVal && props.videoData) {
        // 重置播放状态
        isPlaying.value = false
        currentTime.value = 0
        duration.value = 0

        // 延迟加载视频以确保DOM更新
        setTimeout(() => {
            if (videoRef.value) {
                videoRef.value.load() // 重新加载视频
            }
        }, 100)
    }
}, { immediate: true })

// 关闭弹窗
const handleClose = () => {
    emit('update:visible', false)
    emit('close')

    // 暂停视频播放
    if (videoRef.value) {
        videoRef.value.pause()
        videoRef.value.currentTime = 0
        isPlaying.value = false
    }
}

// 视频元数据加载完成
const onLoadedMetadata = () => {
    if (videoRef.value) {
        duration.value = videoRef.value.duration
    }
}

// 视频时间更新
const onTimeUpdate = () => {
    if (videoRef.value) {
        currentTime.value = videoRef.value.currentTime
    }
}

// 视频播放结束
const onEnded = () => {
    isPlaying.value = false
    currentTime.value = 0
}

// 格式化时间（秒转换为 mm:ss）
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 跳转到指定时间
const seekTo = (seconds: number) => {
    if (videoRef.value) {
        videoRef.value.currentTime = seconds
        currentTime.value = seconds
    }
}

// 设置播放速率
const setPlaybackRate = (rate: number) => {
    if (videoRef.value) {
        videoRef.value.playbackRate = rate
    }
}

// 全屏播放
const toggleFullscreen = () => {
    const container = document.querySelector('.video-container')
    if (!container) return

    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            console.log(`全屏请求失败: ${err.message}`)
        })
    } else {
        document.exitFullscreen()
    }
}

// 键盘快捷键支持
const handleKeydown = (e: KeyboardEvent) => {
    if (!props.visible) return

    switch (e.key) {
        case ' ':
        case 'Spacebar':
            e.preventDefault()
            if (videoRef.value) {
                if (videoRef.value.paused) {
                    videoRef.value.play()
                } else {
                    videoRef.value.pause()
                }
            }
            break
        case 'Escape':
            handleClose()
            break
        case 'ArrowLeft':
            e.preventDefault()
            seekTo(Math.max(0, currentTime.value - 10))
            break
        case 'ArrowRight':
            e.preventDefault()
            seekTo(Math.min(duration.value, currentTime.value + 10))
            break
        case 'f':
        case 'F':
            e.preventDefault()
            toggleFullscreen()
            break
        case 'm':
        case 'M':
            e.preventDefault()
            if (videoRef.value) {
                videoRef.value.muted = !videoRef.value.muted
            }
            break
    }
}

const getCategoryLabel = (value: string) => {
    const option = filterOptions.find(opt => opt.value === value);
    return option ? option.label : '未分类';
};

// 注册键盘事件
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <Modal v-model:visible="modalVisible" :title="videoData?.title || '视频播放'" :footer="false" :closable="true"
        :mask-closable="true" :hide-cancel="true" :hide-ok="true" :unmount-on-close="true" @cancel="handleClose"
        @ok="handleClose" :align-center="false" :simple="false" :mask="true" :fullscreen="false"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }" :modal-style="{
            margin: '0 auto',
            top: '40px',
            width: '95vw',
            maxWidth: '1600px',
            height: 'calc(100vh - 80px)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
        }" class="video-player-modal">

        <!-- 模态框头部 -->
        <template #title>
            <div class="modal-header-content">
                <span class="modal-title">{{ videoData?.title || '视频播放' }}</span>
            </div>
        </template>

        <div class="video-player-wrapper">
            <!-- 横向布局 -->
            <div class="player-layout">
                <!-- 左侧：视频播放区 -->
                <div class="left-panel">
                    <div class="video-container">
                        <video ref="videoRef" :src="videoData?.url" :poster="videoData?.coverUrl" class="video-element"
                            controls controlsList="nodownload" @loadedmetadata="onLoadedMetadata"
                            @timeupdate="onTimeUpdate" @ended="onEnded" @play="isPlaying = true"
                            @pause="isPlaying = false">
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                </div>

                <!-- 右侧：视频信息和操作区 -->
                <div class="right-panel" v-if="videoData">
                    <!-- 视频信息 -->
                    <div class="video-info-section">
                        <h4 class="info-title">视频信息</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">标题：</span>
                                <span class="info-value text-ellipsis">{{ videoData.title }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">时长：</span>
                                <span class="info-value">{{ videoData.duration || formatTime(duration) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">文件大小：</span>
                                <span class="info-value">{{ (videoData.size / 1024 / 1024).toFixed(2) }} MB</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">分类：</span>
                                <span class="info-value">
                                    <Tag color="blue" size="small">
                                        {{ getCategoryLabel(videoData.category) }}
                                    </Tag>
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">上传时间：</span>
                                <span class="info-value">{{ new Date(videoData.uploadTime).toLocaleString() }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">播放状态：</span>
                                <span class="info-value">
                                    <Tag :color="isPlaying ? 'green' : 'orange'" size="small">
                                        {{ isPlaying ? '播放中' : '已暂停' }}
                                    </Tag>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 快速跳转 -->
                    <div class="quick-actions">
                        <h4 class="actions-title">快速跳转</h4>
                        <div class="time-buttons">
                            <ButtonGroup>
                                <Button size="small" @click="seekTo(0)">开头</Button>
                                <Button size="small" @click="seekTo(duration * 0.25)">25%</Button>
                                <Button size="small" @click="seekTo(duration * 0.5)">中间</Button>
                                <Button size="small" @click="seekTo(duration * 0.75)">75%</Button>
                                <Button size="small" @click="seekTo(duration - 10)">结尾</Button>
                            </ButtonGroup>
                        </div>
                    </div>

                    <div class="playback-speed">
                        <h4 class="speed-title">播放速度</h4>
                        <div class="speed-buttons">
                            <Button size="small" @click="setPlaybackRate(0.5)">0.5x</Button>
                            <Button size="small" @click="setPlaybackRate(1)">1.0x</Button>
                            <Button size="small" @click="setPlaybackRate(1.5)">1.5x</Button>
                            <Button size="small" @click="setPlaybackRate(2)">2.0x</Button>
                        </div>
                    </div>

                    <!-- 视频描述 -->
                    <div class="video-description" v-if="videoData.description && videoData.description !== '无'">
                        <h4 class="description-title">视频描述</h4>
                        <p class="description-content">{{ videoData.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
</template>

<style lang="less" scoped>
.video-player-modal {

    // 确保模态框覆盖整个屏幕
    :deep(.arco-modal-wrapper) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        overflow: hidden;
        padding: 20px 0;
    }

    :deep(.arco-modal) {
        width: 95vw !important;
        max-width: 1600px !important;
        height: calc(100vh - 80px) !important;
        max-height: 90vh !important;
        margin: 0 auto !important;
        position: relative !important;
        top: 20px !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25) !important;

        .arco-modal-header {
            padding: 16px 24px !important;
            border-bottom: 1px solid var(--color-border-2) !important;
            background: var(--color-bg-2) !important;
            border-top-left-radius: 12px !important;
            border-top-right-radius: 12px !important;
            flex-shrink: 0 !important;
        }

        .arco-modal-content {
            padding: 0 !important;
            flex: 1 !important;
            overflow: hidden !important;
        }

        .arco-modal-body {
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            padding: 0 !important;
        }
    }

    // 修复遮罩层
    :deep(.arco-modal-mask) {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999 !important;
        background-color: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(2px) !important;
    }
}

.modal-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-1);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 16px;
    }

    .video-duration {
        font-size: 14px;
        color: var(--color-text-3);
        background: var(--color-fill-2);
        padding: 2px 8px;
        border-radius: 4px;
        flex-shrink: 0;
    }
}

.video-player-wrapper {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.player-layout {
    display: flex;
    flex: 1;
    height: calc(100% - 60px);
    min-height: 0;
    overflow: hidden;
    padding: 24px;
    gap: 24px;

    @media (max-width: 1200px) {
        gap: 20px;
        padding: 20px;
    }

    @media (max-width: 900px) {
        flex-direction: column;
        gap: 16px;
        padding: 16px;
    }
}

.left-panel {
    flex: 3;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .video-container {
        flex: 1;
        min-height: 0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 16px;
        background-color: #000;
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

        .video-element {
            width: 100%;
            height: 100%;
            min-height: 400px;
            display: block;
            outline: none;
            border-radius: 12px;
            background-color: #000;
            object-fit: contain;

            &::-webkit-media-controls {
                opacity: 1;
                transition: opacity 0.2s;
            }

            &:hover::-webkit-media-controls {
                opacity: 1;
            }

            // 美化原生控件
            &::-webkit-media-controls-panel {
                background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3));
                border-radius: 0 0 12px 12px;
            }

            &::-webkit-media-controls-play-button,
            &::-webkit-media-controls-volume-slider,
            &::-webkit-media-controls-mute-button {
                filter: brightness(1.2);
            }
        }
    }

    .video-actions {
        display: flex;
        justify-content: flex-end;
        padding: 0 8px;
        flex-shrink: 0;

        .fullscreen-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border: none;
            background: var(--color-fill-2);
            color: var(--color-text-1);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            &:hover {
                background-color: var(--color-fill-3);
                color: var(--color-primary-6);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            &:active {
                transform: scale(0.98);
            }
        }
    }
}

.right-panel {
    flex: 2;
    min-width: 320px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    max-height: 100%;
    padding-right: 8px;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: var(--color-fill-1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--color-fill-4);
        border-radius: 4px;

        &:hover {
            background: var(--color-fill-6);
        }
    }

    .video-info-section {
        padding: 20px;
        background-color: var(--color-bg-2);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .info-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--color-primary-light-3);
        }

        .info-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .info-item {
                display: flex;
                align-items: flex-start;

                .info-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-text-3);
                    min-width: 90px;
                    flex-shrink: 0;
                }

                .info-value {
                    font-size: 14px;
                    color: var(--color-text-1);
                    word-break: break-word;
                    flex: 1;
                    line-height: 1.5;

                    .arco-tag {
                        margin-top: -2px;
                        font-size: 12px;
                    }

                    &.text-ellipsis {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }
    }

    .quick-actions {
        padding: 20px;
        background-color: var(--color-bg-2);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .actions-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--color-primary-light-3);
        }

        .time-buttons {
            margin-bottom: 5px;

            :deep(.arco-btn-group) {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;

                .arco-btn {
                    flex: 1;
                    min-width: 70px;
                    font-size: 13px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    transition: all 0.2s;

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                }
            }
        }
    }

    .playback-speed {
        padding: 20px;
        background-color: var(--color-bg-2);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .speed-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--color-primary-light-3);
        }

        .speed-buttons {
            display: flex;
            gap: 12px;

            :deep(.arco-btn) {
                flex: 1;
                font-size: 13px;
                padding: 6px 12px;
                border-radius: 6px;
                transition: all 0.2s;

                &.arco-btn-primary {
                    background-color: var(--color-primary-6);
                    border-color: var(--color-primary-6);
                    box-shadow: 0 2px 4px rgba(var(--primary-6), 0.3);
                }

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
            }
        }
    }

    .video-description {
        padding: 20px;
        background-color: var(--color-bg-2);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .description-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0 0 16px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--color-primary-light-3);
        }

        .description-content {
            font-size: 14px;
            color: var(--color-text-2);
            line-height: 1.6;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
        }
    }
}

// 响应式调整
@media (max-width: 1400px) {
    .right-panel {
        min-width: 300px;
        max-width: 400px;
    }
}

@media (max-width: 1200px) {
    .right-panel {
        min-width: 280px;
        max-width: 350px;
    }
}

@media (max-width: 1100px) {
    .right-panel {
        min-width: 260px;
        max-width: 320px;
    }
}

@media (max-width: 1000px) {
    .player-layout {
        padding: 20px;
    }

    .right-panel {
        min-width: 240px;
        max-width: 300px;
    }
}

@media (max-width: 900px) {
    .player-layout {
        flex-direction: column;
        height: auto;
        min-height: 0;
    }

    .left-panel,
    .right-panel {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
    }

    .right-panel {
        max-height: 400px;
        min-height: 300px;
    }

    .left-panel {
        .video-container .video-element {
            min-height: 350px;
            max-height: 500px;
        }
    }
}

@media (max-width: 768px) {
    .video-player-modal {
        :deep(.arco-modal) {
            width: 98vw !important;
            top: 10px !important;
            height: calc(100vh - 20px) !important;
        }
    }

    .player-layout {
        padding: 16px;
        gap: 16px;
    }

    .modal-header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .video-duration {
            align-self: flex-start;
        }
    }
}

@media (max-width: 576px) {
    .video-player-wrapper {
        padding: 0;
    }

    .player-layout {
        padding: 12px;
        gap: 12px;
    }

    .left-panel {
        .video-container .video-element {
            min-height: 250px;
            max-height: 400px;
        }

        .video-actions {
            .fullscreen-btn {
                padding: 6px 12px;
                font-size: 13px;
            }
        }
    }

    .right-panel {
        gap: 16px;

        .video-info-section,
        .quick-actions,
        .playback-speed,
        .video-description {
            padding: 16px;

            .info-title,
            .actions-title,
            .speed-title,
            .description-title {
                font-size: 16px;
                margin-bottom: 16px;
            }
        }
    }
}
</style>