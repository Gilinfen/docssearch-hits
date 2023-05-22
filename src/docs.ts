import markdown from "markdown-it";
import matter from "gray-matter";
import { writeFileSync } from "fs";
import path from "path";
// import { JSDOM } from "jsdom";
import { Parser } from "htmlparser2";

export type DocsType = {
    mdcontent: string;
    slug: string;
    lvl0Title: string;
};

function parseHTML(htmlString) {
    let domTree = { children: [] };
    let stack = [domTree];

    const parser = new Parser(
        {
            onopentag(name, attributes) {
                const newNode = { name, attributes, children: [] };
                stack[stack.length - 1].children.push(newNode);
                stack.push(newNode);
            },
            ontext(text) {
                stack[stack.length - 1].children.push({ text });
            },
            onclosetag() {
                stack.pop();
            },
        },
        { decodeEntities: true }
    );

    parser.write(htmlString);
    parser.end();

    return domTree.children;
}

export const docs = ({ mdcontent, slug, lvl0Title }: DocsType) => {
    const { content, data } = matter(mdcontent);
    const md = new markdown({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
    });
    const htmlString = md.render(content);
    const dom = parseHTML(htmlString);
    console.log(dom);

    // console.log(dom.window.document.documentElement);

    writeFileSync(path.join(process.cwd(), "./src/text.html"), htmlString);
    // writeFileSync(
    //     path.join(process.cwd(), "./src/text.json"),
    //     JSON.stringify(dom)
    // );
    return {};
};
