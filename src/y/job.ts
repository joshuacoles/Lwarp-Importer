import { parse } from "parse5";
import { serializeToString } from "xmlserializer";
import { JSDOM }from "jsdom";

const xmlHeader = '<?xml version=\'1.0\' encoding=\'UTF-8\' ?>\n';

export function html2xhtml(htmlString: string) {
  const dom = parse(htmlString);
  return xmlHeader + serializeToString(dom);
}

export function normaliseHtml(elm: Element): Element {
  let dom = new JSDOM(html2xhtml(elm.outerHTML));
  return dom.window.document.body.firstElementChild!
}

export function explode(element: Element) {
  element.replaceWith(...Array.from(element!.children));
}

export function nextUntil(elem: Element, selector: (element: Element) => boolean, filter?: string): Element[] {
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
