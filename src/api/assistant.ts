import { AssistantHttpInstance } from "@/utils/http-util";

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
    speechModel: string, 
    speechVoice: string,
    speechSpeed: number, 
    createTime: number, 
    lastUpdateTime: number,
  ) => {
    return AssistantHttpInstance({
      url: "/assistant/",
      method: "POST",
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
        speechModel: speechModel, 
        speechVoice: speechVoice,
        speechSpeed: speechSpeed, 
        createTime: createTime, 
        lastUpdateTime: lastUpdateTime
      }),
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
  speechModel: string, 
  speechVoice: string,
  speechSpeed: number, 
  createTime: number, 
  lastUpdateTime: number,
) => {
  return AssistantHttpInstance({
    url: "/assistant/",
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
      speechModel: speechModel, 
      speechVoice: speechVoice,
      speechSpeed: speechSpeed, 
      createTime: createTime, 
      lastUpdateTime: lastUpdateTime
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
    url: "/assistant/",
    method: "DELETE",
    params: {
      assistantId: assistantId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取聊天助手列表
export const getAssistantList = (
  userId: number
) => {
  return AssistantHttpInstance({
    url: "/assistant/",
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
    url: "/assistant_message/",
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
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取聊天消息列表
export const getAssistantMessageList = (
  assistantId: string,
) => {
  return AssistantHttpInstance({
    url: "/assistant_message/",
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
    url: "/assistant_message/",
    method: "DELETE",
    params: {
      messageId: messageId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建聊天信息收藏
export const createChatCollection = (
  chatCollectionId: string,
  assistantId: string,
  userId: number,
  type: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/chat_collection/",
    method: "POST",
    params: {
      chatCollectionId: chatCollectionId,
      assistantId: assistantId,
      userId: userId,
      type: type,
      createTime: createTime
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 删除聊天信息收藏
export const deleteChatCollection = (
  chatCollectionId: string
) => {
  return AssistantHttpInstance({
    url: "/chat_collection/",
    method: "DELETE",
    params: {
      chatCollectionId: chatCollectionId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建聊天信息收藏
export const getChatCollectionList = (
  userId: number,
) => {
  return AssistantHttpInstance({
    url: "/chat_collection/",
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


// 创建笔记收藏
export const createNoteCollection = (
  noteCollectionId: string,
  userId: number,
  type: string,
  title: string,
  content: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/note_collection/",
    method: "POST",
    params: {
      noteCollectionId: noteCollectionId,
      userId: userId,
      type: type,
      title: title,
      content: content,
      createTime: createTime
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建笔记收藏
export const deleteNoteCollection = (
  noteCollectionId: string
) => {
  return AssistantHttpInstance({
    url: "/note_collection/",
    method: "DELETE",
    params: {
      noteCollectionId: noteCollectionId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建笔记收藏
export const getNoteCollectionList = (
  userId: number
) => {
  return AssistantHttpInstance({
    url: "/note_collection/",
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

// 修改笔记收藏
export const modifyNoteCollection = (
  noteCollectionId: string,
  userId: number,
  type: string,
  title: string,
  content: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/note_collection/",
    method: "PUT",
    params: {
      noteCollectionId: noteCollectionId,
      userId: userId,
      type: type,
      title: title,
      content: content,
      createTime: createTime
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建聊天消息收藏
export const createChatCollectionMessage = (
  messageId: string,
  chatCollectionId: string,
  name: string,
  role: string,
  type: string,
  content: string,
  image: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/chat_collection_message/",
    method: "POST",
    params: {
      messageId: messageId,
      chatCollectionId: chatCollectionId,
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
export const getChatCollectionMessageList = (
  chatCollectionId: string
) => {
  return AssistantHttpInstance({
    url: "/chat_collection_message/",
    method: "GET",
    params: {
      chatCollectionId: chatCollectionId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建新的对话助手
export const createSystemAssistant = (
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
  speechModel: string, 
  speechVoice: string,
  speechSpeed: number, 
  createTime: number, 
  lastUpdateTime: number,
) => {
  return AssistantHttpInstance({
    url: "/system_assistant/",
    method: "POST",
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
      speechModel: speechModel, 
      speechVoice: speechVoice,
      speechSpeed: speechSpeed, 
      createTime: createTime, 
      lastUpdateTime: lastUpdateTime
    }),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 删除系统聊天助手信息
export const deleteSystemAssistant = (
  assistantId: string
) => {
  return AssistantHttpInstance({
    url: "/system_assistant/",
    method: "DELETE",
    params: {
      assistantId: assistantId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 删除系统聊天助手信息
export const getSystemAssistantList = (
  userId: string
) => {
  return AssistantHttpInstance({
    url: "/system_assistant/",
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

// 创建系统聊天消息
export const createSystemAssistantMessage = (
  messageId: string,
  assistantId: string,
  name: string,
  role: string,
  content: string,
  createTime: number
) => {
  return AssistantHttpInstance({
    url: "/system_assistant_message/",
    method: "POST",
    params: {
      messageId: messageId,
      assistantId: assistantId,
      name: name,
      role: role,
      content: content,
      createTime: createTime
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 创建系统聊天消息
export const deleteSystemAssistantMessage = (
  messageId: string
) => {
  return AssistantHttpInstance({
    url: "/system_assistant_message/",
    method: "DELETE",
    params: {
      messageId: messageId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取系统聊天消息
export const getSystemAssistantMessageList = (
  assistantId: string
) => {
  return AssistantHttpInstance({
    url: "/system_assistant_message/",
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