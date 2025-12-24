import { AssistantHttpInstance } from "@/utils/http-util";

// 接收后端传递的用户数据
export const getUserData = async (phone: string, password: string) => {
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
    return response;
};

// 注册新用户
export const resgisterUser = (name: string,
  email: string,
  phone: string,
  password: string) => {
    return AssistantHttpInstance({
      url: "/auth/sign_up",
      method: "POST",
      data: {
        name: name,
        email: email,
        phone: phone,
        password: password
      },
      headers: {
        "content-type": "application/json",
      },
      withCredentials: true,
    });
}
