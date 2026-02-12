<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
    Modal,
    Message,
    Form,
    Input,
    Select,
    Button,
    Option,
    Upload,
    type FormInstance,
    type FileItem
} from '@arco-design/web-vue'
import { uploadVideo, type UploadVideoResponse, type UploadVideoParams } from '@/api/videos'
import { processVideoAsync } from '@/api/rag'
import { randomUUID } from "@/utils/id-util";

interface VideoUploadProps {
    visible: boolean
}

interface VideoUploadEmits {
    (e: 'update:visible', value: boolean): void
    (e: 'upload-success', videoData: any): void
}

interface VideoFormData {
    title: string
    category: string
    description?: string
}

const props = defineProps<VideoUploadProps>()
const emit = defineEmits<VideoUploadEmits>()

const formRef = ref<FormInstance>()
const uploading = ref(false)
const uploadProgress = ref<number>(0)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoDuration = ref<number>(0)
const processingModal = ref(null);

const formData = reactive<VideoFormData>({
    title: '',
    category: ''
})


const formRules = {
    title: [{ required: true, message: '请输入视频标题' }],
    category: [{ required: true, message: '请选择视频分类' }]
}

// 处理文件变化
const handleChange = (fileList: FileItem[]) => {
    // 只保留最新上传的文件
    if (fileList.length > 1) {
        fileList.splice(0, fileList.length - 1)
    }

    const fileItem = fileList[0]
    if (fileItem) {
        const file = fileItem.file
        if (file && file.type.startsWith('video/')) {
            videoFile.value = file
            videoUrl.value = URL.createObjectURL(file)
        }
    } else if (fileList.length === 0) {
        videoFile.value = null
        videoUrl.value = ''
        videoDuration.value = 0
    }
}

// 上传前验证
const beforeUpload = (file: File): boolean | Promise<boolean> => {
    // 检查文件大小（500MB限制）
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
        Message.error('文件大小不能超过500MB')
        return false
    }

    // 检查文件类型
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    const fileName = file.name.toLowerCase()
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!isValidExtension && !file.type.startsWith('video/')) {
        Message.error('请上传 MP4、AVI、MOV、MKV 或 WMV 格式的视频文件')
        return false
    }

    return true
}

// 移除文件
const handleRemove = () => {
    if (videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value)
        videoUrl.value = ''
        videoDuration.value = 0
        videoFile.value = null
    }
    return true
}

// 格式化时长
const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 视频元数据加载完成
const handleVideoLoaded = (event: Event) => {
    const video = event.target as HTMLVideoElement
    videoDuration.value = video.duration
}

// 处理取消
const handleCancel = () => {
    // 清理URL对象
    if (videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value)
    }

    // 重置状态
    videoFile.value = null
    videoUrl.value = ''
    videoDuration.value = 0
    uploadProgress.value = 0
    formData.title = ''
    formData.category = ''
    formData.description = ''
    uploading.value = false

    emit('update:visible', false)
}

// 处理确认上传
const handleConfirm = async () => {
    if (!videoFile.value) {
        Message.error('请先上传视频文件')
        return
    }

    if (!sessionStorage.userId) {
        Message.error('用户未登录，请先登录')
        return
    }

    const valid = await formRef.value?.validate()
    if (valid) {
        return
    }

    uploading.value = true
    uploadProgress.value = 0

    try {
        // 准备上传参数
        const id = randomUUID();
        const uploadParams: UploadVideoParams = {
            video: videoFile.value,
            videoId: id,
            userId: sessionStorage.userId,
            title: formData.title,
            category: formData.category,
            description: formData.description,
            tags: [],
            difficulty: ''
        }

        // 1. 调用真实的上传API
        const response = await uploadVideo(uploadParams, (progress) => {
            uploadProgress.value = progress
        })

        if (response.success) {
            Message.success(response.data.message || '视频上传成功！')

            // 构建返回数据
            const uploadedVideo = {
                id: response.data.id,
                videoId: response.data.videoId,
                title: response.data.title || formData.title,
                cover: '/images/covers/default.png',
                duration: formatDuration(videoDuration.value),
                url: response.data.url,
                originalUrl: response.data.url,
                size: response.data.size,
                category: response.data.category || formData.category,
                uploadTime: response.data.uploadTime,
                fileName: response.data.originalName
            }

            // 2. 触发上传成功事件
            emit('upload-success', uploadedVideo)

            // 3. 关闭上传弹窗
            handleCancel()

            // 4. 显示视频处理中弹窗并调用处理接口
            let processingModal: any = null
            try {
                processingModal = Modal.info({
                    title: '视频处理中',
                    content: '正在对视频进行分析和转码，请稍候...',
                    closable: false,
                    maskClosable: false,
                    hideCancel: true,
                    okText: '处理中',
                    simple: false
                })

                const res = await processVideoAsync(uploadedVideo.url)

                // 处理成功，关闭处理中弹窗
                processingModal?.close()

                // 显示处理成功提示
                Modal.success({
                    title: '处理完成',
                    content: '视频处理成功，已准备就绪！',
                    okText: '确定',
                    onOk: () => {
                        // 可以在这里跳转到视频详情页或其他操作
                        console.log('处理结果：', res)
                    }
                })

            } catch (processError: any) {
                // 处理失败，关闭处理中弹窗
                processingModal?.close()

                // 显示处理失败提示
                Modal.error({
                    title: '处理失败',
                    content: processError.message || '视频处理失败，请联系管理员',
                    okText: '确定'
                })

                // 这里可以选择是否重试
                const shouldRetry = await new Promise((resolve) => {
                    Modal.warning({
                        title: '是否重试？',
                        content: '视频处理失败，是否重新尝试处理？',
                        okText: '重试',
                        cancelText: '取消',
                        onOk: () => resolve(true),
                        onCancel: () => resolve(false)
                    })
                })

                if (shouldRetry) {
                    // 重新调用处理接口
                    await handleConfirm() // 注意：这里需要避免递归循环
                }

                console.error('视频处理失败:', processError)
            }
        } else {
            Message.error(response.data.message || '上传失败')
        }

    } catch (error: any) {
        console.error('上传失败:', error)

        // 根据错误类型显示不同的提示信息
        if (error.response?.status === 413) {
            Message.error('文件太大，请压缩后重新上传')
        } else if (error.response?.status === 400) {
            Message.error(error.response.data?.message || '文件格式不支持')
        } else if (error.response?.status === 401) {
            Message.error('请先登录')
        } else if (error.code === 'ECONNABORTED') {
            Message.error('上传超时，请检查网络连接')
        } else {
            Message.error('上传失败，请重试')
        }
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}
// 监听visible变化，当弹窗关闭时清理
watch(() => props.visible, (newVal) => {
    if (!newVal && videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value)
    }
})
</script>

