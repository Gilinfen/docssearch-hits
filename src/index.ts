import { readFileSync } from "fs";
import { docs } from "./docs";
import { __PROD__, __DEV__ } from "./env";
import path from "path";
/**
 * say hello
 *
 * @author CaoMeiYouRen
 * @date 2020-11-28
 * @export
 */
export function hello() {
    if (__PROD__) {
        console.log("Hello production");
    }
    if (__DEV__) {
        const mdcontent = readFileSync(
            path.join(process.cwd(), "./test/test.md"),
            "utf-8"
        );
        docs({
            mdcontent,
            slug: "",
            lvl0Title: "",
        });
    }
}
hello();
