import { httpInstance } from "@/utils/http-util";
import { type BaseMessage } from "@/types";

/**
 * 接收后端传递的数据
 * id:对话 ID 值
 * assistant_id:助手 ID 值
 * messages:对话列表
 *
 * */
export const receiveSystemChatMessage = (
  id: string,
  assistant_id: string,
  messages: BaseMessage[],
  createTime: number
) => {
  return httpInstance({
    url: "/systemchat",
    method: "GET",
    data: JSON.stringify({
      id: id,
      assistant_id: assistant_id,
      name: "system chat",
      content: messages,
      createTime: createTime,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
};
