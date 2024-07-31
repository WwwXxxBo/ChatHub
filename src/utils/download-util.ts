// 导出文本文件
export const exportTextFile = (fileName: string, fileContent: string | undefined) => {
    const blob = new Blob([fileContent ?? ''], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}