import { AssistantHttpInstance } from "@/utils/http-util";

/* ----------------------视频上传相关接口---------------------- */

// 上传单个视频
export interface UploadVideoParams {
  video: File;                // 视频文件
  userId: number;             // 用户ID
  videoId: string;
  title?: string;            // 视频标题
  category?: string;         // 分类
  tags?: string[];           // 标签数组
  difficulty?: string;
  description?: string;      // 描述
}

export interface UploadVideoResponse {
  success: boolean;
  data: {
    id: number;
    videoId: string;
    fileName: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
    bucket: string;
    title?: string;
    category?: string;
    tags?: string[];
    uploadTime: string;
  };
  message: string;
}


export interface GetUserVideosParams {
  userId: number;
  page?: number;
  limit?: number;
}

export interface VideoItem {
  id: number;
  videoId: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  uploadTime: string;
  metadata?: Record<string, any>;
}

export interface GetUserVideosResponse {
  success: boolean;
  data: {
    videos: VideoItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DeleteVideoParams {
  videoId: number;
  userId: number;
}

// 批量上传视频
export interface BatchUploadVideoParams {
  videos: File[];            // 视频文件数组
  userId: number;            // 用户ID
  category?: string;         // 统一分类
}

export interface UpdateVideoParams {
  videoId: number;
  userId: number;
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
}

export const uploadVideo = (params: UploadVideoParams, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('video', params.video);
  formData.append('userId', params.userId.toString());
  formData.append('videoId', params.videoId.toString());
  if (params.title) formData.append('title', params.title);
  if (params.category) formData.append('category', params.category);
  if (params.tags && params.tags.length >= 0) {
    formData.append('tags', JSON.stringify(params.tags));
  }
  if (params.description) formData.append('description', params.description);

  return AssistantHttpInstance({
    url: "/upload/video",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
};

export const batchUploadVideos = (params: BatchUploadVideoParams) => {
  const formData = new FormData();
  params.videos.forEach((video, index) => {
    formData.append(`videos`, video);
  });
  formData.append('userId', params.userId.toString());
  if (params.category) formData.append('category', params.category);

  return AssistantHttpInstance({
    url: "/upload/videos",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const getUserVideos = (params: GetUserVideosParams) => {
  return AssistantHttpInstance({
    url: "/upload/videos",
    method: "GET",
    params: {
      userId: params.userId,
      page: params.page || 1,
      limit: params.limit || 20
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取视频详情
export const getVideoDetail = (videoId: number, userId: number) => {
  return AssistantHttpInstance({
    url: `/upload/video/${videoId}`,
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

// 删除视频
export const deleteVideo = (params: DeleteVideoParams) => {
  return AssistantHttpInstance({
    url: `/upload/video/${params.videoId}`,
    method: "DELETE",
    data: {
      userId: params.userId
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 更新视频信息（标题、分类等）
export const updateVideo = (params: UpdateVideoParams) => {
  return AssistantHttpInstance({
    url: `/upload/video/${params.videoId}`,
    method: "PUT",
    data: {
      userId: params.userId,
      title: params.title,
      category: params.category,
      tags: params.tags,
      description: params.description
    },
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};

// 获取视频上传进度（如果需要分片上传）
export const getUploadProgress = (uploadId: string) => {
  return AssistantHttpInstance({
    url: `/upload/progress/${uploadId}`,
    method: "GET",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
};