// 将文本转换为 Base64
export function textToBase64(text: string) {
  return btoa(encodeURIComponent(text));
}

// 将 Base64 转换为文本
export function base64ToText(base64: string) {
  return decodeURIComponent(atob(base64));
}
