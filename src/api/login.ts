import { SystemHttpInstance } from "@/utils/http-util"

// 接收后端传递的用户数据
export const getUserData = (
    phone: string,
    password: string
) => {
    return SystemHttpInstance({
        url: "/identify/",
        method: "GET",
        data: JSON.stringify({
            phone: phone,
            password: password
        }),
        withCredentials: true
    })
}