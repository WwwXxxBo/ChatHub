import type { ChatMessage } from "@/types";
import { turnChat, limitContext } from "@/utils/base-util";
import { type CommonChatOption } from "@/utils/bigmodel";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

// 获取 AccessToken
const getAccessToken = async (
  apiKey: string | undefined,
  secretKey: string | undefined
) => {
  // 发送请求
  const tokenResp = await fetch(
    `/ernie/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  );
  const tokenRespJson = await tokenResp.json();
  return tokenRespJson.access_token;
};

export const chat2ernie = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    maxTokens,
    contextSize,
    apiKey,
    secretKey,
    abortCtr,
    messages,
    sessionId,
    startAnswer,
    appendAnswer,
    end,
  } = option;
  // 等待回答
  let waitAnswer = true;
  const accessToken = await getAccessToken(apiKey, secretKey);
  // 进行连接
  await fetchEventSource(`/ernie/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${accessToken}`, {
    openWhenHidden: true,
    signal: abortCtr?.signal,
    method: "POST",
    body: JSON.stringify({
      messages: await getErnieMessages(
        messages!,
        instruction,
        inputMaxTokens,
        contextSize
      ),
      stream: true,
      max_output_tokens: maxTokens,
    }),
    // 开启连接
    async onopen(response) {
      if (
        response.ok &&
        response.headers.get("content-type")?.includes(EventStreamContentType)
      ) {
        return;
      } else {
        const respText = await response.text();
        throw new Error(respText);
      }
    },
    // 接收消息
    onmessage: (message) => {
      try {
        const respJson = JSON.parse(message.data);
        if (waitAnswer) {
          waitAnswer = false;
          startAnswer && startAnswer(sessionId);
        }
        appendAnswer && appendAnswer(sessionId, respJson.result);
      } catch (e: any) {
        end && end(sessionId, message.data);
      }
    },
    // 关闭连接
    onclose: () => {
      end && end(sessionId);
    },
    // 连接错误
    onerror: (e: any) => {
      // 抛出异常防止重连
      if (e instanceof Error) {
        throw e;
      }
    },
  });
};

// 获取消息列表
export const getErnieMessages = async (
  chatMessageList: ChatMessage[],
  instruction: string,
  inputMaxTokens: number | undefined,
  contextSize: number
) => {
  // 增加指令 ERNIE 模型不支持 System 角色，因此需要对最后一条消息进行处理
  if (instruction.trim().length > 0) {
    chatMessageList.at(-1)!.content = `${instruction}\n${
      chatMessageList.at(-1)!.content
    }`;
  }
  // 消息格式转换
  let messages = await turnChat(chatMessageList);
  // 截取指定长度的上下文
  messages = limitContext(inputMaxTokens, contextSize, messages);
  // 消息的开头不能是 assistant
  if (messages[0].role === "assistant") {
    messages.shift();
  }
  return messages;
};
