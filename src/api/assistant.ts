import { AssistantHttpInstance } from "@/utils/http-util";

// 获取聊天助手列表
export const getAssistantList = (
  userId: number
) => {
  return AssistantHttpInstance({
    url: "/assistants",
    method: "GET",
    params: {
      userId: userId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建新的对话助手
export const createAssistant = (
    assistantId: string, 
    userId: number, 
    name: string, 
    type: string,
    instruction: string, 
    provider: string, 
    model: string, 
    maxTokens: number,
    inputMaxTokens: number, 
    contextSize: number, 
    createTime: number, 
    lastUpdateTime: number,
  ) => {
    return AssistantHttpInstance({
      url: "/assistants",
      method: "POST",
      data: JSON.stringify({
        assistantId: assistantId, 
        userId: userId, 
        type: type,
        name: name, 
        provider: provider, 
        model: model, 
        createTime: createTime, 
        lastUpdateTime: lastUpdateTime,
        instruction: instruction, 
        inputMaxTokens: inputMaxTokens, 
        maxTokens: maxTokens,
        contextSize: contextSize,
      }),
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  };

// 删除聊天助手信息
export const deleteAssistant = (
  assistantId: string
) => {
  return AssistantHttpInstance({
    url: `/assistants/${assistantId}`,
    method: "DELETE",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 修改对话助手信息
export const modifyAssistant = (
  assistantId: string, 
  userId: number, 
  name: string, 
  type: string,
  instruction: string, 
  provider: string, 
  model: string, 
  maxTokens: number,
  inputMaxTokens: number, 
  contextSize: number, 
  createTime: number, 
  lastUpdateTime: number,
) => {
  return AssistantHttpInstance({
    url: `/assistants/${assistantId}`,
    method: "PUT",
    data: JSON.stringify({
      assistantId: assistantId, 
      userId: userId, 
      name: name, 
      type: type,
      instruction: instruction, 
      provider: provider, 
      model: model, 
      maxTokens: maxTokens,
      inputMaxTokens: inputMaxTokens, 
      contextSize: contextSize, 
      createTime: createTime, 
      lastUpdateTime: lastUpdateTime
    }),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建聊天消息
export const createAssistantMessage = (
  messageId: string,
  assistantId: string,
  name: string,
  role: string,
  type: string,
  content: string,
  image: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/messages/",
    method: "POST",
    data: JSON.stringify({
      messageId: messageId,
      assistantId: assistantId,
      name: name,
      role: role,
      type: type,
      content: content,
      image: image,
      createTime: createTime
    }),
    withCredentials: true,
    headers: {
      "content-type": "application/json",
    }
  });
};

// 获取聊天消息列表
export const getAssistantMessageList = (
  assistantId: string,
) => {
  return AssistantHttpInstance({
    url: "/messages/",
    method: "GET",
    params: {
      assistantId: assistantId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 删除聊天消息
export const deleteAssistantMessage = (
  messageId: string,
) => {
  return AssistantHttpInstance({
    url: `/messages/${messageId}`,
    method: "DELETE",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};



/* ----------------------笔记相关接口---------------------- */
// 创建笔记
export const createNote = (
  noteId: string,
  userId: number,
  assistantId: string,
  type: string,
  name: string, 
  title: string,
  content: string,
  comment: string,
  createTime: number, 
  lastUpdateTime: number,

) => {
  return AssistantHttpInstance({
    url: "/notes/",
    method: "POST",
    data: {
      noteId: noteId,
      userId: userId,
      assistantId: assistantId,
      type: type,
      name: name,
      title: title,
      content: content,
      comment: comment,
      createTime: createTime, 
      lastUpdateTime: lastUpdateTime,
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取笔记列表
export const getNoteList = (
  userId: number,
) => {
  return AssistantHttpInstance({
    url: "/notes/",
    method: "GET",
    params: {
      userId: userId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建笔记消息
export const createNoteMessage = (
  messageId: string,
  noteId: string,
  role: string,
  type: string,
  content: string,
  image: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/note_messages/",
    method: "POST",
    data: {
      messageId: messageId,
      noteId: noteId,
      name: '',
      role: role,
      type: type,
      content: content,
      image: image,
      createTime: createTime
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取聊天消息收藏列表
export const getNoteMessageList = (
  noteId: string
) => {
  return AssistantHttpInstance({
    url: "/note_messages/",
    method: "GET",
    params: {
      noteId: noteId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 删除笔记
export const deleteNote = (
  noteId: string
) => {
  return AssistantHttpInstance({
    url: `/notes/${noteId}`,
    method: "DELETE",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 修改笔记
export const updateNote = (
  noteId: string,
  name: string,
  title: string,
  content: string,
  comment: string,
) => {
  return AssistantHttpInstance({
    url: `/notes/${noteId}`,
    method: "PUT",
    data: {
      name: name,
      title: title,
      content: content,
      comment: comment,
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};
