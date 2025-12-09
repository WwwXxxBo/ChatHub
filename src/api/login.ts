import { AssistantHttpInstance } from "@/utils/http-util";

// 接收后端传递的用户数据
export const getUserData = async (phone: string, password: string) => {
  try {
    const response = await AssistantHttpInstance({
      url: "/auth/sign_in",
      method: "POST",
      data: {
        login: phone,
        password: password,
      },
      headers: {
        "content-type": "application/json",
      },
      withCredentials: true,
    });
    
    // 注意：由于拦截器返回 res.data，这里 response 已经是处理后的数据
    return response;
    
  } catch (error) {
    // 错误已经被拦截器处理过了，这里可以直接展示给用户
    throw error;
  }
};
