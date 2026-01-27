<script setup lang="ts">
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
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
    Modal,
    Pagination
} from '@arco-design/web-vue'
import VideoUpload from '../Modal/VideoUpload.vue' // 视频上传弹窗组件
import VideoPlayer from '../Modal/VideoPlayer.vue' // 视频播放弹窗组件
import CheckDifficulty from '../Modal/CheckDifficulty.vue' // 难点查看弹窗组件
import { getUserVideos } from '@/api/videos'
import { type VideoItem, type ApiResponse, type RequestParams } from '@/types/video'



// 筛选选项
const filterOptions = [
    { label: '全部', value: 'all' },
    { label: '计算机科学', value: 'computer_science' },
    { label: '数学', value: 'math' },
    { label: '化学', value: 'chemistry' },
    { label: '艺术设计学', value: 'art_and_design' },
]

// 防抖
let searchTimer: number | null = null

// 响应式数据
const searchText = ref('')
const selectedFilter = ref('all')
const videoList = ref<VideoItem[]>([])
const loading = ref(false)
const showPlayer = ref(false) // 播放弹窗显示状态
const showDifficultyModal = ref(false)  // 难点弹窗显示状态
const showUploadModal = ref(false) // 上传弹窗显示状态
const currentVideo = ref<VideoItem | null>(null)
// 分页相关数据
const pagination = reactive({
    current: 1,
    pageSize: 12,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true
})

// 构建请求参数
const buildRequestParams = (page = 1): RequestParams => {
    const params: RequestParams = {
        userId: Number(sessionStorage.userId),
        page: page,
        limit: pagination.pageSize
    }

    // 添加搜索参数
    if (searchText.value.trim()) {
        params.search = searchText.value.trim()
    }

    // 添加分类筛选参数（排除'all'）
    if (selectedFilter.value !== 'all') {
        params.category = selectedFilter.value
    }

    return params;
}

// 加载视频列表
const loadVideoList = async (page = 1) => {
    loading.value = true;
    try {
        const params = buildRequestParams(page)
        const res: ApiResponse = await getUserVideos(params);

        if (res.status && res.data) {
            videoList.value = res.data.videos;
            // 更新分页信息
            pagination.current = res.data.pagination.page;
            pagination.total = res.data.pagination.total;

            // 如果没有数据且不是第一页，自动跳转到第一页
            if (res.data.videos.length === 0 && page > 1) {
                Message.info('当前页无数据，已跳转到第一页')
                pagination.current = 1
                await loadVideoList(1)
            }
        } else {
            Message.error(res.message || '获取视频列表失败');
        }
    } catch (error) {
        console.error('加载视频列表失败:', error);
        Message.error('加载视频列表失败');
    } finally {
        loading.value = false;
    }
}

// 监听筛选条件变化，自动触发搜索
watch([searchText, selectedFilter], () => {
    if (searchTimer) {
        clearTimeout(searchTimer)
    }

    // 防抖处理，300ms后执行搜索
    searchTimer = setTimeout(() => {
        pagination.current = 1 // 重置到第一页
        loadVideoList(1)
    }, 300)
})


// 处理页码变化
const handlePageChange = (page: number) => {
    pagination.current = page
    loadVideoList(page)
}

// 处理每页显示数量变化
const handlePageSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.current = 1 // 重置到第一页
    loadVideoList(1)
}

// 搜索视频
const handleSearch = async () => {
    pagination.current = 1 // 搜索时重置到第一页
    loadVideoList(1)
}

// 重置搜索
const handleReset = () => {
    searchText.value = ''
    selectedFilter.value = 'all'
    pagination.current = 1
    loadVideoList(1)
    Message.info('已重置搜索条件')
}

// 处理上传成功
const handleUploadSuccess = () => {
    // 上传成功后重新加载当前页
    loadVideoList(pagination.current)
    Message.success('视频上传成功')
}

// 处理输入框的 Enter 键
const handlePressEnter = () => {
    handleSearch()
}

// 处理输入框的清空
const handleClearSearch = () => {
    if (!searchText.value) {
        // 当搜索框被清空时，重新加载数据
        pagination.current = 1
        loadVideoList(1)
    }
}

// 页面加载时初始化数据
onMounted(() => {
    loadVideoList(1)
})

// 组件卸载时清理定时器
onUnmounted(() => {
    if (searchTimer) {
        clearTimeout(searchTimer)
    }
})


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
</script>

