// 以 Markdown 格式输出代码
// 引入国际化组件
import i18n from "@/i18n";
// 引入代码高亮插件
import hljs from "highlight.js";
// 引入 Markdown-it 插件
import MarkdownIt from "markdown-it";
// 引入 Markdown 数学插件
import mk from 'markdown-it-katex'
// 引入提示框 UI 组件
import { Message } from '@arco-design/web-vue'
// 引入高亮插件
import 'highlight.js/scss/github-dark.scss'
// 引入 Markdown 的样式
import "@/assets/css/markdown-code.less";
// 引入 ClipboardJS
import ClipboardJS from 'clipboard'
// 引入格式转换方法
import { textToBase64, base64ToText } from '@/utils/base64-util'

// 国际化支持
const { t } = i18n.global

// 增加代码复制功能
const clipboard = new ClipboardJS('.code-header-copy', {
  text: function (trigger) {
    const base64Str = trigger.getAttribute('data-clipboard-text-base64')
    return base64Str ? base64ToText(base64Str) : ''
  }
})
clipboard.on('success', () => {
  Message.success(t('common.copySuccess'))
})

// 增加代码高亮
const markdown = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    if (!lang) {
      lang = "text";
    }
    let codeHtml = `<code class="hljs language-${lang}">${
      hljs.highlight(str, { language: lang }).value
    }</code>`;
    codeHtml =
      `<div class="code-header">
          <div>${lang}</div>
          <div class="code-header-copy" data-clipboard-text-base64='${textToBase64(
            str
          )}'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path></svg>
            <span>复制</span>
          </div>
        </div>` + codeHtml;
    return `<pre>${codeHtml}</pre>`;
  },
});
// 渲染函数
export const renderMarkdown = (content: string, isLoading: boolean) => {
  if (!isLoading) {
    return markdown.render(content);
  }
  // 支持数学公式，svg渲染，无需引入额外样式
  markdown.use(mk)
  // 加载中，显示闪烁光标
  const endFlag = "【end】";
  let htmlCode = markdown.render(content + endFlag);
  // 找到结束标识
  const endFlagIndex = htmlCode.lastIndexOf(endFlag);
  // 插入光标元素
  htmlCode =
    htmlCode.substring(0, endFlagIndex) +
    `<span class="chat-message-loading">丨</span>` +
    htmlCode.substring(endFlagIndex + endFlag.length);
  return htmlCode;
};
