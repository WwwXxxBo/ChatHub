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
    const appKey = apiKey!
    const appSecret = secretKey!
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
    }
    // 设置请求 URL 和参数
    
}