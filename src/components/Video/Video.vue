<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Tag,
    Message,
    Spin,
    Modal
} from '@arco-design/web-vue'
import VideoUpload from '../Modal/VideoUpload.vue' // 视频上传弹窗组件
import VideoPlayer from '../Modal/VideoPlayer.vue' // 视频播放弹窗组件
import CheckDifficulty from '../Modal/CheckDifficulty.vue' // 难点查看弹窗组件
import { getUserVideos } from '@/api/videos'


// 视频类型定义
interface VideoItem {
    id: number,
    videoId: string,
    fileName: string,
    originalName: string,
    title: string,
    url: string,
    coverUrl: string,
    thumbnailUrl: string,
    duration: string,
    tags: string[],
    category: string,
    description: string,
    difficulty: string,
    size: number,
    mimeType: string,
    uploadTime: string
}

// 筛选选项
const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '计算机科学', value: 'computer_science' },
    { label: '数学', value: 'math' },
    { label: '化学', value: 'chemistry' },
    { label: '艺术设计学', value: 'art_and_design' },
]

// 响应式数据
const searchText = ref('')
const selectedFilter = ref('all')
const videoList = ref<VideoItem[]>([])
const loading = ref(false)


const showPlayer = ref(false) // 播放弹窗显示状态
const showDifficultyModal = ref(false)  // 难点弹窗显示状态
const showUploadModal = ref(false) // 上传弹窗显示状态
const currentVideo = ref<VideoItem | null>(null)

// 搜索功能
const handleSearch = () => {
    loading.value = true

    // 模拟搜索延迟
    setTimeout(() => {
        if (searchText.value) {
            const filteredVideos = mockVideos.filter(video =>
                video.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
                video.tags.some(tag => tag.toLowerCase().includes(searchText.value.toLowerCase()))
            )
            videoList.value = filteredVideos
            Message.success(`找到 ${filteredVideos.length} 个视频`)
        } else {
            videoList.value = [...mockVideos]
        }

        // 根据筛选条件排序
        if (selectedFilter.value === 'hot') {
            videoList.value.sort((a, b) => b.views - a.views)
        } else if (selectedFilter.value === 'new') {
            videoList.value.sort((a, b) => b.id - a.id)
        }

        loading.value = false
    }, 500)
}

// 重置搜索
const handleReset = () => {
    searchText.value = ''
    selectedFilter.value = 'all'
    videoList.value = [...mockVideos]
    Message.info('已重置搜索条件')
}

// 播放视频
const playVideo = (video: VideoItem) => {
    currentVideo.value = video
    showPlayer.value = true

    // 可以在这里添加播放统计逻辑
    console.log(`播放视频：${video.title}`)
}

// 关闭播放器
const handlePlayerClose = () => {
    showPlayer.value = false
    currentVideo.value = null
}

// 查看难点
const viewDifficulty = (video: VideoItem) => {  // 新增函数
    currentVideo.value = video
    showDifficultyModal.value = true
    console.log(`查看难点：${video.title}`)
}

// 关闭难点弹窗
const handleDifficultyClose = () => {  // 新增函数
    showDifficultyModal.value = false
    currentVideo.value = null
}

// 打开上传弹窗
const openUploadModal = () => {
    showUploadModal.value = true
}

// 处理上传成功
const handleUploadSuccess = (videoData: any) => {

}

// 页面加载时初始化数据
onMounted(async () => {
    const res = await getUserVideos({ userId: Number(sessionStorage.userId), page: 1, limit: 10 });
    videoList.value = res.data.videos;

})
</script>

<template>
    <div class="video-container">
        <!-- 头部搜索区域 -->
        <div class="search-section">
            <div class="search-controls">
                <Row :gutter="16" align="center" class="search-row">
                    <Col :span="5">
                        <Input v-model="searchText" placeholder="输入教学视频名称" allow-clear size="large" class="search-input"
                            @press-enter="handleSearch">
                            <template #prefix>
                                <icon-search />
                            </template>
                        </Input>
                    </Col>
                    <Col :span="4">
                        <Select v-model="selectedFilter" :options="filterOptions" size="large" placeholder="筛选视频"
                            class="filter-select" />
                    </Col>
                    <Col :span="4">
                        <Button type="primary" size="large" :loading="loading" @click="handleSearch" class="search-btn">
                            <template #icon>
                                <icon-search />
                            </template>
                            搜索
                        </Button>
                    </Col>
                    <Col :span="4">
                        <Button type="primary" size="large" @click="openUploadModal" class="reset-btn">
                            <template #icon>
                                <icon-upload />
                            </template>
                            上传
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>

        <!-- 视频列表区域 -->
        <div class="video-list-section">
            <Spin v-if="loading" class="loading-spin" tip="加载中..." />
            <div v-else>
                <!-- 搜索结果统计 -->
                <div class="result-info">
                    <span class="result-count">共找到 {{ videoList.length }} 个视频</span>
                    <span class="filter-info" v-if="selectedFilter !== 'all'">
                        （当前筛选：{{filterOptions.find(opt => opt.value === selectedFilter)?.label}}）
                    </span>
                </div>

                <!-- 视频网格列表 -->
                <div v-if="videoList.length > 0" class="video-grid-wrapper">
                    <Row class="video-row" :gutter="[16, 24]">
                        <Col v-for="video in videoList" :key="video.id" class="video-col" :xs="24" :sm="12" :md="8"
                            :lg="6">
                            <Card class="video-card" :body-style="{ padding: '0' }" hoverable>
                                <!-- 视频封面 -->
                                <div class="video-cover">
                                    <img :src="video.coverUrl" :alt="video.title" class="cover-image" />
                                    <div class="video-duration">
                                        {{ video.duration }}
                                    </div>
                                </div>

                                <!-- 视频信息 -->
                                <div class="video-info">
                                    <h3 class="video-title" :title="video.title">
                                        {{ video.title }}
                                    </h3>

                                    <!-- 标签区域
                                    <div class="video-tags">
                                        <Tag v-for="tag in video.tags" :key="tag" size="small" class="tag-item">
                                            {{ tag }}
                                        </Tag>
                                    </div> -->

                                    <!-- 操作按钮 -->
                                    <div class="video-actions">
                                        <Button type="text" size="small" @click="playVideo(video)">
                                            <template #icon>
                                                <icon-play-circle />
                                            </template>
                                            播放
                                        </Button>
                                        <Button type="text" size="small" @click="viewDifficulty(video)">
                                            <template #icon>
                                                <icon-star />
                                            </template>
                                            查看难点
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-state">
                    <div class="empty-content">
                        <icon-file-unknown />
                        <h3>未找到相关视频</h3>
                        <p>尝试修改搜索关键词或筛选条件</p>
                        <Button type="primary" @click="handleReset">
                            查看所有视频
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 视频播放弹窗 -->
        <VideoPlayer v-model:visible="showPlayer" :video-data="currentVideo" @close="handlePlayerClose" />
        <!-- 难点分析弹窗 -->
        <CheckDifficulty v-model:visible="showDifficultyModal" :video-data="currentVideo"
            @close="handleDifficultyClose" />
        <VideoUpload v-model:visible="showUploadModal" @upload-success="handleUploadSuccess" />
    </div>
