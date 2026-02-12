import { RagHttpInstance } from "@/utils/http-util";
/* ----------------------RAG视频处理接口---------------------- */
export const processVideoAsync = (
  videoUrl: string
) => {
  return RagHttpInstance({
    url: "/api/v1/videos/process/sync",
    method: "POST",
    data: {
      video_url: videoUrl
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  })
}

export const getTaskStatus = (
  taskId: string
) => {
  return RagHttpInstance({
    url: `/api/v1/videos/process/${taskId}`,
    method: "GET",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

export const cancelTask = (
  taskId: string
) => {
  return RagHttpInstance({
    url: `/api/v1/videos/process/${taskId}`,
    method: "DELETE",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export const queryRag = (
  query: string,
  useCrossVideo: boolean = true,
  topK: number = 10,
) => {
  return RagHttpInstance({
    url: `/api/v1/query`,
    method: "POST",
    data: {
      query: query,
      use_cross_video: useCrossVideo,
      top_k: topK
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}