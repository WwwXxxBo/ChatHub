// 引入接口
import { type ChatPlugin, type ChatMessage, type BigModelProvider } from "@/types"
// 引入各类大模型
import { chat2moonshot } from "@/utils/bigmodel/moonshot-util"
import { chat2zhipu } from "@/utils/bigmodel/zhipu-util"
import { chat2tiangong } from "@/utils/bigmodel/tiangong-util"
import { chat2baichuan } from "@/utils/bigmodel/baichuan-util"
import { chat2deepSeek } from "@/utils/bigmodel/deepseek-util"
import { char2stepfun } from "@/utils/bigmodel/stepfun-util"
import { chat2openai } from "@/utils/bigmodel/openai-util"
import { chat2spark } from "@/utils/bigmodel/spark-util"
import { chat2tongyi } from "@/utils/bigmodel/tongyi-util"

// 目前支持 Kimi、智谱AI、天工、百川、DeepSeek、阶跃星辰
type ChatFunctionMap = {
  [provider in BigModelProvider]: (option: CommonChatOption) => Promise<any>
}

const chatFunctionMap = {
  MoonshotAI: chat2moonshot,
  ZhipuAI: chat2zhipu,
  Tiangong: chat2tiangong,
  BaiChuan: chat2baichuan,
  DeepSeek: chat2deepSeek, // 目前存在问题
  StepFun: char2stepfun,
  OpenAI: chat2openai,
  Spark: chat2spark,
  Tongyi: chat2tongyi //目前存在跨域问题
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
