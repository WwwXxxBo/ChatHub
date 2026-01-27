export interface VideoItem {
    id: number,
    videoId: string,
    fileName: string,
    originalName: string,
    title: string,
    url: string,
    coverUrl: string,
    thumbnailUrl: string,
    duration: string,
    tags: string[],
    category: string,
    description: string,
    difficulty: string,
    size: number,
    mimeType: string,
    uploadTime: string
}

// 分页信息接口
export interface PaginationInfo {
    page: number,
    limit: number,
    total: number,
    pages: number
}

// 返回数据接口
export interface ApiResponse {
    status: boolean,
    message?: string,
    data: {
        videos: VideoItem[],
        pagination: PaginationInfo
    }
}

export interface RequestParams {
    userId: number,
    page: number,
    limit: number,
    search?: string,
    category?: string,
}