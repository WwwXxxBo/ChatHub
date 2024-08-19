import { type ChatMessage } from "@/types";
import { type CommonChatOption } from "@/utils/bigmodel";
import { turnChat, limitContext } from "@/utils/base-util";
import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// 接口地址
const baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

export const chat2tongyi = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    maxTokens,
    contextSize,
    apiKey,
    abortCtr,
    messages,
    sessionId,
    chatPlugins,
    startAnswer,
    appendAnswer,
    end,
  } = option;
  // OpenAI 实例
  const openai = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
  // 获取现有消息列表
  const chatMessages = (await getTongyiMessages(
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
  //   持续回答
  for await (const chunk of stream) {
    appendAnswer &&
      appendAnswer(sessionId, chunk.choices[0].delta.content ?? "");
  }
  // 结束
  end && end(sessionId);
};

// 获取消息列表
export const getTongyiMessages = async (
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
