// 引入基础类型检查
import { type ChatMessage } from "@/types"
// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";
// 引入接口
import { turnChat, limitContext } from "@/utils/base-util"

// 豆包API基础URL
const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

// 豆包消息内容类型
interface DoubaoContentItem {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

// 豆包消息类型
interface DoubaoMessage {
  role: "user" | "assistant" | "system";
  content: string | DoubaoContentItem[];
}

export const chat2doubao = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    contextSize,
    apiKey,
    maxTokens,
    messages,
    sessionId,
    abortCtr,
    startAnswer,
    appendAnswer,
    end,
    onError,
  } = option;

  try {
    // 获取豆包格式的消息
    const doubaoMessages = await getDoubaoMessages(
      messages!,
      instruction,
      inputMaxTokens,
      contextSize
    );

    // 构建请求体
    const requestBody = {
      model: model || "doubao-seed-1-8-251228",
      messages: doubaoMessages,
      stream: true,
      max_tokens: maxTokens,
    };

    // 发送流式请求
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: abortCtr?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`豆包API请求失败: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error("响应体为空");
    }

    // 开始回答
    startAnswer && startAnswer(sessionId);

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // 按行分割处理SSE格式数据
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留未完成的最后一行

        for (const line of lines) {
          if (line.trim() === "") continue;
          
          // SSE格式: data: {...}
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // 去掉 "data: "
            
            if (data.trim() === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // 提取回答内容
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                appendAnswer && appendAnswer(sessionId, content);
              }
            } catch (e) {
              console.warn("解析流式响应数据失败:", e, "数据:", data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // 结束
    end && end(sessionId);

  } catch (error) {
    console.error("豆包API调用错误:", error);
    onError && onError(error instanceof Error ? error.message : String(error));
    end && end(sessionId);
  }
};

export const getDoubaoMessages = async (
  chatMessageList: ChatMessage[],
  instruction: string,
  inputMaxTokens: number | undefined,
  contextSize: number
): Promise<DoubaoMessage[]> => {
  // 消息格式转换
  let messages = await turnChat(chatMessageList);
  
  // 截取制定长度的上下文
  messages = limitContext(inputMaxTokens, contextSize, messages);
  
  // 转换消息结构为豆包格式
  const doubaoMessages: DoubaoMessage[] = [];
  
  // 添加系统指令
  if (instruction && instruction.trim().length > 0) {
    doubaoMessages.push({
      role: "system",
      content: instruction.trim()
    });
  }

  // 转换用户和助手消息
  for (const m of messages) {
    // 处理用户消息（支持图片）
    if (m.role === "user") {
      const contentItems: DoubaoContentItem[] = [];
      
      // 添加文本内容
      if (m.content && m.content.trim().length > 0) {
        contentItems.push({
          type: "text",
          text: m.content
        });
      }
      
      // 添加图片内容
      if (m.image) {
        // 确保图片URL是字符串
        const imageUrl = typeof m.image === 'string' ? m.image : m.image.toString();
        contentItems.push({
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${imageUrl}`
          }
        });
      }
      
      doubaoMessages.push({
        role: "user",
        content: contentItems
      });
    } 
    // 处理助手消息
    else if (m.role === "assistant") {
      doubaoMessages.push({
        role: "assistant",
        content: m.content || ""
      });
    }
  }
  
  return doubaoMessages;
};

// 可选：非流式调用版本
export const chat2doubaoNonStream = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    contextSize,
    apiKey,
    maxTokens,
    messages,
  } = option;

  // 获取豆包格式的消息
  const doubaoMessages = await getDoubaoMessages(
    messages!,
    instruction,
    inputMaxTokens,
    contextSize
  );

  // 构建请求体
  const requestBody = {
    model: model || "doubao-seed-1-8-251228",
    messages: doubaoMessages,
    stream: false,
    max_tokens: maxTokens,
  };

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`豆包API请求失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  
  throw new Error("未获取到有效响应");
};