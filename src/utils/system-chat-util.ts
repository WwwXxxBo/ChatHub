// 与后端进行交互
import { receiveSystemChatMessage } from '@/api/systemChat'
export const chat2system = async (id:string, assistant_id:string, role:string, content:string, createTime:number) => {
    const data = await receiveSystemChatMessage(id, assistant_id, role, content, createTime)
    console.log(data)
}