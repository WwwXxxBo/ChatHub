// 引入通用类型检查
import type { ChatMessage } from "@/types";
// 引入接口
import { turnChat, limitContext } from "@/utils/base-util"
// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";

export const chat2baichuan = async (option : CommonChatOption) => {
    const {
        model,
        instruction,
        inputMaxTokens,
        maxTokens,
        contextSize,
        apiKey,
        messages,
        sessionId,
        abortCtr,
        startAnswer,
        appendAnswer,
        end
    } = option

    
}