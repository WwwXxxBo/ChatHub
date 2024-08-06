// 引入通用类型检查
import type { ChatMessage } from "@/types";
// 引入接口
import { turnChat, limitContext } from "@/utils/base-util";
// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";
// 引入 OpenAI 库
import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// 阶跃星辰官网: https://platform.stepfun.com/
// 基地址
const baseURL = "https://api.stepfun.com/v1";

export const char2stepfun = async (option: CommonChatOption) => {
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
  // 获取现有消息列表
  const chatMessages = (await getStepfunMessages(
    messages!,
    instruction,
    inputMaxTokens,
    contextSize
  )) as ChatCompletionMessageParam[];
  // 流式对话
  const stream = await openai.chat.completions.create(
    {
      messages: chatMessages,
      model,
      stream: true,
      max_tokens: maxTokens,
    },
    {
      signal: abortCtr?.signal,
    }
  );
  // 开始回答
  startAnswer && startAnswer(sessionId);
  // 连续回答
  for await (const chunk of stream) {
    appendAnswer &&
      appendAnswer(sessionId, chunk.choices[0].delta.content ?? "");
  }
  // 结束
  end && end(sessionId);
};

export const getStepfunMessages = async (
  chatMessageList: ChatMessage[],
  instruction: string,
  inputMaxTokens: number | undefined,
  contextSize: number
) => {
  // 消息格式转换
  let messages = await turnChat(chatMessageList);
  // 截取指定长度的上下文
  messages = limitContext(inputMaxTokens, contextSize, messages);
  // 增加指令
  if (instruction.trim().length > 0) {
    messages.unshift({
      role: "system",
      content: instruction,
    });
  }
  // 转换消息结构
  const openaiMessages: ChatCompletionMessageParam[] = [];
  for (const m of messages) {
    openaiMessages.push({
      role: m.role,
      content: m.content,
    } as ChatCompletionMessageParam);
  }
  return openaiMessages;
};
