import Turndown from "turndown";
import globby from "globby";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import * as path from "path";
import prettier, { doc } from "prettier";
import { normaliseHtml } from "../y/job";

Turndown.prototype.escape = s => s;

const paths = globby.sync("/Users/joshuacoles/Developer/checkouts/jc3091/Lwarp-Importer/MA10211/mathml/*.htm")
const turndown = new Turndown();

console.log(paths);

(async () => {
  for (let htmlFile of paths) {
    const dom = await JSDOM.fromFile(htmlFile);
    const document = dom.window.document;
    const container = document.createElement('div');

    const cs: Element[] = Array.from(document.querySelectorAll(".crosslinks"));
    if (cs.length === 0) {
      const md = turndown.turndown(document.body);
      let out = path.join('./out/y', path.basename(htmlFile) + '.md');
      fs.writeFileSync(out, md);
      continue;
    }

    const c0: Node = cs[0];
    const c1: Node = cs[1];

    let curr: Node | null = c0.nextSibling;
    while (curr != null && curr !== c1) {
      let oldCurr = curr;
      curr = curr.nextSibling;
      console.log(curr)
      container.appendChild(oldCurr);
    }

    let formattedHtml = prettier.format(normaliseHtml(container).outerHTML, { parser: "html" })
    const md = turndown.turndown(formattedHtml);

    let out = path.join('./out/y', path.basename(htmlFile) + '.md');
    console.log(out);
    fs.writeFileSync(out, md);
  }
})();
