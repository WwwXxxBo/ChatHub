import { type ChatMessage } from "@/types";
import { type CommonChatOption } from "@/utils/bigmodel";
import { turnChat, limitContext } from "@/utils/base-util";
import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const chat2openai = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    contextSize,
    apiKey,
    baseURL,
    maxTokens,
    messages,
    sessionId,
    chatPlugins,
    abortCtr,
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

  // 暂时忽略插件

  // 获取消息列表
  const chatMessages = (await getOpenAIMessages(
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
  //   开始回答
  startAnswer && startAnswer(sessionId);
  // 连续回答
  for await (const chunk of stream) {
    appendAnswer &&
      appendAnswer(sessionId, chunk.choices[0].delta.content ?? "");
  }
  //   结束
  end && end(sessionId);
};

// 获取 OpenAI 消息列表
const getOpenAIMessages = async (
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
  //   消息结果转换
  const openaiMessages: ChatCompletionMessageParam[] = [];
  for (const m of messages) {
    // 暂时不处理图片

    // 向消息列表加入消息
    openaiMessages.push({
      role: m.role,
      content: m.content,
    } as ChatCompletionMessageParam);
  }
  return openaiMessages;
};