<template>
    <Modal :visible="props.visible" title="上传教学视频" :footer="false" width="500px" unmount-on-close
        @cancel="handleCancel">
        <div class="video-upload-modal">
            <!-- 上传区域 -->
            <div class="upload-section">
                <Upload draggable :limit="1" accept=".mp4,.avi,.mov,.mkv,.wmv,.flv,.webm" :before-upload="beforeUpload"
                    :auto-upload="false" @change="handleChange" @remove="handleRemove" class="upload-draggable">
                    <template #upload-button>
                        <div class="upload-tip">
                            <p>点击或拖拽视频文件到此处</p>
                            <p>支持 MP4、AVI、MOV、MKV、WMV 格式，大小不超过 500MB</p>
                        </div>
                    </template>
                </Upload>

                <!-- 上传进度 -->
                <div v-if="uploading" class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <div class="progress-text">上传进度: {{ uploadProgress }}%</div>
                </div>

                <!-- 视频预览 -->
                <div v-if="videoUrl" class="video-preview">
                    <video :src="videoUrl" controls preload="metadata" class="preview-video"
                        @loadedmetadata="handleVideoLoaded"></video>
                    <div class="video-info">
                        <div v-if="videoDuration" class="video-duration">
                            时长：{{ formatDuration(videoDuration) }}
                        </div>
                        <div v-if="videoFile" class="video-size">
                            大小：{{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB
                        </div>
                    </div>
                </div>

                <!-- 视频信息表单 -->
                <div class="video-info-form">
                    <Form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                        <Form.Item field="title" label="视频标题" required>
                            <Input v-model="formData.title" placeholder="请输入视频标题" max-length="100" show-word-limit />
                        </Form.Item>

                        <Form.Item field="category" label="分类" required>
                            <Select v-model="formData.category" placeholder="选择视频分类">
                                <Option value="computer_science">计算机科学</Option>
                                <Option value="math">数学</Option>
                                <Option value="chemistry">化学</Option>
                                <Option value="art_and_design">艺术设计学</Option>
                                <Option value="other">其他</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item field="description" label="描述（可选）">
                            <Input v-model="formData.description" placeholder="请输入视频描述" type="textarea" :rows="3"
                                max-length="500" show-word-limit />
                        </Form.Item>
                    </Form>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-footer">
                <Button @click="handleCancel">取消</Button>
                <Button class="confirm-btn" :loading="uploading"
                    :disabled="!videoFile || !formData.title || !formData.category" @click="handleConfirm">
                    {{ uploading ? `上传中... ${uploadProgress}%` : '确认上传' }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<style lang="less" scoped>
.video-upload-modal {
    .upload-section {
        margin-bottom: 24px;
    }

    .upload-draggable {
        margin-bottom: 20px;
        border: 2px dashed #856cff;
        border-radius: 10px;

        :deep(.arco-upload-drag) {
            background-color: var(--color-fill-2);

            &:hover {
                background-color: var(--color-fill-3);
            }
        }
    }

    .upload-tip {
        padding: 20px 0;
        text-align: center;

        p:first-child {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 4px;
        }

        p:last-child {
            font-size: 12px;
            color: var(--color-text-3);
        }
    }

    .upload-progress {
        margin-top: 16px;

        .progress-bar {
            height: 8px;
            background-color: var(--color-fill-3);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;

            .progress-fill {
                height: 100%;
                background-color: #856cff;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
        }

        .progress-text {
            font-size: 12px;
            color: var(--color-text-3);
            text-align: center;
        }
    }

    .video-preview {
        margin-top: 20px;

        .preview-video {
            width: 100%;
            max-height: 200px;
            border-radius: 6px;
            background-color: #000;
        }

        .video-info {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;

            .video-duration,
            .video-size {
                font-size: 12px;
                color: var(--color-text-3);
            }
        }
    }

    .video-info-form {
        margin-top: 20px;

        :deep(.arco-form-item) {
            margin-bottom: 16px;
        }

        :deep(.arco-select-view) {
            min-height: 32px;
        }
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid var(--color-border-2);

        .arco-btn {
            min-width: 80px;
        }
    }

    .confirm-btn {
        background-color: #856cff;
        color: var(--color-bg-1);
    }
}
</style>