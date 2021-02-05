import { JSDOM } from "jsdom";
import * as fs from "fs";

(async () => {
  const dom = await JSDOM.fromFile("./MA20218-Analysis 2A.html");
  const window = dom.window;
  const document = dom.window.document;

  for (let [i, section] of Array.from(document.querySelectorAll("section.textbody")).entries()) {
    fs.writeFileSync(`./extracts/raw-${i}.html`, section.outerHTML);
  }
})()
