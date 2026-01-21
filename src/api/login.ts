import { AssistantHttpInstance } from "@/utils/http-util";

// 接收后端传递的用户数据
export const getUserData = async (phone: string, password: string) => {
    const response = await AssistantHttpInstance({
      url: "/users/login",
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
      url: "/users/register",
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
