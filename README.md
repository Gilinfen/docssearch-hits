# docssearch-hits

## 安装
```bash
npm install docssearch-hits
```

## 使用方式

```ts
import { readFileSync } from 'fs'
import path from 'path'
import container from 'markdown-it-container'
import { hitsRender } from 'docssearch-hits'

async function main() {
    const { md, render } = hitsRender()

    // 自定义 use
    md.use(container, 'custom', {
        validate(params: string) {
            const types = ['tip', 'warning', 'danger', 'details']
            const m = params.trim().split(/\s/)
            if (!types.includes(m[0])) return false
            return m
        },
        render(tokens: any, idx: any) {
            const m = tokens[idx].info.trim().split(/\s/)
            const isD = m[0] === 'details'

            if (tokens[idx].nesting === 1) {
                // 处理开头标记
                return `<div class="custom-container ${
                    m[0]
                }"><p class="custom-container-title" >${md.utils.escapeHtml(
                    m[1] ?? m[0]
                )}\n</p>`
            } else {
                // 处理结尾标记
                return `</div>\n`
            }
        }
    })

    const mdcontent = readFileSync(
        path.join(process.cwd(), './test/test.md'),
        'utf-8'
    )
    const { hits } = render({
        slug: '/test/test.md',
        mdcontent,
        lvl0Title: '测试'
    })
}
```
