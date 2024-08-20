// 本地模型调用
import type { ChatMessage } from "@/types";
import { turnChat, limitContext } from "@/utils/base-util";
import { type CommonChatOption } from "@/utils/bigmodel";

export const chat2ollama = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    contextSize,
    baseURL,
    messages,
    sessionId,
    abortCtr,
    startAnswer,
    appendAnswer,
    end,
  } = option;
  // 等待回答
  let waitAnswer = true;
  try {
    // 发起请求并获取响应
    const response = await fetch(`${baseURL}/api/chat`, {
      signal: abortCtr?.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: await getOllamaMessages(
          messages!,
          instruction,
          inputMaxTokens,
          contextSize
        ),
      }),
    });
    // 创建一个ReadableStream的读取器
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
          if (jsonData.error) {
            end && end(sessionId, jsonData.error);
            return;
          }
          // 正确返回
          if (waitAnswer) {
            waitAnswer = false;
            startAnswer && startAnswer(sessionId);
          }
          appendAnswer && appendAnswer(sessionId, jsonData.message.content);
        }
      }
    }

    end && end(sessionId);
  } catch (error: any) {
    end && end(sessionId, error?.message);
  }
};

export const getOllamaMessages = async (
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
  // 暂时不处理图片
  return messages;
};
