// 系统操作大模型通用配置
import { type SystemMessage} from "@/types"
export interface CommonChatOption {
    messages?: SystemMessage[];
    abortCtr?: AbortController;
    sessionId: string;
    startAnswer?: (sessionId: string, content?: string) => void;
    appendAnswer?: (sessionId: string, content: string) => void;
    end?: (sessionId: string, err?: any) => void;
  }