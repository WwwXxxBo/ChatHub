<!-- VideoPlayer.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Modal, Slider, Tag, Button, ButtonGroup } from '@arco-design/web-vue'

// 定义组件属性
interface Props {
    visible: boolean
    videoData?: {
        id: number
        title: string
        cover?: string
        duration?: string
        url?: string // 实际播放地址
    } | null  // 允许 null
}

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

// 视频信息
const videoInfo = ref({
    title: '',
    url: '', // 实际播放地址
    cover: ''
})

// 播放状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)

// 当弹窗显示时初始化视频数据
watch(() => props.visible, (newVal) => {
    if (newVal && props.videoData) {
        videoInfo.value = {
            title: props.videoData.title,
            url: props.videoData.url || `/videos/video_${props.videoData.id}.mp4`, // 模拟视频地址
            cover: props.videoData.cover || ''
        }
        // 重置播放状态
        isPlaying.value = false
        currentTime.value = 0
        duration.value = 0
    }
})

// 关闭弹窗
const handleClose = () => {
    emit('update:visible', false)
    emit('close')

    // 暂停视频播放
    if (videoRef.value) {
        videoRef.value.pause()
        videoRef.value.currentTime = 0
    }
}

// 播放/暂停
const togglePlay = () => {
    if (!videoRef.value) return

    if (isPlaying.value) {
        videoRef.value.pause()
    } else {
        videoRef.value.play()
    }
    isPlaying.value = !isPlaying.value
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

// 进度条改变
const handleProgressChange = (value: number) => {
    if (videoRef.value) {
        videoRef.value.currentTime = value
        currentTime.value = value
    }
}

// 音量改变
const handleVolumeChange = (value: number) => {
    volume.value = value
    if (videoRef.value) {
        videoRef.value.volume = value
    }
}

// 获取当前播放速率
const getPlaybackRate = () => {
    if (!videoRef.value) return 1
    return videoRef.value.playbackRate || 1
}

// 设置播放速率
const setPlaybackRate = (rate: number) => {
    if (videoRef.value) {
        videoRef.value.playbackRate = rate
    }
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

// 全屏播放
const toggleFullscreen = () => {
    if (!videoRef.value) return

    if (!document.fullscreenElement) {
        videoRef.value.requestFullscreen().catch(err => {
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
            togglePlay()
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
            handleVolumeChange(volume.value > 0 ? 0 : 0.7)
            break
    }
}

// 注册键盘事件
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <Modal v-model:visible="modalVisible" :title="videoInfo.title" :footer="false" :closable="true"
        :mask-closable="true" :hide-cancel="true" :hide-ok="true" :unmount-on-close="true" @cancel="handleClose"
        @ok="handleClose" :align-center="false" :simple="false" :mask="true"
        :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
        :modal-style="{ marginTop: '20px', marginBottom: '20px' }" class="video-player-modal">
        <div class="video-player-wrapper">
            <!-- 横向布局 -->
            <div class="player-layout">
                <!-- 左侧：视频播放区 -->
                <div class="left-panel">
                    <div class="video-container">
                        <video ref="videoRef" :src="videoInfo.url" :poster="videoInfo.cover" controls
                            class="video-element" @loadedmetadata="onLoadedMetadata" @timeupdate="onTimeUpdate"
                            @ended="onEnded" @play="isPlaying = true" @pause="isPlaying = false">
                            您的浏览器不支持视频播放
                        </video>
                    </div>

                    <!-- 自定义控制条 -->
                    <div class="custom-controls">
                        <!-- 播放/暂停按钮 -->
                        <button class="control-btn" @click="togglePlay">
                            <icon-play-circle-fill v-if="!isPlaying" />
                            <icon-pause-circle-fill v-else />
                        </button>

                        <!-- 进度条 -->
                        <div class="progress-control">
                            <span class="time-display">{{ formatTime(currentTime) }}</span>
                            <Slider v-model="currentTime" :max="duration" :step="0.1" show-tooltip
                                :format-tooltip="formatTime" @change="handleProgressChange" class="progress-slider" />
                            <span class="time-display">{{ formatTime(duration) }}</span>
                        </div>

                        <!-- 音量控制 -->
                        <div class="volume-control">
                            <button class="control-btn" @click="handleVolumeChange(volume > 0 ? 0 : 0.7)">
                                <icon-sound-fill v-if="volume > 0.5" />
                                <icon-sound v-else-if="volume > 0" />
                                <icon-mute v-else />
                            </button>
                            <Slider v-model="volume" :min="0" :max="1" :step="0.1" show-tooltip
                                :format-tooltip="(val) => `${Math.round(val * 100)}%`" @change="handleVolumeChange"
                                class="volume-slider" />
                        </div>

                        <!-- 全屏按钮 -->
                        <button class="control-btn" @click="toggleFullscreen">
                            <icon-fullscreen />
                        </button>
                    </div>
                </div>

                <!-- 右侧：视频信息和操作区 -->
                <div class="right-panel">
                    <!-- 视频信息 -->
                    <div class="video-info-section">
                        <h4 class="info-title">视频信息</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">标题：</span>
                                <span class="info-value">{{ videoInfo.title }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">时长：</span>
                                <span class="info-value">{{ props.videoData?.duration || formatTime(duration) }}</span>
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
                            <Button size="mini" :type="getPlaybackRate() === 0.5 ? 'primary' : 'outline'"
                                @click="setPlaybackRate(0.5)">0.5x</Button>
                            <Button size="mini" :type="getPlaybackRate() === 1 ? 'primary' : 'outline'"
                                @click="setPlaybackRate(1)">1.0x</Button>
                            <Button size="mini" :type="getPlaybackRate() === 1.5 ? 'primary' : 'outline'"
                                @click="setPlaybackRate(1.5)">1.5x</Button>
                            <Button size="mini" :type="getPlaybackRate() === 2 ? 'primary' : 'outline'"
                                @click="setPlaybackRate(2)">2.0x</Button>
                        </div>
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
        overflow: auto;
        padding-top: 20px;
        padding-bottom: 20px;
    }

    :deep(.arco-modal) {
        width: 1000px;
        max-width: 95vw;
        height: auto;
        max-height: 85vh;
        margin: auto;
        position: relative;
        top: auto;
        bottom: auto;
        left: auto;
        right: auto;
        transform: none;

        .arco-modal-header {
            padding: 12px 20px;
            border-bottom: 1px solid var(--color-border-2);
        }

        .arco-modal-content {
            padding: 0;
            max-height: calc(85vh - 60px);
            overflow: hidden;
        }

        .arco-modal-body {
            max-height: 100%;
            overflow: hidden;
        }
    }

    // 修复遮罩层
    :deep(.arco-modal-mask) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        background-color: rgba(0, 0, 0, 0.5);
    }
}

.video-player-wrapper {
    padding: 20px;
}

.player-layout {
    display: flex;
    gap: 24px;
    height: 100%;

    @media (max-width: 900px) {
        flex-direction: column;
    }
}

.left-panel {
    flex: 3;
    min-width: 0; // 防止flex元素溢出

    .video-container {
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;
        background-color: #000;

        .video-element {
            width: 100%;
            height: 400px;
            display: block;
            outline: none;
            border-radius: 8px;

            &::-webkit-media-controls {
                opacity: 0;
                transition: opacity 0.2s;
            }

            &:hover::-webkit-media-controls {
                opacity: 1;
            }
        }
    }

    .custom-controls {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background-color: var(--color-fill-2);
        border-radius: 8px;

        .control-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: none;
            background: none;
            color: var(--color-text-1);
            font-size: 20px;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;

            &:hover {
                background-color: var(--color-fill-3);
                color: var(--color-primary-6);
            }

            &:active {
                transform: scale(0.95);
            }
        }

        .progress-control {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;

            .time-display {
                font-size: 12px;
                color: var(--color-text-3);
                min-width: 40px;
                text-align: center;
                flex-shrink: 0;
            }

            .progress-slider {
                flex: 1;
                min-width: 0;

                :deep(.arco-slider-track) {
                    background-color: var(--color-primary-6);
                }

                :deep(.arco-slider-button) {
                    border-color: var(--color-primary-6);
                }
            }
        }

        .volume-control {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;

            .volume-slider {
                width: 80px;

                :deep(.arco-slider-track) {
                    background-color: var(--color-primary-6);
                }
            }
        }
    }
}

.right-panel {
    flex: 2;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .video-info-section {
        padding: 16px;
        background-color: var(--color-fill-1);
        border-radius: 8px;

        .info-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text-1);
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-border-2);
        }

        .info-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .info-item {
                display: flex;
                align-items: flex-start;

                .info-label {
                    font-size: 14px;
                    color: var(--color-text-3);
                    min-width: 70px;
                    flex-shrink: 0;
                }

                .info-value {
                    font-size: 14px;
                    color: var(--color-text-1);
                    word-break: break-word;
                    flex: 1;
                }
            }
        }
    }

    .quick-actions {
        padding: 16px;
        background-color: var(--color-fill-1);
        border-radius: 8px;

        .actions-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text-1);
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-border-2);
        }

        .time-buttons {
            margin-bottom: 5px;

            :deep(.arco-btn-group) {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;

                .arco-btn {
                    flex: 1;
                    min-width: 60px;
                    font-size: 12px;
                    padding: 4px 8px;
                }
            }
        }

        .preset-times {
            .preset-title {
                font-size: 14px;
                color: var(--color-text-2);
                margin: 0 0 8px 0;
            }

            .preset-buttons {
                display: flex;
                gap: 8px;

                :deep(.arco-btn) {
                    flex: 1;
                    font-size: 12px;
                    padding: 2px 8px;
                }
            }
        }
    }

    .playback-speed {
        padding: 16px;
        background-color: var(--color-fill-1);
        border-radius: 8px;

        .speed-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text-1);
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-border-2);
        }

        .speed-buttons {
            display: flex;
            gap: 8px;

            :deep(.arco-btn) {
                flex: 1;
                font-size: 12px;
                padding: 4px 8px;

                &.arco-btn-primary {
                    background-color: var(--color-primary-6);
                    border-color: var(--color-primary-6);
                }
            }
        }
    }

    .extra-actions {
        padding: 16px;
        background-color: var(--color-fill-1);
        border-radius: 8px;

        .extra-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--color-text-1);
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--color-border-2);
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;

            :deep(.arco-btn) {
                justify-content: center;
            }
        }
    }
}

// 响应式调整
@media (max-width: 900px) {
    .player-layout {
        flex-direction: column;
    }

    .left-panel,
    .right-panel {
        width: 100%;
    }

    .left-panel {
        .video-container .video-element {
            height: 300px;
        }

        .custom-controls {
            flex-wrap: wrap;

            .progress-control {
                order: 3;
                flex: 1 0 100%;
                margin-top: 8px;
            }
        }
    }
}

@media (max-width: 576px) {
    .video-player-modal {
        :deep(.arco-modal) {
            width: 95vw !important;
        }
    }

    .video-player-wrapper {
        padding: 12px;
    }

    .left-panel {
        .video-container .video-element {
            height: 200px;
        }
    }
}
</style>