// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";
// 引入 OpenAI 库
import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// 基地址
const baseURL = "https://open.bigmodel.cn/api/paas/v4/";

export const chat2zhipu = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    contextSize,
    apiKey,
    maxTokens,
    messages,
    sessionId,
    chatPlugins,
    abortCtr,
    startAnswer,
    appendAnswer,
    end,
  } = option;
  // 创建 OpenAI 实例
  const openai = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });

  // 现有消息列表
  const chatMessages = (await getZhipuMessages(
    messages!,
    instruction,
    inputMaxTokens,
    contextSize
  )) as ChatCompletionMessageParam[];
};
