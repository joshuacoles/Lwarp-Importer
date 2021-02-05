import { JSDOM } from "jsdom";
import * as fs from "fs";

(async () => {
  const dom = await JSDOM.fromFile("./MA20218-Analysis 2A.html");
  const window = dom.window;
  const document = dom.window.document;

  for (let [i, section] of Array.from(document.querySelectorAll("section.textbody")).entries()) {
    // Remove preamble
    section.querySelectorAll("div.hidden")[0].remove();

    // Remove superfluous information
    section.querySelector(".titlepage")?.remove();

    for (let block of Array.from(section.querySelectorAll(".amsthmbodyclearprint"))) {
      const li = block.querySelector("ul > li");
      block.replaceWith(...Array.from(li!.children))
    }

    Array.from(document.getElementsByTagName("a")).forEach(x => x.id.startsWith("Analysis2A-autopage") ? x.remove() : null);

    fs.writeFileSync(`./extracts/c2-${i}.html`, section.outerHTML);
  }
})()
