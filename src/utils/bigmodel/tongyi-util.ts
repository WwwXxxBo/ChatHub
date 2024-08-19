import { type ChatMessage } from "@/types";
import { type CommonChatOption } from "@/utils/bigmodel";
import { turnChat, limitContext } from "@/utils/base-util";
import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";
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
  let waitAnswer = true;
  // 设置请求头
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  // 请求参数
  const data = {
    model: model,
    messages: await getTongyiMessages(
      messages!,
      instruction,
      inputMaxTokens,
      contextSize
    ),
  };
  try {
    // 发起请求
    const response = await fetch('/api/compatible-mode/v1/chat/completions', {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
      signal: abortCtr?.signal,
    });

    // 创建一个 eadableStream 的读取器
    const reader = response.body!.getReader();
    // 读取数据并处理
    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      // 如果读取完成，中止ReadableStream
      isDone = done;
      if (done) {
        break;
      }
      // 处理接收到的数据
      const jsonData = new TextDecoder("utf-8").decode(value);
      // 按照换行分行
      const lines = jsonData.split("\n");
      // 遍历每一行
      for (const line of lines) {
        if (line) {
          const jsonData = JSON.parse(line);
          // 正确返回
          if (waitAnswer) {
            waitAnswer = false;
            startAnswer && startAnswer(sessionId);
          }
          appendAnswer && appendAnswer(sessionId, jsonData.choices[0].message.content ?? "")
        }
      }
    }
    end && end(sessionId)
  } catch (error: any) {
    end && end(sessionId, error?.message);
  }
};
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
  return messages;
};
