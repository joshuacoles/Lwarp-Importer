import { JSDOM } from "jsdom";
import * as fs from "fs";

import { select } from "xpath";


/*!
 * Get all following siblings of each element up to but not including the element matched by the selector
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   elem     The element
 * @param  {String} selector The selector to stop at
 * @param  {String} filter   The selector to match siblings against [optional]
 * @return {Array}           The siblings
 */
function nextUntil(elem: Element, selector: (element: Element) => boolean, filter?: string): Element[] {
  let siblings = [];

  // Get the next sibling element
  elem = elem.nextElementSibling!;

  // As long as a sibling exists
  while (elem) {
    console.log(elem)
    // If we've reached our match, bail
    if (selector(elem)) break;

    // If filtering by a selector, check if the sibling matches
    if (filter && !elem.matches(filter)) {
      elem = elem.nextElementSibling!;
      continue;
    }

    // Otherwise, push it to the siblings array
    siblings.push(elem);

    // Get the next sibling element
    elem = elem.nextElementSibling!;
  }

  return siblings;
}

(async () => {
  const dom = await JSDOM.fromFile("./MA20218-Analysis 2A.html");
  const window = dom.window;
  const document = dom.window.document;

  for (let [i, section] of Array.from(document.querySelectorAll("section.textbody")).entries()) {
    console.log("o")

    // Remove preamble
    section.querySelectorAll("div.hidden")[0].remove();

    // Remove superfluous information
    section.querySelector(".titlepage")?.remove();

    // Breakup annoying blocks
    for (let block of Array.from(section.querySelectorAll(".amsthmbodyclearprint"))) {
      const li = block.querySelector("ul > li");
      block.replaceWith(...Array.from(li!.children))
    }

    // Remove autopage links
    Array.from(document.getElementsByTagName("a")).forEach(x => x.id.startsWith("Analysis2A-autopage") ? x.remove() : null);

    let headers = Array.from(section.querySelectorAll(".amsthmnameclearprint"));
    let headerContainers: Element[] = headers.map(h => h.parentElement!);

    for (let [hi, hc] of headerContainers.entries()) {
      console.log("a", hc)
      const container = document.createElement("div");
      let title = `${headers[hi].textContent} ${headers[hi].nextSibling!.textContent}`;

      nextUntil(hc, e => e.querySelector(".amsthmnameclearprint") != null)
        .map(x => container.appendChild(x))

      container.prepend(hc);

      fs.writeFileSync(`./extracts/objs/${i}/${title}.html`, container.outerHTML);
    }
  }
})()
