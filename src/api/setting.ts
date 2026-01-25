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







// 获取通用设置
export const getCommonSetting = (
    userId: number,
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
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

// 创建通用设置
export const createCommonSetting = (
    userId: number,
    openAIKey: string,
    zhipuAIKey: string,
    ernieAPIKey: string,
    ernieSecretKey: string,
    sparkAppId: string,
    sparkSecret: string,
    sparkKey: string,
    tongyiKey: string,
    moonshotAIKey: string, 
    tiangongAppKey: string, 
    tiangongAppSecret: string, 
    stepFunKey: string, 
    deepSeekKey: string, 
    baichuanKey: string
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
      method: "POST",
      params: {
        userId: userId,
        openAIKey: openAIKey,
        zhipuAIKey: zhipuAIKey,
        ernieAPIKey: ernieAPIKey,
        ernieSecretKey: ernieSecretKey,
        sparkAppId: sparkAppId,
        sparkSecret: sparkSecret,
        sparkKey: sparkKey,
        tongyiKey: tongyiKey,
        moonshotAIKey: moonshotAIKey, 
        tiangongAppKey: tiangongAppKey, 
        tiangongAppSecret: tiangongAppSecret, 
        stepFunKey: stepFunKey, 
        deepSeekKey: deepSeekKey, 
        baichuanKey: baichuanKey
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  };


// 修改通用设置
export const modifyCommonSetting = (
    userId: number,
    openAIKey: string,
    zhipuAIKey: string,
    ernieAPIKey: string,
    ernieSecretKey: string,
    sparkAppId: string,
    sparkSecret: string,
    sparkKey: string,
    tongyiKey: string,
    moonshotAIKey: string, 
    tiangongAppKey: string, 
    tiangongAppSecret: string, 
    stepFunKey: string, 
    deepSeekKey: string, 
    baichuanKey: string
  ) => {
    return AssistantHttpInstance({
      url: "/common_setting/",
      method: "PUT",
      params: {
        userId: userId,
        openAIKey: openAIKey,
        zhipuAIKey: zhipuAIKey,
        ernieAPIKey: ernieAPIKey,
        ernieSecretKey: ernieSecretKey,
        sparkAppId: sparkAppId,
        sparkSecret: sparkSecret,
        sparkKey: sparkKey,
        tongyiKey: tongyiKey,
        moonshotAIKey: moonshotAIKey, 
        tiangongAppKey: tiangongAppKey, 
        tiangongAppSecret: tiangongAppSecret, 
        stepFunKey: stepFunKey, 
        deepSeekKey: deepSeekKey, 
        baichuanKey: baichuanKey
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  };