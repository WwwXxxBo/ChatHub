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

// 视频类型定义
interface VideoItem {
    id: number
    title: string
    tags: string[]
    cover: string
    duration: string
    views?: number
    url?: string // 视频播放地址字段
    difficulty?: string,
    category?: string // 新增分类字段
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

// 模拟数据
const mockVideos: VideoItem[] = [
    {
        id: 1,
        title: 'Linear Regression with multiple variables',
        tags: ['Gradient Descent', 'Feature Scaling', 'Cost Function'],
        cover: '/images/covers/video_1.png',
        duration: '8:50',
        url: '/videos/video1.mp4',
        difficulty: 'In this video on feature scaling for gradient descent, learners may find it challenging to intuitively grasp why skewed contours of the cost function—resulting from features with vastly different ranges—slow down convergence, as this requires visualizing the optimization landscape. Additionally, applying the practical steps of feature scaling, such as choosing between simple division, mean normalization, or standard deviation-based scaling, and determining acceptable value ranges (e.g., –1 to 1 versus –3 to 3) can be confusing due to the heuristic and flexible nature of the guidelines provided.'
    },
    {
        id: 2,
        title: 'Dimentionality Reduction',
        tags: ['Dimensionality Reduction', 'Data Compression', 'Redundant Features'],
        cover: '/images/covers/video_2.png',
        duration: '10:09',
        url: '/videos/video1.mp4',
        difficulty: ' This video introduces dimensionality reduction as an unsupervised learning technique, primarily for data compression and algorithm acceleration. The main learning challenges include grasping the abstract motivation behind reducing dimensions—moving from intuitive examples (like redundant measurements in centimeters and inches) to applying the concept in high-dimensional spaces (e.g., reducing 1000D to 100D). Learners may also struggle with visualizing the projection process, especially when transitioning from 3D to 2D, and understanding how data points are represented in a lower-dimensional space (e.g., using new features like z1 and z2) without losing significant information. Additionally, connecting the theoretical benefits (like reduced memory usage and faster computation) to practical machine learning workflows may require further contextualization.'
    },
    {
        id: 3,
        title: 'Advice for applying machine leaning',
        tags: ['Regularization', 'Cross-validation Set', 'Model Selection'],
        cover: '/images/covers/video_3.png',
        duration: '11:16',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcription presents several learning challenges, primarily revolving around the conceptual interplay between regularization, bias, and variance in machine learning. One key difficulty lies in understanding the nonlinear effects of the regularization parameter lambda: students must grasp how extremely large lambda leads to high bias and underfitting, while very small lambda results in high variance and overfitting, with only an intermediate value yielding a good fit. The introduction of modified cost functions—J_train, J_CV, and J_test—without the regularization term adds complexity, as learners must distinguish between the objective used for training and the error metrics used for evaluation. The model selection process for lambda, involving training multiple models with different lambda values and using cross-validation error to choose the best one, requires careful tracking of multiple steps and hypotheses. Additionally, interpreting the idealized plots of training error and cross-validation error as functions of lambda demands abstraction, as real-world data may produce noisier curves. The transition from manual reasoning about bias-variance trade-offs to a systematic diagnostic approach using learning curves may also be challenging, as it requires synthesizing previous concepts into a practical troubleshooting framework.'
    },
    {
        id: 4,
        title: 'Anomaly detection: Anomaly detection using the multivariate Gussian distribution',
        tags: ['Multivariate Gaussian Distribution', 'Anomaly Detection Algorithm', 'Covariance Matrix'],
        cover: '/images/covers/video_4.png',
        duration: '14:02',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcript presents several learning challenges due to its technical depth and conceptual complexity, particularly for learners new to anomaly detection or multivariate statistics. The discussion shifts from the foundational multivariate Gaussian distribution to its application in anomaly detection, which requires viewers to connect abstract statistical concepts with practical algorithmic implementation. A major difficulty lies in distinguishing between the original anomaly detection model (which assumes feature independence) and the multivariate Gaussian model (which captures feature correlations), as the speaker compares their mathematical equivalence under specific constraints, their respective advantages in capturing unusual feature combinations, and their computational trade-offs regarding scalability and training data requirements. Additionally, the explanation of parameter estimation, covariance matrix inversion, and the conditions for non-invertible matrices (such as redundant features or insufficient training examples) introduces advanced linear algebra concepts that may be challenging without prior background. The rapid pacing and dense technical jargon, combined with the need to visualize Gaussian contours and covariance structures, could overwhelm learners who are not already comfortable with multivariate probability, matrix operations, and algorithmic design considerations in machine learning.'
    },
    {
        id: 5,
        title: 'Anomaly detection: Algorithm',
        tags: ['Gaussian Distribution', 'Anomaly Detection Algorithm', 'Features', 'Density Estimation', 'Epsilon'],
        cover: '/images/covers/video_5.png',
        duration: '12:02',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcript presents several learning challenges for students, primarily due to the technical and conceptual complexity of applying Gaussian distributions to anomaly detection. The speaker transitions from discussing theoretical probability models to practical algorithm implementation, which may overwhelm learners unfamiliar with statistical assumptions like feature independence and density estimation. The use of mathematical notation—such as product notation (Π), parameters (μ, σ²), and the probability model P(x)—requires solid foundational knowledge, and the shift between scalar and vectorized parameter estimation could cause confusion. Additionally, the explanation of setting a threshold ε for anomaly classification is introduced without detailed justification, leaving a gap in understanding how to choose this value in practice. The example with 3D surface plots, while illustrative, relies on visualization that may be difficult to grasp without graphical aids, and the rapid integration of parameter fitting, probability computation, and decision-making might make it hard for learners to distinguish between training and inference phases. The aside regarding independence assumptions, while aimed at statistics experts, could inadvertently distract or confuse beginners who are still grappling with the core algorithm. Overall, the material demands prior comfort with probability, Gaussian distributions, and algorithmic thinking to fully absorb how anomaly detection is constructed and applied in an unsupervised setting.'
    },
    {
        id: 6,
        title: 'Anomaly detection: Gaussian distribution',
        tags: ['Gaussian distribution', 'Mean', 'Variance', 'Standard deviation', 'Parameter estimation'],
        cover: '/images/covers/video_6.png',
        duration: '10:27',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcript on the Gaussian (Normal) distribution and parameter estimation presents several learning challenges primarily due to the presence of numerous transcription errors, inconsistent terminology, and fragmented explanations. The frequent misspellings—such as "galley," "golan," "gauzy," or "galatian" for "Gaussian," "various" for "variance," and "prom to sign" for "parameter sigma"—can significantly confuse learners attempting to follow or search for standard statistical terms. The flow of concepts is occasionally disrupted by incomplete sentences and grammatical issues, making it harder to grasp the logical progression from defining the distribution to estimating its parameters. While the instructor attempts to explain the bell curve, mean, variance, and standard deviation visually, the description becomes muddled when discussing the "wife" (likely intended as "width") of the curve and its relationship to sigma. The section on parameter estimation introduces formulas for the sample mean and variance, but the sudden reference to maximum likelihood estimation and the alternative formula using m−1 might be abrupt for beginners without prior statistics knowledge, despite the disclaimer. Additionally, the repetitive phrasing and spoken fillers ("um," "you know") transcribed verbatim can distract from the core content. Overall, a learner would need to overcome these textual inconsistencies and focus on reconciling the intended concepts with the correct mathematical terminology and clear definitions to fully understand the Gaussian distribution and its application in subsequent anomaly detection.'
    },
    {
        id: 7,
        title: 'Anomaly detection: Problem motivation',
        tags: ['Anomaly Detection', 'Unsupervised Learning', 'Probability Model', 'Features', 'Epsilon'],
        cover: '/images/covers/video_7.png',
        duration: '7:37',
        url: '/videos/video1.mp4',
        difficulty: 'This transcription presents several learning challenges primarily due to its technical depth and conceptual complexity, as it introduces anomaly detection as a hybrid between unsupervised and supervised learning, which might confuse learners new to machine learning paradigms. The explanation relies heavily on abstract statistical modeling—specifically estimating the probability distribution p(x) and setting a threshold epsilon—a concept that requires a solid grasp of probability theory and may be difficult to visualize without concrete mathematical examples or diagrams. Additionally, the use of varied real-world applications, such as fraud detection and data center monitoring, while helpful for context, introduces multiple domain-specific features and scenarios that could overwhelm learners trying to isolate the core algorithmic principles. The speaker’s informal phrasing and occasional fragmented sentences further obscure key points, making it challenging to follow the logical flow from problem definition to solution approach without prior exposure to these topics.'
    },
    {
        id: 8,
        title: 'Dimensionality reduction: Advice for apply PCA',
        tags: ['Principal Component Analysis', 'Supervised Learning', 'Dimensionality Reduction', 'Overfitting', 'Training Set'],
        cover: '/images/covers/video_8.png',
        duration: '12:48',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcription on PCA presents several learning challenges, primarily due to its technical depth and nuanced application advice. Learners may struggle with understanding the exact procedural steps for integrating PCA into a supervised learning pipeline, especially the critical distinction that PCA should only be fitted on the training set before transforming both training and test data. The explanation of how PCA defines a mapping from high-dimensional X to lower-dimensional Z can be conceptually difficult, particularly the part about retaining parameters like scaling matrices from the training phase. Another significant难点 is differentiating between appropriate and inappropriate uses of PCA; the video strongly emphasizes that PCA is excellent for compression and speeding up algorithms but is a poor choice for preventing overfitting, a point that contradicts a common misconception and requires learners to mentally contrast PCA with regularization techniques. Additionally, the advice on when to use PCA—suggesting to first try learning with original data and only resort to PCA if faced with performance or storage issues—adds a layer of strategic decision-making that beginners might find challenging to apply in practice. The discussion on choosing k for different applications (like retaining 99% variance for speed versus k=2/3 for visualization) also requires learners to grasp the trade-off between dimensionality reduction and information retention. Overall, the material demands that learners not only understand PCA\'s mechanics but also develop critical judgment for its correct and efficient application in real-world machine learning workflows.'
    },
    {
        id: 9,
        title: 'Dimensionality reduction: Reconstruction from compressed representation',
        tags: ['Principal Component Analysis', 'Compression Algorithm', 'Reconstruction', 'Reduced Representation', 'Projection Error'],
        cover: '/images/covers/video_9.png',
        duration: '3:53',
        url: '/videos/video1.mp4',
        difficulty: 'The transcription of this instructional video presents several learning challenges, primarily revolving around the conceptual leap from understanding Principal Component Analysis (PCA) as a compression technique to grasping its reversible reconstruction process. The key difficulty lies in following the mathematical transformation from the compressed representation \'z\' back to the approximate original data \'x,\' especially when the explanation shifts between abstract dimensionality (e.g., 1000-D to 100-D) and a simplified 2-D visual example. Listeners must mentally bridge the general equation with its dimensional checks (n-by-k and k-by-1 matrices) and the specific geometric illustration of points projected onto a line. Additionally, the rapid transition from theory to application—such as the mention of squared projection error and the upcoming topic of choosing the right \'k\'—may overwhelm learners who are still solidifying their understanding of the reconstruction mechanism and its limitations as an approximation. The absence of a step-by-step breakdown for the reconstruction formula could leave gaps in comprehension for those unfamiliar with linear algebra operations in the context of machine learning.'
    },
    {
        id: 10,
        title: 'Dimensionality reduction: Choosing the number of principal components',
        tags: ['Principal Component Analysis', 'Number of Principal Components', 'Average Squared Projection Error', 'Total Variation', 'Variance Retained'],
        cover: '/images/covers/video_10.png',
        duration: '10:30',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional transcript on PCA parameter selection presents several learning challenges, primarily due to its dense integration of conceptual explanations, mathematical formulations, and algorithmic procedures. The content assumes prior familiarity with PCA fundamentals, such as projection error and total variation, which might be difficult for learners without a strong foundation in linear algebra or dimensionality reduction concepts. The introduction of key terms like "variance retained" is briefly mentioned but not deeply explained, leaving a gap in intuitive understanding. Additionally, the shift from a conceptual rule of thumb—choosing k based on a variance retention threshold—to a computationally efficient method using SVD (Singular Value Decomposition) and the matrix S may cause discontinuity for learners. The mathematical notation and rapid presentation of formulas, such as the ratio of summed diagonal elements of S, could be challenging to follow without step-by-step visualization or prior exposure to SVD outputs. Furthermore, while the speaker offers practical guidelines (e.g., common variance retention values between 95–99%), the reasoning behind these thresholds and their implications for different datasets is not elaborated, potentially leaving learners uncertain about how to adapt the advice to real-world scenarios. The overall pace and structure, which mixes theory, calculation shortcuts, and implementation tips, might overwhelm beginners who are still grasping the core purpose of PCA and the trade-offs involved in selecting k.'
    },
    {
        id: 11,
        title: 'Dimensionality reduction: Principal component analysis algorithm',
        tags: ['Principal Component Analysis', 'Covariance Matrix', 'Eigenvectors', 'Singular Value Decomposition', 'Dimensionality Reduction'],
        cover: '/images/covers/video_11.png',
        duration: '15:13',
        url: '/videos/video1.mp4',
        difficulty: 'The transcription of this instructional video on the Principal Component Analysis (PCA) algorithm presents several learning challenges, primarily stemming from its reliance on advanced mathematical concepts and technical implementation details without thorough foundational explanation. The speaker frequently references complex linear algebra topics—such as covariance matrices, eigenvectors, singular value decomposition (SVD), and symmetric positive semi-definite matrices—while explicitly stating that full mathematical derivations and proofs are beyond the scope of the course. This creates a gap for learners who may not have a strong background in linear algebra, leaving them to accept procedures like computing eigenvectors via SVD as operational steps without deep understanding. Additionally, the explanation shifts between abstract geometric intuitions (like minimizing projection error onto a subspace) and concrete implementation steps in Octave or MATLAB, which might confuse learners trying to connect theory with practice. The use of variable-heavy notation and rapid transitions between 2D and 3D examples further complicate comprehension. Although the speaker reassures viewers that they can implement PCA without grasping all the underlying math, the lack of step-by-step conceptual bridging—especially around why SVD is used and how covariance matrices relate to dimensionality reduction—may leave learners with a procedural rather than intuitive understanding of PCA.'
    },
    {
        id: 12,
        title: 'Dimensionality reduction: Principal component analysis problem formulation',
        tags: ['Principal Component Analysis', 'Dimensionality Reduction', 'Projection Error', 'Linear Regression', 'Feature Scaling'],
        cover: '/images/covers/video_12.png',
        duration: '9:05',
        url: '/videos/video1.mp4',
        difficulty: 'This instructional video transcript on Principal Component Analysis (PCA) presents several learning challenges, primarily due to the conceptual shift from supervised learning methods like linear regression to an unsupervised dimensionality reduction technique, which may confuse learners familiar with predictive modeling. The explanation introduces the core idea of minimizing projection error—the orthogonal distance from data points to a lower-dimensional surface—but this geometric interpretation requires strong spatial visualization, especially when extending from 2D to 3D and higher dimensions. Additionally, the distinction between PCA and linear regression is subtle yet critical; while both involve minimizing distances, PCA uses perpendicular projection errors onto a subspace without a distinguished output variable, unlike linear regression’s vertical errors in predicting a specific target. The use of vector terminology and references to linear algebra concepts, such as subspaces and orthogonality, may further complicate understanding for those without a strong mathematical background. Finally, the preliminary steps of mean normalization and feature scaling are mentioned but not deeply explained within the PCA context, potentially leaving gaps in practical implementation knowledge.'
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

// 播放视频
const playVideo = (video: VideoItem) => {
    currentVideo.value = video
    showPlayer.value = true

    // 记录播放历史（可选）
    if (video.views !== undefined) {
        video.views++
    }

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
    // 添加上传到视频列表
    const newVideo: VideoItem = {
        id: videoData.id,
        title: videoData.title,
        tags: videoData.tags || [],
        cover: videoData.cover || '/images/covers/default.png',
        duration: videoData.duration,
        url: videoData.url,
        difficulty: videoData.difficulty,
        category: videoData.category,
        views: 0
    }

    videoList.value.unshift(newVideo)
    Message.success('视频已添加到列表！')
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