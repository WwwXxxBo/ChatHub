import axios from 'axios'

export const httpInstance = axios.create({
    baseURL: "http://localhost:3004",
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
