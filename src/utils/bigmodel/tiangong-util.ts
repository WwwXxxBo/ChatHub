// 引入通用类型检查
import type { ChatMessage } from "@/types";
// 引入接口
import { turnChat, limitContext } from "@/utils/base-util"
// 引入大模型相关类型检查
import { type CommonChatOption } from "@/utils/bigmodel";
// 引入加密库
import CryptoJS from 'crypto-js'

// 天工开物开放平台 https://model-platform.tiangong.cn/api-reference

export const chat2tiangong = async (option : CommonChatOption) => {
    const {
        model,
        instruction,
        inputMaxTokens,
        contextSize,
        apiKey,
        secretKey,
        messages,
        sessionId,
        abortCtr,
        startAnswer,
        appendAnswer,
        end
    } = option

    let waitAnswer = true

    // 对外网开放域名	
    const url = 'https://api-maas.singularity-ai.com/sky-work/api/v1/chat'
    const appKey = '307e43ce18de41b168ab88b22d2bbc7d'
    const appSecret = 'bea3ca995b595250ed0ba23d1eb45bc75b7b7550d69cb21d'
    // 时间需要转换到秒
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signContent = apiKey! + appSecret! + timestamp
    // 进行加密
    const signResult = CryptoJS.MD5(signContent).toString(CryptoJS.enc.Hex)
    // 设置请求头，请求的数据格式为 JSON
    const headers = {
        app_key: appKey,
        timestamp: timestamp,
        sign: signResult,
        'Content-Type': 'application/json',
        stream: 'true'
    }
    // 设置请求 URL 和参数
    const data = {
        messages: await getTiangongMessages(messages!, instruction, inputMaxTokens, contextSize),
        'intent': 'chat' //用于强制指定意图，默认为空将进行意图识别判定是否搜索增强，取值 'chat'则不走搜索增强
    }
    try{
        // 发起请求并获得响应
        const response = await fetch(url,{
            method: 'POST',
            headers: headers,
            body:JSON.stringify(data),
            signal: abortCtr?.signal
        })
        // 创建一个 ReadableStream 的读取器
        const reader = response.body!.getReader()
        // 读取数据并处理
        let isDone = false;
        while(!isDone){
            const { done, value } = await reader.read()
            // 如果读取完成，终止 ReadableStream
            isDone = done
            if(done){
                break
            }
            // 处理接收到的数据
            const jsonData = new TextDecoder('utf-8').decode(value)
            // 按照换行分行
            const lines = jsonData.split('\n')
            console.log('输出',lines)
            // 遍历每一行
            for (const line of lines) {
                if (line) {
                    const newLine = '{' + line + '}'
                    // console.log('输出',line)
                    const lineData = JSON.parse(line.slice(5))
                    if(lineData.target == 'finish'){
                        break;
                    }
                    // console.log('Data:',lineData?.arguments[0]?.messages[0]?.text)
                    // 正确返回
                    if (waitAnswer) {
                        waitAnswer = false
                        startAnswer && startAnswer(sessionId)
                    }
                    appendAnswer && appendAnswer(sessionId, lineData?.arguments[0]?.messages[0]?.text)
                }
            }
        }
        end && end(sessionId)
    }catch (error: any){
        console.log(error)
        end && end(sessionId, error?.message)
    }
}




export const getTiangongMessages = async (
    chatMessageList: ChatMessage[],
    instruction: string,
    inputMaxTokens: number | undefined,
    contextSize: number
) => {
    // 消息格式转换
    let messages = await turnChat(chatMessageList);
    // 截取指定长度的上下文
    messages = limitContext(inputMaxTokens, contextSize, messages);
    // 增加指令
    if(instruction.trim().length > 0){
        messages.unshift({
            role: 'system',
            content: instruction
        })
    }
    // 修改消息结构 因为天工模型的默认角色为 system、bot、user
    return messages.map((msg) => {
        return {
            role: msg.role === 'assistant' ? 'bot' : msg.role,
            content: msg.content
        }
    })

}