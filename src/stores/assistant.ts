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
        chatMessageList: [{
          role: "user",
          name: "测试",
          content: "测试开始",
          id: "1",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "2",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "3",
          createTime: 1111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "4",
          createTime: 11111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "5",
          createTime: 1111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "6",
          createTime: 11111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "7",
          createTime: 1111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "8",
          createTime: 11111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "9",
          createTime: 1111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "10",
          createTime: 11111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "11",
          createTime: 1111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "12",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "13",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "14",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "15",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "16",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "17",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "18",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "19",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？",
          id: "20",
          createTime: 1111111
        },
        {
          role: "user",
          name: "测试",
          content: "测试",
          id: "21",
          createTime: 111111
        },
        {
          role: "assistant",
          name: "你好",
          content: "你好，请问有什么可以帮助您的吗？最后",
          id: "22",
          createTime: 1111111
        },
      ] as SystemChatMessage[]
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
    }
  },
  persist: false
});
