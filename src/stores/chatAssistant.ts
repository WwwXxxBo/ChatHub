// 对话状态
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
import { type Assistant, type ChatMessage } from "@/types";

export const useChatAssistantStore = defineStore({
  id: "chatAssistant",
  state: () => ({
    chatAssistantList: [
      {
        ...copyObj(defaultAssistant),
        name: "Chat Assistant",
        // ID 值
        id: randomUUID(),
        // 创建时间
        createTime: nowTimestamp(),
        // 最后更新时间
        lastUpdateTime: nowTimestamp(),
        // 对话消息列表
        chatMessageList: new Array<ChatMessage>(),
      },
    ] as Assistant[],
    // 当前 Chat Assistant 的 ID 值
    currentChatAssistantId: null as null | string,
  }),
  getters: {
    getCurrentChatAssistant(): Assistant {
      return (
        this.chatAssistantList.find((a) => a.id === this.currentChatAssistantId) ??
        ({} as Assistant)
      )
    },
    getStoreJson(): string {
      return JSON.stringify({
        chatAssistantList: this.chatAssistantList,
        currentChatAssistantId: this.currentChatAssistantId,
      })
    }
  },
  actions: {
    setStoreFromJson(json: string) {
      let importFlag = false;
      if (!json) {
        return importFlag;
      }
      const assistantBackup = JSON.parse(json);
      if (assistantBackup.chatAssistantList !== undefined) {
        this.chatAssistantList = assistantBackup.chatAssistantList;
        importFlag = true;
      }
      if (assistantBackup.currentChatAssistantId !== undefined) {
        this.currentChatAssistantId = assistantBackup.currentChatAssistantId;
        importFlag = true;
      }
      return importFlag;
    },
    updateChatAssistantList(newAssistantList: Assistant[]) {
      this.chatAssistantList = newAssistantList;
    },
  },
  persist: false,
});
