import { AssistantHttpInstance } from "@/utils/http-util";

/* ----------------------大模型API相关接口---------------------- */
// 根据用户ID获取大模型API列表
export const getProviderListByUserId = (userId: string) => {
  return AssistantHttpInstance({
    url: "/providers/",
    method: "GET",
    params: {
      userId: userId,
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

// 大模型API创建
export const createProvider = (providerId: string, userId: string, provider: string, apiKey: string, apiSecret: string) => {
  return AssistantHttpInstance({
    url: "/providers/",
    method: "POST",
    data: {
      providerId: providerId,
      userId: userId,
      provider: provider,
      apiKey: apiKey,
      apiSecret: apiSecret
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

// 大模型API修改
export const updateProviderByProviderId = (providerId: string, apiKey: string, apiSecret: string) => {
  return AssistantHttpInstance({
    url: `/providers/${providerId}`,
    method: "PUT",
    data: {
      apiKey: apiKey,
      apiSecret: apiSecret
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}


/* ----------------------设置相关接口---------------------- */
// 获取设置信息
export const getSettingByUserId = (
    userId: number,
  ) => {
    return AssistantHttpInstance({
      url: "/settings/",
      method: "GET",
      params: {
        userId: userId
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
};

// 创建设置
export const createSetting = (
  settingId: string,
  userId: number,
  theme:number,
  customTheme: string,
  fontSize: number,
  locale: string   
) => {
  return AssistantHttpInstance({
    url: "/settings/",
    method: "POST",
    data: {
      settingId: settingId,
      userId: userId,
      theme: theme,
      customTheme: customTheme,
      fontSize: fontSize,
      locale: locale
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 修改设置
export const updateSettingByUserId = (
  userId: number,
  theme:number,
  customTheme: string,
  fontSize: number,
  locale: string   
) => {
  return AssistantHttpInstance({
    url: `/settings/${userId}`,
    method: "PUT",
    data: {
      theme: theme,
      customTheme: customTheme,
      fontSize: fontSize,
      locale: locale
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};