</template>

<style lang="less" scoped>
.video-container {
    width: 100%;
    padding: 20px;
    margin: 10px 10px 10px 0px;
    border-radius: 10px;
    background: var(--color-bg-1);
    overflow-x: hidden;
    box-sizing: border-box;
}

.search-section {
    margin-bottom: 30px;

    .search-header {
        margin-bottom: 20px;

        .page-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-1);
            margin: 0 0 8px 0;
        }

        .page-description {
            font-size: 14px;
            color: var(--color-text-3);
            margin: 0;
        }
    }
}

.search-row {
    width: 100%;

    .search-input,
    .filter-select {
        width: 100%;

        :deep(.arco-input-inner-wrapper),
        :deep(.arco-select-view) {
            border-radius: 8px;
        }
    }

    .search-btn,
    .reset-btn {
        width: 100%;
        border-radius: 8px;
    }
}

.video-list-section {
    width: 100%;
    height: 100%;
    position: relative;

    .loading-spin {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
    }
}

.result-info {
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: #856cff;
    border-radius: 8px;
    font-size: 14px;

    .result-count {
        font-weight: 500;
        color: var(--color-bg-1);
    }

    .filter-info {
        color: var(--color-bg-1);
        margin-left: 8px;
    }
}

.video-grid-wrapper {
    width: 100%;
    overflow: hidden;
}

.video-row {
    width: 100% !important;
    margin: 0 !important;

    .video-col {
        padding: 0 8px !important;
        margin-bottom: 16px;
        box-sizing: border-box;
    }
}

.video-card {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--color-border-2);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--color-primary-light-2);
    }
}

.video-cover {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;

    .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .video-card:hover & .cover-image {
        transform: scale(1.05);
    }

    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: #856cff;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
    }

    .video-views {
        position: absolute;
        bottom: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
}

.video-info {
    padding: 12px;

    .video-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin: 0 0 8px 0;
        line-height: 1.4;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
    }
}

.video-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
    min-height: 24px;

    .tag-item {
        margin: 0;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        vertical-align: middle;
        box-sizing: border-box;
        background: #d4ccfd8e;
    }
}

.video-actions {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--color-border-2);

    :deep(.arco-btn-text) {
        color: var(--color-text-2);
        font-size: 12px;

        &:hover {
            color: var(--color-primary-6);
            background-color: var(--color-fill-2);
        }
    }
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    width: 100%;
    background: var(--color-fill-2);
    border-radius: 8px;

    .empty-content {
        text-align: center;

        .arco-icon {
            font-size: 48px;
            color: var(--color-text-4);
            margin-bottom: 16px;
        }

        h3 {
            font-size: 16px;
            color: var(--color-text-1);
            margin: 0 0 8px 0;
        }

        p {
            font-size: 14px;
            color: var(--color-text-3);
            margin: 0 0 16px 0;
        }
    }
}

// 响应式调整
@media (max-width: 768px) {
    .video-container {
        padding: 16px;
    }

    .video-cover {
        height: 140px;
    }

    .video-col {
        padding: 0 6px !important;
    }
}

@media (max-width: 576px) {
    .video-container {
        padding: 12px;
    }

    .search-row {
        .arco-col {
            margin-bottom: 12px;
        }
    }

    .video-cover {
        height: 120px;
    }

    .video-col {
        padding: 0 4px !important;
    }
}

.video-cover {
    cursor: pointer;
    position: relative;

    .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        .play-icon {
            font-size: 48px;
            color: rgba(255, 255, 255, 0.9);
        }
    }

    &:hover {
        .play-overlay {
            opacity: 1;
        }

        .cover-image {
            transform: scale(1.05);
        }
    }
}

.video-actions {
    .arco-btn {
        &:first-child {
            color: var(--color-primary-6);

            &:hover {
                color: var(--color-primary-5);
                background-color: var(--color-primary-light-1);
            }
        }
    }
}
</style>