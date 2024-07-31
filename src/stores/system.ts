import { defineStore } from 'pinia'
// 引入时间 dayjs 库
import dayjs from 'dayjs'
// 引入接口
import { type PageName } from "@/types"


export const useSystemStore = defineStore({
  id: 'system',
  state: () => ({
    isStartup: true,
    isWelcomeShow: true,
    currentPage: 'chat' as PageName,
    globalLoading: false,
    chatWindowLoading: false,
    aiDrawingLoading: false,
    knowledgeBaseWindowLoading: false,
    aiCalendarLoading: false,
    dayKey: dayjs().format('YYYYMMDD'),
    // 模态框是否可见
    settingModal: {
      defaultActiveKey: '',
      visible: false
    }
  }),
  getters: {
    isLoading(): boolean {
      return (
        this.globalLoading ||
        this.chatWindowLoading ||
        this.aiDrawingLoading ||
        this.knowledgeBaseWindowLoading ||
        this.aiCalendarLoading
      )
    }
  },
  actions: {
    isThisPage(pageName: PageName) {
      return this.currentPage === pageName
    },
    startDayKeyInterval() {
      // 刷新 dayKey，用于更具日期自动刷新组件
      setInterval(() => {
        this.dayKey = dayjs().format('YYYYMMDD')
      }, 1000)
    },
    // 打开模态框
    openSettingModal(defaultActiveKey = '') {
      if (
        this.globalLoading ||
        this.chatWindowLoading ||
        this.aiDrawingLoading ||
        this.knowledgeBaseWindowLoading ||
        this.aiCalendarLoading
      ) {
        return
      }
      this.settingModal.defaultActiveKey = defaultActiveKey
      this.settingModal.visible = true
    }
  },
  persist: false
})
