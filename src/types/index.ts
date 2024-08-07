// 聊天角色类型
export type ChatRole = "user" | "assistant" | "system" | "tool";
// 助手类型
export type AssistantType = "chat";
// 消息类型
export type ChatMsgType = "text" | "img";
// 页面类型
export type PageName = "chat" | "chat-assistant" | "collect";
// 收藏类型
export type CollectionItemType = 'chat' | 'image' | 'note';
// 插件类型
export type ChatPluginType = "function";
// 提示类型
export type AppNotificationType = 'info' | 'warn' | 'error'
// 插件参数类型
export type ChatPluginParameterType =
  | "string"
  | "number"
  | "integer"
  | "object"
  | "array"
  | "boolean";

// 大模型提供者
export type BigModelProvider =
  // | "OpenAI"
  // | "Ollama"
  // | "Gemini"
  | "ZhipuAI"
  // | "Tongyi"
  // | "ERNIE"
  // | "Spark"
  | "Tiangong"
  | "MoonshotAI"
  | "StepFun"
  | "DeepSeek"
  | "BaiChuan";

// 提示
export interface AppNotification {
  type: AppNotificationType;
  content: string;
  createTime: number;
}

// 聊天插件参数
export interface ChatPluginParameter {
  name: string;
  type: ChatPluginParameterType;
  description: string;
}

// 聊天插件
export interface ChatPlugin {
  id: string;
  type: ChatPluginType;
  description: string;
  name: string;
  code: string;
  parameters: ChatPluginParameter[];
  createTime: number;
  lastUpdateTime: number;
}

// 对话文件
export interface MessageFile {
  id: string;
  name: string;
  path: string;
  size: number;
}
// 基础对话
export interface BaseMessage {
  role: ChatRole;
  name?: string;
  content: string;
  image?: string;
  fileList?: MessageFile[];
}
// 对话
export interface ChatMessage extends BaseMessage {
  id: string;
  type: ChatMsgType;
  createTime: number;
}
// Assistant
export interface Assistant {
  // 通用
  id: string;
  type: AssistantType;
  name: string;
  provider: BigModelProvider;
  model: string;
  createTime: number;
  lastUpdateTime: number;
  chatMessageList: ChatMessage[];
  clearContextMessageId?: string | null;
  chatPluginIdList: string[];

  // 对话
  instruction: string;
  inputMaxTokens: number;
  maxTokens: number;
  contextSize: number;

  // 发音
  speechModel?: string;
  speechVoice?: string;
  speechSpeed?: number;
}

// 笔记收藏
export interface CollectionNote {
  title: string
  content: string
}

// 收藏
export interface CollectionItem{
  id: string,
  type: CollectionItemType,
  createTime: number,
  // 对话收藏
  chat?: Assistant,
  // 笔记收藏
  note?: CollectionNote
}