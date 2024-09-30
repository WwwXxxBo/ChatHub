<script setup lang="ts">
import { reactive, toRefs } from 'vue'
// 引入 System、User 状态
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'
// 引入 UI 组件
import { FileItem, RequestOption } from '@arco-design/web-vue'
// 引入生成 randomUUID 方法 
import { randomUUID } from "@/utils/id-util"

const userStore = useUserStore()
const systemStore = useSystemStore()

// 接收父组件数据
defineProps({
  editable: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    default: 30
  }
})

// 设置模态框是否可见
const data = reactive({
  modalVisible: false,
  avatarFile: { url: userStore.avatar } as FileItem,
  userAvatarUrl: ''
})

const { modalVisible, avatarFile, userAvatarUrl } = toRefs(data)

const selectImageRequest = (option: RequestOption) => {
  const { fileItem, onSuccess } = option
  data.avatarFile = fileItem
  const reader =  new FileReader();
  reader.onload = (e) => {
    data.userAvatarUrl = e.target.result as string;
    userStore.avatar = data.userAvatarUrl
  }
  reader.readAsDataURL(fileItem.file);
  onSuccess();
  return {
    abort: () => {}
  }
}
</script>

<template>
  <a-avatar
    class="user-avatar"
    shape="square"
    :size="size"
    @click="modalVisible = !systemStore.chatWindowLoading && editable"
  >
    <img v-if="userStore.avatar" class="no-drag-area" :src="userStore.avatar" alt="" />
    <img v-else class="no-drag-area" src="@/assets/images/avatar.png" alt="" />
  </a-avatar>
  <!-- 用户设置Modal -->
  <a-modal
    v-model:visible="modalVisible"
    :footer="false"
    unmount-on-close
    title-align="start"
    width="350px"
  >
    <template #title> {{ $t('userSetting.name') }} </template>
    <div
      style="
        height: 200px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      "
    >
      <a-upload
        :file-list="avatarFile ? [avatarFile] : []"
        :show-file-list="false"
        :custom-request="selectImageRequest"
        accept="image/*"
      >
        <template #upload-button>
          <div class="arco-upload-list-item">
            <div
              v-if="avatarFile && avatarFile.url"
              class="arco-upload-list-picture custom-upload-avatar"
            >
              <img :src="userStore.avatar" alt="" />
              <div class="arco-upload-list-picture-mask">
                <IconEdit />
              </div>
            </div>
            <div v-else class="arco-upload-picture-card">
              <div class="arco-upload-picture-card-text">
                <IconPlus />
                <div style="margin-top: 10px; font-weight: 600">
                  {{ $t('userSetting.selectAvatar') }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </a-upload>
      <a-space direction="horizontal" :size="10" fill>
        <div>{{ $t('userSetting.nickname') }}</div>
        <a-input v-model="userStore.nickname" size="small" disabled />
      </a-space>
    </div>
  </a-modal>
</template>

<style lang="less" scoped>
.user-avatar {
  margin-top: 10px;
  :deep(.arco-avatar-image) {
    background-color: var(--color-bg-white);
  }
}
</style>
