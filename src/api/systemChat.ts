import { httpInstance } from '@/utils/http-util'

// 接收后端传递的数据
export const receiveSystemChatMessage = (id:string, assistant_id:string, role:string, content:string, createTime:number) => {
    return httpInstance({
        url: '/systemchat',
        method:'POST',
        params:{
            id,
            assistant_id,
            role,
            content,
            createTime
        }
    })
}