import { JSDOM } from "jsdom";
import * as fs from "fs";

import { normaliseHtml, nextUntil, explode } from "../y/job";

import turndown from "turndown";
import prettier, { doc } from "prettier";
import globby from "globby";

// Remove escaping in markdown to stop it messing up maths.
// We may need to make this more sensible to only allow through maths
turndown.prototype.escape = str => str;

async function digestFile(path: string, id: number) {
  const dom = await JSDOM.fromFile(path);
  const window = dom.window;
  const document = dom.window.document;

  if (!fs.existsSync(`./vpde/${id}`)) fs.mkdirSync(`./vpde/${id}`);

  /////
  // Clean
  /////

  // Remove hidden content
  document.querySelectorAll("div.hidden")
    .forEach(el => el.remove());

  // Remove superfluous information
  document.querySelectorAll(".titlepage")
    .forEach(el => el.remove());

  // Remove autopage links
  document.querySelectorAll("a[id~='-autopage-']")
    .forEach(el => el.remove());

  // Replace any links with just text
  Array.from(document.getElementsByTagName("a"))
    .forEach(el => el.textContent ? el.replaceWith(el.textContent) : el.remove());

  /////
  // Separate
  /////

  const chapters = document.querySelectorAll("section.textbody");
  for (let [i, chapter] of chapters.entries()) {
    console.log("o")
    let sections = [];

    if (!fs.existsSync(`./vpde/${id}/${i}`)) fs.mkdirSync(`./vpde/${id}/${i}`);

    // Breakup annoying blocks
    for (let block of chapter.querySelectorAll(".amsthmbodyclearprint")) {
      const li = block.querySelector("ul > li");
      block.replaceWith(...Array.from(li!.children))
    }

    // Breakup annoying blocks
    for (let block of chapter.querySelectorAll(".amsthmbodyclearprint, .amsthmbodydefinition")) {
      const li = block.querySelector("ul > li");
      block.replaceWith(...Array.from(li!.children))
    }

    let headers = Array.from(chapter.querySelectorAll(".amsthmnameclearprint"));
    let headerContainers: Element[] = headers.map(h => h.parentElement!);

    for (let [headerIndex, headerParent] of headerContainers.entries()) {
      console.log("a", headerParent);

      const container = document.createElement("div");
      const h1 = document.createElement("h1");

      const objType: Element = headerParent.querySelector(".amsthmnameclearprint")!;
      const objRef: Element = headerParent.querySelector(".amsthmnumberclearprint")!;
      const objDescription: Element | null = headerParent.querySelector(".amsthmnoteclearprint");

      h1.textContent = objDescription ?
        `${objType.textContent!.trim()} ${objRef.textContent!.trim()}, ${objDescription.textContent!.trim()}` :
        `${objType.textContent!.trim()} ${objRef.textContent!.trim()}`;

      objType.remove();
      objRef.remove();
      objDescription?.remove();

      nextUntil(headerParent, e => e.querySelector(".amsthmnameclearprint") != null)
        .map(x => container.appendChild(x))

      headerParent.prepend(h1);
      container.prepend(headerParent);

      // @ts-ignore
      let normalisedHtml = normaliseHtml(container);

      // Array.from(normalisedHtml.querySelectorAll("p"))
      //   .filter(p => p.textContent!.trim().startsWith("\\begin"))
      //   .forEach(p => {
      //     p.textContent = '\n$$\n' + p.textContent!.trim() + '\n$$\n'
      //   });

      let formattedHtml = prettier.format(normalisedHtml.outerHTML, { parser: "html" })

      // Fix math
      formattedHtml = formattedHtml
        .replace(/\\\(\s*/g, '$')
        .replace(/\s*\\\)/g, '$')
        .replace(/\\\[/g, "\n$$$$\n")
        .replace(/\\\]/g, "\n$$$$\n")
        .replace(/\\begin{align\*}/g, "\n$$$$\n\\begin{align*}")
        .replace(/\\end{align\*}/g, "\\end{align*}\n$$$$\n");

      let md = new turndown().turndown(formattedHtml);

      //  Use
      // \seteqnumber{0}{2.}{6}$
      // As heuristic for math blocks?

      // Remove trash
      md = md.replace(".  \n" + " ", '');

      // Format markdown
      md = prettier.format(md, { parser: 'markdown' });

      md = md.replace(/(?<!^# )((?:Theorem|Definition|Remark|Proposition|Lemma)[\s\n]+\d.\d+)/g, '[[$1]]')

      fs.writeFileSync(`./vpde/${id}/${i}/${objType.textContent!.trim()} ${objRef.textContent!.trim()}.md`, md);
      sections.push(`${objType.textContent!.trim()} ${objRef.textContent!.trim()}`);
    }

    let ch = `# Chapter ${i} \n\n` + sections.map((file, i) => `${i + 1}. [[${file}]]`).join('\n') + '\n';
    fs.writeFileSync(`./vpde/${id}/${i}/Chapter ${i}.md`, ch)
  }
}

(async () => {
  await Promise.all(globby.sync('/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1714527/mod_resource/content/9/*.html')
    .map(digestFile))
})()
