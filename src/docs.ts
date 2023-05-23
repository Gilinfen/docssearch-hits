import markdown from 'markdown-it'
import { Parser } from 'htmlparser2'

const hlist = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

const tags = [...hlist, 'p', 'li', 'tr', 'pre'] as const

export type Hits = {
    objectID: string
    url: string
    type: keyof Hits['hierarchy']
    hierarchy: {
        lvl0: string | null
        lvl1: string | null
        lvl2: string | null
        lvl3: string | null
        lvl4: string | null
        lvl5: string | null
        lvl6: string | null
    }
    content: string
}

type DocsType = {
    mdOptions?: markdown.Options
}

type DocsTypeReturn = {
    md: markdown
    render: (param: { mdcontent: string, slug: string, lvl0Title: string }) => {
        hits: Hits[]
    }
}
export type DocsUpdate = (params?: DocsType) => DocsTypeReturn

type ArrItemType = {
    name: any
    text: string
    attributes: {
        [key: string]: string
    }
    children: ArrItemType[]
}

function parseHTML(htmlString) {
    const domTree = { children: [] }
    const stack = [domTree]

    const parser = new Parser(
        {
            onopentag(name, attributes) {
                const newNode = { name, attributes, children: [] }
                stack[stack.length - 1].children.push(newNode)
                stack.push(newNode)
            },
            ontext(text) {
                stack[stack.length - 1].children.push({ text })
            },
            onclosetag() {
                stack.pop()
            },
        },
        { decodeEntities: true },
    )

    parser.write(htmlString)
    parser.end()

    return domTree.children
}

const replactChildren = (arr: ArrItemType[]): string[] => arr.reduce((pre: string[], item) => {
    if (item.children) {
        return [...pre, ...replactChildren(item.children)]
    }
    return [...pre, item.text]
}, [])

const isChildernRep = (arr: ArrItemType[]) => arr.some((item) => {
    if (item.children && !tags.includes(item.name)) {
        return isChildernRep(item.children)
    }
    return tags.includes(item.name)
})

const paveChildren = (arr: ArrItemType[]): ArrItemType[] => {
    const newArr = []
    arr.forEach((item) => {
        if (tags.includes(item.name) && !isChildernRep(item.children ?? [])) {
            newArr.push(item)
        } else {
            newArr.push(...paveChildren(item.children ?? []))
        }
    })
    return newArr.filter((item) => item.text !== '\n')
}

const getDoThree = (
    dom: ArrItemType[],
    hierarchy: Hits['hierarchy'],
    type: Hits['type'],
    slug: string,
) => {
    const filterArr = paveChildren(dom)
    return filterArr.map((item, i) => {
        const content = replactChildren(item.children)
            .join('')
            .replace(/\n/g, '')

        if (hlist.includes(item.name)) {
            const sum = item.name[1]
            type = `lvl${sum}` as keyof typeof hierarchy
            hierarchy[type] = content
            for (const key in hierarchy) {
                if (Object.prototype.hasOwnProperty.call(hierarchy, key)) {
                    if (key[key.length - 1] > sum) {
                        hierarchy[key] = null
                    }
                }
            }
        }
        const url = `${slug}#${hierarchy[type]
            .replace(/\s|\./g, '-')
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
            .toLowerCase()}`
        return {
            objectID: i + slug,
            url,
            type,
            hierarchy: JSON.parse(JSON.stringify(hierarchy)),
            content: content?.length ? content : null,
        }
    })
}

/**
 * hitsRender
 *
 * @author Glinfen
 * @date 2023-5-23
 * @export
 */
export const hitsRender: DocsUpdate = (options) => {
    const md = new markdown({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
        ...options?.mdOptions ?? {},
    })

    return {
        md,
        render({ slug, lvl0Title, mdcontent }) {
            const htmlString = md.render(mdcontent)
            const dom: ArrItemType[] = parseHTML(htmlString)
            const hierarchy: Hits['hierarchy'] = {
                lvl0: lvl0Title,
                lvl1: null,
                lvl2: null,
                lvl3: null,
                lvl4: null,
                lvl5: null,
                lvl6: null,
            }

            const type: Hits['type'] = 'lvl0'
            const hits = getDoThree(dom, hierarchy, type, slug)
            return {
                hits,
            }
        },
    }
}