<template>
    <div class="video-container">
        <!-- 头部搜索区域 -->
        <div class="search-section">
            <div class="search-controls">
                <Row :gutter="16" align="center" class="search-row">
                    <Col :span="5">
                        <Input v-model="searchText" placeholder="输入教学视频名称" allow-clear size="large" class="search-input"
                            @press-enter="handleSearch" @clear="handleClearSearch">
                            <template #prefix>
                                <icon-search />
                            </template>
                        </Input>
                    </Col>
                    <Col :span="4">
                        <Select v-model="selectedFilter" :options="filterOptions" size="large" placeholder="筛选视频"
                            class="filter-select" allow-clear @clear="selectedFilter = 'all'" />
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
                    <Col :span="3">
                        <Button type="outline" size="large" @click="handleReset" class="reset-btn">
                            <template #icon>
                                <icon-refresh />
                            </template>
                            重置
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
                    <span class="result-count">共找到 {{ pagination.total }} 个视频</span>
                    <span class="search-info" v-if="searchText">
                        （搜索关键词："{{ searchText }}"）
                    </span>
                    <span class="filter-info" v-if="selectedFilter !== 'all'">
                        （当前筛选：{{filterOptions.find(opt => opt.value === selectedFilter)?.label}}）
                    </span>
                    <span class="page-info">
                        第 {{ pagination.current }} 页 / 共 {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
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
                                    <div class="video-overlay">
                                        <div class="play-icon">
                                            <icon-play-circle-fill />
                                        </div>
                                    </div>
                                    <div class="video-duration">
                                        {{ video.duration || '0:00' }}
                                    </div>
                                </div>

                                <!-- 视频信息 -->
                                <div class="video-info">
                                    <h3 class="video-title" :title="video.title">
                                        {{ video.title }}
                                    </h3>

                                    <!-- 视频元信息 -->
                                    <div class="video-meta">
                                        <span class="category-tag" v-if="video.category">
                                            {{filterOptions.find(opt => opt.value === video.category)?.label ||
                                                video.category}}
                                        </span>
                                        <span class="upload-time">
                                            {{ new Date(video.uploadTime).toLocaleDateString() }}
                                        </span>
                                    </div>

                                    <!-- 操作按钮 -->
                                    <div class="video-actions">
                                        <Button type="primary" size="small" @click="playVideo(video)">
                                            <template #icon>
                                                <icon-play-circle />
                                            </template>
                                            播放
                                        </Button>
                                        <Button type="outline" size="small" @click="viewDifficulty(video)">
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

                    <div class="pagination-wrapper">
                        <Pagination v-model:current="pagination.current" v-model:pageSize="pagination.pageSize"
                            :total="pagination.total" :showTotal="pagination.showTotal"
                            :showJumper="pagination.showJumper" :showPageSize="pagination.showPageSize"
                            :pageSizeOptions="[10, 20, 50]" @change="handlePageChange"
                            @pageSizeChange="handlePageSizeChange" />
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-state">
                    <div class="empty-content">
                        <icon-file-unknown />
                        <h3>未找到相关视频</h3>
                        <p v-if="searchText || selectedFilter !== 'all'">
                            尝试修改搜索关键词或筛选条件
                        </p>
                        <p v-else>
                            暂无视频，点击上传按钮添加第一个视频
                        </p>
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
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
}

.search-section {
    margin-bottom: 30px;
    flex-shrink: 0;
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
    .upload-btn,
    .reset-btn {
        width: 100%;
        border-radius: 8px;
    }

    .reset-btn {
        border-color: var(--color-border-3);
        color: var(--color-text-2);

        &:hover {
            color: var(--color-primary-6);
            border-color: var(--color-primary-6);
        }
    }
}

.video-list-section {
    width: 100%;
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;

    .loading-spin {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
    }
}

.result-info {
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: #856cff;
    border-radius: 8px;
    font-size: 14px;
    flex-shrink: 0;
    color: var(--color-bg-1);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .result-count {
        font-weight: 500;
    }

    .search-info,
    .filter-info {
        opacity: 0.9;
    }

    .page-info {
        margin-left: auto;
        font-size: 12px;
        opacity: 0.8;
    }
}

.video-grid-wrapper {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.video-row {
    width: 100% !important;
    margin: 0 !important;
    flex: 1;

    .video-col {
        padding: 0 8px !important;
        margin-bottom: 16px;
        box-sizing: border-box;
    }
}

.pagination-wrapper {
    margin-top: 30px;
    padding: 20px 0;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    border-top: 1px solid var(--color-border-2);

    :deep(.arco-pagination) {
        justify-content: center;
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
    cursor: pointer;

    .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .video-overlay {
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
        .cover-image {
            transform: scale(1.05);
        }

        .video-overlay {
            opacity: 1;
        }
    }

    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1;
    }
}

.video-info {
    padding: 12px;

    .video-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin: 0 0 12px 0;
        line-height: 1.4;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
    }

    .video-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 12px;
        color: var(--color-text-3);

        .category-tag {
            background: #d4ccfd8e;
            padding: 2px 8px;
            border-radius: 12px;
        }

        .upload-time {
            opacity: 0.7;
        }
    }
}

.video-actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;

    :deep(.arco-btn) {
        flex: 1;
        font-size: 12px;
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
    flex: 1;

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

    .result-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .page-info {
            margin-left: 0;
        }
    }

    .pagination-wrapper {
        :deep(.arco-pagination) {
            flex-wrap: wrap;
            justify-content: center;
        }
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

    .video-actions {
        flex-direction: column;
        gap: 4px;
    }
}
</style>