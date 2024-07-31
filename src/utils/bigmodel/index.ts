// 引入接口
import { type ChatPlugin, type ChatMessage, type BigModelProvider } from "@/types"
// 引入各类大模型
import { chat2deepSeek } from "@/utils/bigmodel/deep-seek-util"
import { chat2ernie } from '@/utils/bigmodel/ernie-bot-util'
import { chat2moonshot } from "@/utils/bigmodel/moonshot-util"

// 因为目前只打算支持 Kimi 因此这里先不进行类型检查
type ChatFunctionMap = {
  [provider in BigModelProvider]: (option: CommonChatOption) => Promise<any>
}

const chatFunctionMap = {
  MoonshotAI: chat2moonshot
}


// 与大模型聊天
export const chat2bigModel = async (provider: keyof ChatFunctionMap, option: CommonChatOption) => {
  const chatFunction = chatFunctionMap[provider]
  if (chatFunction) {
    return chatFunction(option)
  } else {
    throw new Error(`Unsupported provider: ${provider}`)
  }
}

// 大模型通用配置
export interface CommonChatOption {
  appId?: string;
  secretKey?: string;
  apiKey?: string;
  baseURL?: string;
  model: string;
  instruction: string;
  inputMaxTokens?: number;
  contextSize: number;
  maxTokens?: number;
  messages?: ChatMessage[];
  abortCtr?: AbortController;
  sessionId: string;
  chatPlugins?: ChatPlugin[];
  startAnswer?: (sessionId: string, content?: string) => void;
  appendAnswer?: (sessionId: string, content: string) => void;
  end?: (sessionId: string, err?: any) => void;
}
