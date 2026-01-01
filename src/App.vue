<script setup lang="ts">
import { computed, toRefs, reactive, onMounted, watch } from "vue";
// 引入接口
import { type PageName } from "@/types"
// 引入页面组件
import Welcome from "@/components/Welcome/Welcome.vue";
import Chat from "@/components/Chat/Chat.vue";
import SystemChat from "@/components/SystemChat/SystemChat.vue";
import Setting from "@/components/Modal/Setting.vue"
import Collect from "@/components/Collect/Collect.vue"
import Login from "@//components/Login/Login.vue"
// 引入国际化组件
import { useI18n } from "vue-i18n";
import enUS from "@arco-design/web-vue/es/locale/lang/en-us";
import zhCN from "@arco-design/web-vue/es/locale/lang/zh-cn";
// 引入 System、Setting、User 状态
import { useSystemStore } from '@/stores/system'
import { useSettingStore } from "@/stores/setting";
import { useUserStore } from "@/stores/user"
// 引入 Theme 相关工具方法
import { startDarkThemeListener, setCustomTheme, setDefaultTheme, changeTheme } from '@/utils/theme-util'

const userStore = useUserStore();
const systemStore = useSystemStore()
const settingStore = useSettingStore();
const { locale, t } = useI18n();

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
    <!-- 登录页与欢迎页 -->
    <Login v-if="!userStore.isLogin" />
    <Welcome v-if="systemStore.isWelcomeShow" />

    <div class="app fade-in-from" :class="{ 'fade-in-to': !systemStore.isWelcomeShow }">
      <!-- 侧边栏 -->
      <div class="app-sidebar drag-area">
        <div class="siderbar-container">
          <!-- 对话 -->
          <div class="app-sidebar-item no-drag-area" @click="changePage('chat')">
            <icon-robot class="app-sidebar-item-icon" />
            <span class="app-sidebar-item-text">{{ $t("index.chat") }}</span>
          </div>

          <!-- 收藏 -->
          <div class="app-sidebar-item no-drag-area" @click="changePage('collect')">
            <icon-star class="app-sidebar-item-icon" />
            <span class="app-sidebar-item-text">{{ $t("index.note") }}</span>
          </div>
          <!-- 设置 -->
          <div class="app-sidebar-item no-drag-area">
            <Setting>
              <template #default>
                <icon-settings class="app-sidebar-item-icon" />
              </template>
            </Setting>
            <span class="app-sidebar-item-text">{{ $t("index.setting") }}</span>
          </div>
        </div>
      </div>

      <!-- 多页面 -->
      <div v-if="alivePages.includes('chat')" v-show="systemStore.isThisPage('chat')" class="app-body">
        <Chat />
      </div>
      <!-- 系统聊天页 -->
      <div v-if="alivePages.includes('chat-assistant')" v-show="systemStore.isThisPage('chat-assistant')"
        class="app-body">
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
  background: linear-gradient(315deg, #856cff 0.000%, #856cff 10.000%, #8568ff calc(10.000% + 1px), #8568ff 20.000%, #846eff calc(20.000% + 1px), #846eff 30.000%, #847aff calc(30.000% + 1px), #847aff 40.000%, #8487ff calc(40.000% + 1px), #8487ff 50.000%, #838fff calc(50.000% + 1px), #838fff 60.000%, #8390ff calc(60.000% + 1px), #8390ff 70.000%, #8387ff calc(70.000% + 1px), #8387ff 80.000%, #827aff calc(80.000% + 1px), #827aff 90.000%, #826eff calc(90.000% + 1px) 100.000%);

  .app-sidebar {
    flex-shrink: 0;
    width: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 10px 6px;

    .app-sidebar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      justify-content: center;
      cursor: pointer;
      padding: 12px 8px;
    }

    .app-sidebar-item-icon {
      font-size: var(--font-size-xxxl);
      stroke-width: 3;
      margin-bottom: 4px;
    }

    .app-sidebar-item-text {
      font-size: var(--font-size-sm);
      font-weight: 600;
      white-space: nowrap;
    }

    .app-sidebar-item-active {
      position: relative;

      .app-sidebar-item-icon {
        stroke-width: 4;
        font-size: 20px;
        color: orange;
        color: var(--color-bg-1) !important;
      }

      &:after {
        display: inline-block;
        content: "";
        height: 26px;
        width: 10px;
        background-color: var(--color-bg-1);
        // background-color: rgb(var(--primary-5));
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
