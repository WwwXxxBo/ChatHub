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

interface VideoUploadProps {
    visible: boolean
}

interface VideoUploadEmits {
    (e: 'update:visible', value: boolean): void
    (e: 'upload-success', videoData: any): void
}

interface VideoFormData {
    title: string
    tags: string[]
    difficulty: string
    category: string
}

const props = defineProps<VideoUploadProps>()
const emit = defineEmits<VideoUploadEmits>()

const formRef = ref<FormInstance>()
const uploading = ref(false)
const videoUrl = ref<string>('')
const videoDuration = ref<number>(0)

const formData = reactive<VideoFormData>({
    title: '',
    tags: [],
    difficulty: '',
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
    if (fileItem && fileItem.status === 'done') {
        const file = fileItem.file
        if (file && file.type.startsWith('video/')) {
            videoUrl.value = URL.createObjectURL(file)
        }
    } else if (fileList.length === 0) {
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
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv']
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
    videoUrl.value = ''
    videoDuration.value = 0
    formData.title = ''
    formData.tags = []
    formData.difficulty = ''
    formData.category = ''
    uploading.value = false

    emit('update:visible', false)
}

// 处理确认上传
const handleConfirm = async () => {
    if (!videoUrl.value) {
        Message.error('请先上传视频文件')
        return
    }

    const valid = await formRef.value?.validate()
    if (valid) {
        return
    }

    uploading.value = true

    try {
        // 模拟上传到服务器的过程
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 创建模拟的返回数据
        const uploadedVideo = {
            id: Date.now(), // 使用时间戳作为临时ID
            title: formData.title,
            tags: formData.tags,
            cover: '/images/covers/default.png', // 默认封面
            duration: formatDuration(videoDuration.value),
            url: videoUrl.value,
            difficulty: formData.difficulty,
            category: formData.category
        }

        Message.success('视频上传成功！')

        // 触发成功事件
        emit('upload-success', uploadedVideo)

        // 关闭弹窗
        handleCancel()

    } catch (error) {
        Message.error('上传失败，请重试')
    } finally {
        uploading.value = false
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
                <Upload draggable action="/api/upload" :limit="1" accept=".mp4,.avi,.mov,.mkv,.wmv"
                    :before-upload="beforeUpload" :auto-upload="false" @change="handleChange" @remove="handleRemove"
                    class="upload-draggable">
                    <template #upload-button>
                        <div class="upload-tip">
                            <p>点击或拖拽视频文件到此处</p>
                            <p>支持 MP4、AVI、MOV、MKV、WMV 格式，大小不超过 500MB</p>
                        </div>
                    </template>
                </Upload>

                <!-- 视频预览 -->
                <div v-if="videoUrl" class="video-preview">
                    <video :src="videoUrl" controls preload="metadata" class="preview-video"
                        @loadedmetadata="handleVideoLoaded"></video>
                    <div v-if="videoDuration" class="video-duration">
                        时长：{{ formatDuration(videoDuration) }}
                    </div>
                </div>

                <!-- 视频信息表单 -->
                <div class="video-info-form">
                    <Form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                        <Form.Item field="title" label="视频标题" :rules="[{ required: true, message: '请输入视频标题' }]">
                            <Input v-model="formData.title" placeholder="请输入视频标题" max-length="100" show-word-limit />
                        </Form.Item>

                        <Form.Item field="category" label="分类">
                            <Select v-model="formData.category" placeholder="选择视频分类">
                                <Option value="computer_science">计算机科学</Option>
                                <Option value="math">数学</Option>
                                <Option value="chemistry">化学</Option>
                                <Option value="art_and_design">艺术设计学</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-footer">
                <Button @click="handleCancel">取消</Button>
                <Button class="confirm-btn" :loading="uploading" :disabled="!videoUrl || !formData.title"
                    @click="handleConfirm">
                    {{ uploading ? '上传中...' : '确认上传' }}
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

    .video-preview {
        margin-top: 20px;

        .preview-video {
            width: 100%;
            max-height: 200px;
            border-radius: 6px;
            background-color: #000;
        }

        .video-duration {
            margin-top: 8px;
            font-size: 12px;
            color: var(--color-text-3);
            text-align: center;
        }
    }

    .video-info-form {
        margin-top: 20px;

        :deep(.arco-form-item) {
            margin-bottom: 16px;
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