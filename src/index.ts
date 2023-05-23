// import { readFileSync, writeFileSync } from 'fs'
// import container from 'markdown-it-container'
// import { __DEV__ } from './env'
// import path from 'path'
// import { uploadSequentially } from './algoliaUpload'
import { Hits } from './docs'

export { hitsRender } from './docs'

export const prearr = (hist: Hits[], size: number = 10000) => {
    const encoder = new TextEncoder()
    const encodedArrayString = encoder.encode(JSON.stringify(hist))
    const stringSize = encodedArrayString.byteLength
    if (stringSize >= size) {
        const step = Math.ceil(stringSize / size)
        const prearrarr: any[][] = hist.reduce((pre, _, i, arr) => {
            if (i % step === 0) {
                pre = [...pre, arr.slice(i, i + step)]
            }
            return pre
        }, [])
        return prearrarr
    }
    return [hist]
}

// if (__DEV__) {
//     async function main() {
//         const { hitsRender } = await import('./docs')
//         const mdcontent = readFileSync(
//             path.join(process.cwd(), './test/test.md'),
//             'utf-8',
//         )
//         const { md, render } = hitsRender()
//         md.use(container, 'custom', {
//             validate(params: string) {
//                 const types = ['tip', 'warning', 'danger', 'details']
//                 const m = params.trim().split(/\s/)
//                 if (!types.includes(m[0])) {
//                     return false
//                 }
//                 return m
//             },
//             render(tokens: any, idx: any) {
//                 const m = tokens[idx].info.trim().split(/\s/)
//                 // const isD = m[0] === 'details'
//                 if (tokens[idx].nesting === 1) {
//                     // 处理开头标记
//                     return `<div class="custom-container ${
//                         m[0]
//                     }"><p class="custom-container-title" >${md.utils.escapeHtml(
//                         m[1] ?? m[0],
//                     )}\n</p>`
//                 }
//                 // 处理结尾标记
//                 return '</div>\n'
//             },
//         })
//         const { hits } = render({
//             slug: '/test/test.md',
//             mdcontent,
//             lvl0Title: '测试',
//         })
//         writeFileSync(
//             path.join(process.cwd(), './test/text.json'),
//             JSON.stringify(hits),
//         )
//         // await uploadSequentially(prearr(hits))
//     }
//     main()
// }
