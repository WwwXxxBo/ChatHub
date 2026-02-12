import axios from 'axios'

export const httpInstance = axios.create({
    baseURL: "/filechat",
    timeout: 5000
})
// 拦截器
httpInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (err) => Promise.reject(err)
)
//  axios 响应式拦截器
httpInstance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
)

export const AssistantHttpInstance = axios.create({
    baseURL: "/assistant",
    timeout: 10000,
})
//  axios 响应式拦截器
AssistantHttpInstance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
)

export const RagHttpInstance = axios.create({
    baseURL: "/rag",
    timeout: 10000000,
})
//  axios 响应式拦截器
RagHttpInstance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
)