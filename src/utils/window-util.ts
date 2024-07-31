// 判断浏览器首选语言是否为中文
export const isZH = (): boolean => {
    return !!navigator.languages.at(0)?.startsWith('zh')
}

// 打开指定网页
export const openInBrowser = (url: string | undefined) => {
    if (!url) {
      return
    }
    window.open(url)
  }