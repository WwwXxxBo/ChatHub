import { receiveSystemChatMessage } from '@/api/systemChat'
import { type SystemChatOption } from '@/utils/systemchat'

export const chat2system = async (option: SystemChatOption) => {
    const {
        sessionId,
        messages,
        startAnswer,
        appendAnswer,
        end,
        abortCtr
    } = option
    

    
    // 开始回答
    startAnswer && startAnswer(sessionId)
    // const data = await receiveSystemChatMessage(id, assistant_id, role, content, createTime)
    // 向现有消息列表添加后端返回数据
    // appendAnswer && appendAnswer(sessionId, data.content ?? "");
    // 结束
    end && end(sessionId);
    console.log(messages)
}