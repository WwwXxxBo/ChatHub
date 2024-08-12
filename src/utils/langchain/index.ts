// LangChain 相关方法
import { BaseDocumentLoader } from 'langchain/document_loaders/base'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'

// 使用 LangChain 加载文件
export const langChainLoadFile = async (filePath: string) => {
    let loader: BaseDocumentLoader | null = null
    if(filePath.endsWith('.txt')){
        loader = new TextLoader(filePath)
    }else if(filePath.endsWith('.pdf')){
        loader = new PDFLoader(filePath)
    }else if(filePath.endsWith('.docx')){
        loader = new DocxLoader(filePath)
    }else if(filePath.endsWith('.pptx')){
        loader = new PPTXLoader(filePath)
    }
    if (!loader) {
        return ''
    }
    const docs = await loader.load()
    if (!docs || docs.length === 0) {
        return ''
    }
    return docs.reduce((accumulator:any, currentObject:any) => {
        return accumulator + currentObject.pageContent
    }, '')
}