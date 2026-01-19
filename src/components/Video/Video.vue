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
    Spin
} from '@arco-design/web-vue'

// 视频类型定义
interface VideoItem {
    id: number
    title: string
    tags: string[]
    cover: string
    duration: string
    views?: number
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

// 模拟数据 - 这里保持您的模拟数据不变
// 模拟数据
const mockVideos: VideoItem[] = [
    {
        id: 1,
        title: 'Linear Regression with multiple variables',
        tags: ['Gradient Descent', 'Feature Scaling', 'Cost Function'],
        cover: '/images/covers/video_1.png',
        duration: '8:50'
    },
    {
        id: 2,
        title: 'Dimentionality Reduction',
        tags: ['Dimensionality Reduction', 'Data Compression', 'Redundant Features'],
        cover: '/images/covers/video_2.png',
        duration: '10:09'
    },
    {
        id: 3,
        title: 'Advice for applying machine leaning',
        tags: ['Regularization', 'Cross-validation Set', 'Model Selection'],
        cover: '/images/covers/video_3.png',
        duration: '11:16',
        views: 2345
    },
    {
        id: 4,
        title: 'Anomaly detection: Anomaly detection using the multivariate Gussian distribution',
        tags: ['Multivariate Gaussian Distribution', 'Anomaly Detection Algorithm', 'Covariance Matrix'],
        cover: '/images/covers/video_4.png',
        duration: '14:02',
        views: 1567
    },
    {
        id: 5,
        title: 'Anomaly detection: Algorithm',
        tags: ['Gaussian Distribution', 'Anomaly Detection Algorithm', 'Features', 'Density Estimation', 'Epsilon'],
        cover: '/images/covers/video_5.png',
        duration: '12:02',
        views: 987
    },
    {
        id: 6,
        title: 'Anomaly detection: Gaussian distribution',
        tags: ['Gaussian distribution', 'Mean', 'Variance', 'Standard deviation', 'Parameter estimation'],
        cover: '/images/covers/video_6.png',
        duration: '10:27',
        views: 765
    },
    {
        id: 7,
        title: 'Anomaly detection: Problem motivation',
        tags: ['Anomaly Detection', 'Unsupervised Learning', 'Probability Model', 'Features', 'Epsilon'],
        cover: '/images/covers/video_7.png',
        duration: '7:37',
        views: 1890
    },
    {
        id: 8,
        title: 'Dimensionality reduction: Advice for apply PCA',
        tags: ['Principal Component Analysis', 'Supervised Learning', 'Dimensionality Reduction', 'Overfitting', 'Training Set'],
        cover: '/images/covers/video_8.png',
        duration: '12:48',
        views: 1432
    },
    {
        id: 9,
        title: 'Dimensionality reduction: Reconstruction from compressed representation',
        tags: ['Principal Component Analysis', 'Compression Algorithm', 'Reconstruction', 'Reduced Representation', 'Projection Error'],
        cover: '/images/covers/video_9.png',
        duration: '3:53',
        views: 1098
    },
    {
        id: 10,
        title: 'Dimensionality reduction: Choosing the number of principal components',
        tags: ['Principal Component Analysis', 'Number of Principal Components', 'Average Squared Projection Error', 'Total Variation', 'Variance Retained'],
        cover: '/images/covers/video_10.png',
        duration: '10:30',
        views: 876
    },
    {
        id: 11,
        title: 'Dimensionality reduction: Principal component analysis algorithm',
        tags: ['Principal Component Analysis', 'Covariance Matrix', 'Eigenvectors', 'Singular Value Decomposition', 'Dimensionality Reduction'],
        cover: '/images/covers/video_11.png',
        duration: '15:13',
        views: 654
    },
    {
        id: 12,
        title: 'Dimensionality reduction: Principal component analysis problem formulation',
        tags: ['Principal Component Analysis', 'Dimensionality Reduction', 'Projection Error', 'Linear Regression', 'Feature Scaling'],
        cover: '/images/covers/video_12.png',
        duration: '9:05',
        views: 1321
    }
]

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

// 页面加载时初始化数据
onMounted(() => {
    videoList.value = [...mockVideos]
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
                        <Button type="primary" size="large" @click="handleReset" class="reset-btn">
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
                                    <img :src="video.cover" :alt="video.title" class="cover-image" />
                                    <div class="video-duration">
                                        {{ video.duration }}
                                    </div>
                                </div>

                                <!-- 视频信息 -->
                                <div class="video-info">
                                    <h3 class="video-title" :title="video.title">
                                        {{ video.title }}
                                    </h3>

                                    <!-- 标签区域 -->
                                    <div class="video-tags">
                                        <Tag v-for="tag in video.tags" :key="tag" size="small" class="tag-item">
                                            {{ tag }}
                                        </Tag>
                                    </div>

                                    <!-- 操作按钮 -->
                                    <div class="video-actions">
                                        <Button type="text" size="small">
                                            <template #icon>
                                                <icon-play-circle />
                                            </template>
                                            播放
                                        </Button>
                                        <Button type="text" size="small">
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
</style>