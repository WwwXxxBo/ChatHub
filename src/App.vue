<script setup lang="ts">
import { computed, toRefs, reactive, onMounted, watch } from "vue";
// 引入接口
import { type PageName } from "@/types"
// 引入页面组件
import Welcome from "@/components/Welcome/Welcome.vue";
import Chat from "@/components/Chat/Chat.vue";
import SystemChat from "@/components/SystemChat/SystemChat.vue";
import UserAvatar from "@/components/Avatar/UserAvatar.vue";
import Setting from "@/components/Modal/Setting.vue"
import Collect from "@/components/Collect/Collect.vue"
// 引入国际化组件
import { useI18n } from "vue-i18n";
import enUS from "@arco-design/web-vue/es/locale/lang/en-us";
import zhCN from "@arco-design/web-vue/es/locale/lang/zh-cn";
// 引入 System 状态
import { useSystemStore } from '@/stores/system'
// 引入 Setting 状态
import { useSettingStore } from "@/stores/setting";
// 引入 Theme 相关工具方法
import { startDarkThemeListener, setCustomTheme, setDefaultTheme, changeTheme } from '@/utils/theme-util'



const systemStore = useSystemStore()
const settingStore = useSettingStore();


const { locale } = useI18n();



const data = reactive({
  sidebarConfig: [
    {
      name: "chat",
      icon: "IconMessage",
    },
    {
      name: "chat-assistant",
      icon: "IconCommand",
    },
    {
      name: "collect",
      icon: "IconStar",
    }
  ] as { name: PageName; icon: string }[],
  alivePages: ["chat"] as PageName[],
});

const { sidebarConfig, alivePages } = toRefs(data);


// 页面切换
const changePage = (page: PageName) => {
  if (systemStore.chatWindowLoading) {
    return
  }
  if (!data.alivePages.includes(page)) {
    data.alivePages.push(page)
  }
  systemStore.currentPage = page
}


// 主题设置监听
let stopDarkThemeListener: any = null
watch(
  () => settingStore.app.themeModel,
  () => {
    updateTheme()
  }
)
// 更新主题
const updateTheme = () => {
  if (stopDarkThemeListener) {
    stopDarkThemeListener()
  }
  // 自定义样式
  if (settingStore.app.themeModel === 3) {
    setCustomTheme(settingStore.app.customThemeMap)
  } else {
    setDefaultTheme()
  }
  // 跟随系统
  if (settingStore.app.themeModel === 0) {
    stopDarkThemeListener = startDarkThemeListener()
  } else {
    // 切换样式
    changeTheme(settingStore.app.themeModel === 2)
  }
}

// ArcoDesign 语言选项
const arcoDesignLocales = {
  zh_CN: zhCN,
  en_US: enUS
}
// ArcoDesign 语言
const arcoDesignLocal = computed(() => {
  return arcoDesignLocales[settingStore.app.locale];
});
// 语言设置监听
watch(
  () => settingStore.app.locale,
  (lang) => {
    locale.value = lang
  }
)

onMounted(() => {
  // 更新主题
  updateTheme();
  // 设置语言
  locale.value = settingStore.app.locale
})
</script>

<template>
  <a-config-provider :locale="arcoDesignLocal">
    <!-- 欢迎页 -->
    <Welcome v-if="systemStore.isWelcomeShow" />
    <div class="app fade-in-from" :class="{ 'fade-in-to': !systemStore.isWelcomeShow }">
      <!-- 侧边栏 -->
      <div class="app-sidebar drag-area">
        <div :class="{ 'app-sidebar-avatar-macos': false }">
          <!-- 用户信息编辑 -->
          <UserAvatar :editable="true" :size="36" />
        </div>
        <div
          v-for="c in sidebarConfig"
          :key="c.name"
          class="app-sidebar-item no-drag-area"
          :class="{'app-sidebar-item-active': systemStore.isThisPage(c.name)}"
          @click="changePage(c.name)"
        >
          <component :is="c.icon" class="app-sidebar-item-icon" />
        </div>

        <!-- 设置 -->
        <div class="app-sidebar-item no-drag-area">
          <Setting>
            <template #default>
              <icon-settings class="app-sidebar-item-icon" />
            </template>
          </Setting>
        </div>

      </div>
      <!-- 多页面 -->
      <div v-if="alivePages.includes('chat')" v-show="systemStore.isThisPage('chat')" class="app-body">
        <Chat />
      </div>
      <!-- 系统聊天页 -->
      <div v-if="alivePages.includes('chat-assistant')" v-show="systemStore.isThisPage('chat-assistant')" class="app-body">
        <SystemChat />
      </div>
      <!-- 收藏页 -->
      <div v-if="alivePages.includes('collect')" v-show="systemStore.isThisPage('collect')" class="app-body">
        <Collect />
      </div>
      <!-- 全局加载遮罩 -->
      <div v-if="false" class="global-loading z-index-max">
        <a-spin :size="26" />
      </div>
    </div>
  </a-config-provider>
</template>

<style lang="less">
@import "@/assets/css/styles.less";
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  // 设置渐变背景
  background-color:hsla(221,94%,51%,1);
  background-image:
  radial-gradient(at 12% 50%, hsla(10,21%,87%,0.87) 0px, transparent 50%),
  radial-gradient(at 65% 9%, hsla(12,80%,86%,1) 0px, transparent 50%),
  radial-gradient(at 86% 74%, hsla(12,28%,83%,1) 0px, transparent 50%);

  color: var(--color-text-1);
  font-size: var(--font-size-default);

  .app-sidebar {
    flex-shrink: 0;
    width: 65px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;

    .app-sidebar-avatar-macos {
      margin: 30px 0 15px 0;
    }

    .app-sidebar-item {
      padding: 13px 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .app-sidebar-item-icon {
        font-size: 26px;
        stroke-width: 3;
        color: var(--color-bg-1);
        border-radius: 50%;
        transition: all 100ms linear;
      }

      &:active {
        .app-sidebar-item-icon {
          color: var(--color-text-2);
        }
      }
    }

    .app-sidebar-item-active {
      position: relative;

      .app-sidebar-item-icon {
        stroke-width: 4;
        color: rgb(var(--primary-6)) !important;
      }

      &:after {
        display: inline-block;
        content: "";
        height: 26px;
        width: 10px;
        background-color: rgb(var(--primary-5));
        position: absolute;
        top: 13px;
        left: -5px;
        border-radius: 0 5px 5px 0;
      }
    }
  }

  .app-body {
    flex-grow: 1;
    display: flex;
    overflow: hidden;
  }

  .global-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>
