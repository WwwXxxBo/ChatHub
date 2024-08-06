// 引入通用类型检查
import type { ChatMessage } from "@/types";
// 引入接口
import { turnChat, limitContext } from "@/utils/base-util";
// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";
// 引入加密库
import CryptoJS from "crypto-js";

// 星火大模型文档：https://www.xfyun.cn/doc/spark/

// 获取星火大模型服务地址
const getSparkHostURL = (model: string) => {
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
  return `${url.toString()}?authorization=${authorization}&date=${date}&host=${host}`;
};


