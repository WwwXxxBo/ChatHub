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

export const SystemHttpInstance = axios.create({
    baseURL: "/systemchat",
    timeout: 5000
})
//  axios 响应式拦截器
SystemHttpInstance.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
)
