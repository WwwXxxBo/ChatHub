// 引入类型检查
import { type BaseMessage } from "@/types";
import { encodeChat } from "gpt-tokenizer";
// import { ChatMessage } from "gpt-tokenizer/src/GptEncoding";
import { type ChatMessage } from "gpt-tokenizer/GptEncoding"

// 获得输入 Token
export const getChatTokens = (messages: BaseMessage[]) => {
  return encodeChat(messages as ChatMessage[], "gpt-4-0314");
};
// 获得输入 Token 序列的长度
export const getChatTokensLength = (messages: BaseMessage[]) => {
  return getChatTokens(messages).length;
};
// 获得用户输入 Token 序列的长度
export const getContentTokensLength = (content: string) => {
  return getChatTokens([{ role: "user", content }]).length;
};
