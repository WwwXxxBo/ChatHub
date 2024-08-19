import { type BaseMessage, type ChatMessage } from "@/types";
import { turnChat, limitContext } from "@/utils/base-util";
import { type CommonChatOption } from "@/utils/bigmodel";
import { Message } from '@arco-design/web-vue';
// 引入加密库
import CryptoJS from "crypto-js";

// 星火大模型文档：https://www.xfyun.cn/doc/spark/

// 获取星火大模型服务地址
const getSparkHostUrl = (model: string) => {
  let hostURL = "";
  switch (model) {
    case "Spark Lite":
      hostURL = "wss://spark-api.xf-yun.com/v1.1/chat";
      break;
    case "Spark V2.0":
      hostURL = "wss://spark-api.xf-yun.com/v2.1/chat";
      break;
    case "Spark Pro":
      hostURL = "wss://spark-api.xf-yun.com/v3.1/chat";
      break;
    case "Spark Pro-128K":
      hostURL = "wss://spark-api.xf-yun.com/chat/pro-128k";
      break;
    case "Spark Max":
      hostURL = "wss://spark-api.xf-yun.com/v3.5/chat";
      break;
    case "Spark4.0 Ultra":
      hostURL = "wss://spark-api.xf-yun.com/v4.0/chat";
      break;
  }
  return hostURL;
};

// 返回 parameter.chat 部分的 domain 参数（每个模型的 domain 参数不一样）
const getDomain = (model: string) => {
  // [general,generalv2,generalv3,pro-128k,generalv3.5,4.0Ultra]
  let domain = "general";
  switch (model) {
    case "Spark Lite":
      domain = "general";
      break;
    case "Spark V2.0":
      domain = "generalv2";
      break;
    case "Spark Pro":
      domain = "generalv3";
      break;
    case "Spark Pro-128K":
      domain = "pro-128k";
      break;
    case "Spark Max":
      domain = "generalv3.5";
      break;
    case "Spark4.0 Ultra":
      domain = "4.0Ultra";
      break;
  }
  return domain;
};

// 获取ws请求地址
const getAuthUrl = (
  hostUrl: string,
  method: string,
  apiKey: string,
  apiSecret: string
) => {
  const url = new URL(hostUrl);
  const host = url.host;
  const path = url.pathname;
  const date = (new Date() as any).toGMTString();
  const algorithm = "hmac-sha256";
  const headers = "host date request-line";
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${method} ${path} HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  const authorUrlParams = {
    "authorization": authorization, 
    "date": date, 
    "host": "spark-api.xf-yun.com"
  }
  const authorUrl = new URLSearchParams(authorUrlParams).toString()
  console.log(`${url.toString()}?` + authorUrl)
  return `${url.toString()}?${authorUrl}`;
};

// 获取对话请求参数
const getSparkRequestParam = (
  appId: string,
  model: string,
  maxTokens: number | undefined,
  messageList: BaseMessage[]
) => {
  return JSON.stringify({
    header: {
      app_id: appId,
      uid: "12345",
    },
    parameter: {
      chat: {
        domain: getDomain(model),
        temperature: 0.5,
        max_tokens: maxTokens ?? 4096,
      },
    },
    payload: {
      message: {
        text: messageList,
      },
    },
  });
};

export const chat2spark = async (option: CommonChatOption) => {
  const {
    model,
    instruction,
    inputMaxTokens,
    maxTokens,
    contextSize,
    appId,
    apiKey,
    secretKey,
    messages,
    sessionId,
    startAnswer,
    appendAnswer,
    end,
  } = option;

  // 获取模型服务地址
  const modelUrl = getSparkHostUrl(model);
  if (modelUrl === "") {
    end && end(sessionId, `Unsupported model: ${model}`);
    return;
  }
  // 等待回答
  let waitAnswer = true;
  // Websocket 实例
  const sparkClient = new WebSocket(
    getAuthUrl(modelUrl, "GET", apiKey!, secretKey!)
  );
  // 连接成功
  sparkClient.onopen = async () => {
    // 连接成功，发送消息
    sparkClient.send(
      getSparkRequestParam(
        appId!, 
        model, 
        maxTokens, 
        await getSparkMessages(messages!, instruction, inputMaxTokens, contextSize)
      )
    )
  }
  // 接收消息
  sparkClient.onmessage = (message) => {
    try{
      const respJson = JSON.parse(message.data.toString())
      if(respJson.header.code === 11200){
        Message.warning('该appId没有相关功能的授权 或者 业务量超过限制')
      }
      const answerContent = respJson.payload.choices.text[0].content
      if(waitAnswer){
        waitAnswer = false
        startAnswer && startAnswer(sessionId)
      }
      appendAnswer && appendAnswer(sessionId, answerContent)
    }catch (e: any){
      end && end(sessionId, message.data)
      return
    }
  }
  // 连接关闭
  sparkClient.onclose = () => {
    end && end(sessionId)
  }
  // 连接错误
  sparkClient.onerror = (e) => {
    end && end(sessionId, 'chat2spark websocket connect error')
  }
};
export const getSparkMessages = async (
  chatMessageList: ChatMessage[],
  instruction: string,
  inputMaxTokens: number | undefined,
  contextSize: number
) => {
  // 消息格式转换
  let messages = await turnChat(chatMessageList);
  // 截取指定长度的上下文
  messages = limitContext(inputMaxTokens, contextSize, messages)
  // 增加指令
  if(instruction.trim().length > 0){
    messages.unshift({
      role: 'system',
      content: instruction
    })
  }
  // 转换消息结构
  let sparkMessages: any[] = []
  for(const m of messages){
    // 暂时不处理用户上传的图片
    sparkMessages.push({
      role: m.role,
      content: m.content
    })
  }
  return sparkMessages
};
