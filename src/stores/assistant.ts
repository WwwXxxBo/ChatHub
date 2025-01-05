// 系统操作助手状态
import { defineStore } from "pinia";
// 引入国际化组件
import i18n from "@/i18n";
// 引入随机生成 ID 值工具方法
import { randomUUID } from "@/utils/id-util";
// 引入复制对象方法
import { copyObj } from "@/utils/object-util";
// 引入默认对话模型
import { defaultAssistant } from "@/utils/base-util";
// 引入获取时间方法
import { nowTimestamp } from "@/utils/date-util";
// 引入接口
import { type Assistant, type SystemChatMessage } from "@/types"

export const useAssistantStore = defineStore({
  id: "assistant",
  state: () => ({
    virtualAssistantList: [
      {
        ...copyObj(defaultAssistant),
        name: "System Assistant",
        // ID 值
        id: randomUUID(),
        // 创建时间
        createTime: nowTimestamp(),
        // 最后更新时间
        lastUpdateTime: nowTimestamp(),
        // 对话消息列表
        // chatMessageList: new Array<ChatMessage>(),
        // 测试消息
        chatMessageList: new Array<SystemChatMessage>()
      },
    ] as Assistant[],
    // 当前 Assistant 的 ID 值
    currentVirtualAssistantId: null as null | string,
  }),
  getters: {
    getCurrentVirtualAssistant(): Assistant {
      return (
        this.virtualAssistantList.find((a) => a.id === this.currentVirtualAssistantId) ??
        ({} as Assistant)
      )
    },
    getStoreJson(): string {
      return JSON.stringify({
        virtualAssistantList: this.virtualAssistantList,
        currentVirtualAssistantId: this.currentVirtualAssistantId
      })
    }
  },
  actions: {
    setStoreFromJson(json: string) {
      let importFlag = false
      if (!json) {
        return importFlag
      }
      const assistantBackup = JSON.parse(json)
      if (assistantBackup.virtualAssistantList !== undefined) {
        this.virtualAssistantList = assistantBackup.virtualAssistantList
        importFlag = true
      }
      if (assistantBackup.currentVirtualAssistantId !== undefined) {
        this.currentVirtualAssistantId = assistantBackup.currentVirtualAssistantId
        importFlag = true
      }
      return importFlag
    },
    updateVirtualAssistantList(newVirtualAssistantList: Assistant[]) {
      this.virtualAssistantList = newVirtualAssistantList;
    },
  },
  persist: false
});
