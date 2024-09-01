// 系统操作大模型通用配置
import { type SystemChatMessage} from "@/types"
export interface SystemChatOption {
    sessionId: string;
    assistantId: string;
    messages?: SystemChatMessage[];
    createTime: number;
    startAnswer?: (sessionId: string, content?: string) => void;
    appendAnswer?: (sessionId: string, content: string) => void;
    end?: (sessionId: string, err?: any) => void;
    abortCtr?: AbortController;
  }