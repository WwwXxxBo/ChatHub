import { receiveSystemChatMessage } from "@/api/systemChat";
import { type SystemChatOption } from "@/utils/systemchat";
import { type SystemChatMessage, type BaseMessage } from "@/types";

export const chat2system = async (option: SystemChatOption) => {
  const { sessionId, assistantId, messages, createTime, startAnswer, appendAnswer, end, abortCtr } =
    option;
  // 开始回答
  startAnswer && startAnswer(sessionId);
  const chatMessagesList = await getSystemChatMessages(messages as SystemChatMessage[])
  const data = await receiveSystemChatMessage(9, chatMessagesList[0].content)
  appendAnswer && appendAnswer(sessionId, data?.data ?? "");
  // 结束
  end && end(sessionId);
};

export const getSystemChatMessages = async (
  chatMessageList: SystemChatMessage[]
) => {
  const messages: BaseMessage[] = [];
  let currentRole = "user" as "user" | "assistant";
  for (let i = chatMessageList.length - 1; i >= 0; i--) {
    const chatMessage = chatMessageList[i];
    if (currentRole === chatMessage.role) {
      messages.unshift({
        role: chatMessage.role,
        content: chatMessage.content,
      });
      currentRole = currentRole === "user" ? "assistant" : "user";
    }
  }
  return messages;
};
