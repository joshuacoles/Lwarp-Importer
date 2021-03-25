import { JSDOM } from "jsdom";
import * as fs from "fs";

import { normaliseHtml, nextUntil, explode } from "./job";

import turndown from "turndown";
import prettier, { doc } from "prettier";
import globby from "globby";
import * as path from "path";

// Remove escaping in markdown to stop it messing up maths.
// We may need to make this more sensible to only allow through maths
turndown.prototype.escape = str => str;

async function convertFile(path: string, i: number): Promise<string[]> {
  const dom = await JSDOM.fromFile(path);
  const window = dom.window;
  const document = dom.window.document;

  /////
  // Clean HTML
  /////

  // Remove preamble
  document.querySelectorAll("div.hidden")
    .forEach(el => el.remove());

  // Remove superfluous information
  document.querySelectorAll(".titlepage")
    .forEach(el => el.remove());

  // Remove autopage links
  document.querySelectorAll("a[id~='-autopage-']")
    .forEach(el => el.remove());

  // Replace any links with just text
  document.querySelectorAll("a")
    .forEach(el => el.textContent ? el.replaceWith(el.textContent) : el.remove());

  /////
  // Separate
  /////

  // We occasionally get HTML files which are concatenated files, with multiple sections.
  // Hence we separate each out.
  const sections = document.querySelectorAll("section.textbody");
  const sectionMds: string[] = [];

  for (let [sectionIndex, section] of sections.entries()) {
    // Breakup annoying blocks
    for (let block of section.querySelectorAll(".amsthmbodyclearprint, .amsthmbodydefinition")) {
      const li = block.querySelector("ul > li");
      block.replaceWith(...Array.from(li!.children))
    }

    let headers = Array.from(section.querySelectorAll(".amsthmnameclearprint, .amsthmnamedefinition"));
    let headerContainers: Element[] = headers.map(h => h.parentElement!);

    // Replace fake headers with actual h2's
    for (let [headerIndex, headerParent] of headerContainers.entries()) {
      const header = document.createElement("h6");

      const objType: Element = headerParent.querySelector(".amsthmnameclearprint, .amsthmnamedefinition")!;
      const objRef: Element | null = headerParent.querySelector(".amsthmnumberclearprint, .amsthmnumberdefinition");
      // We choose to ignore this to help with the automatic referencing.
      // const objDescription: Element | null = headerParent.querySelector(".amsthmnoteclearprint, .amsthmnotedefinition");

      // Construct new title line
      header.textContent = `${objType.textContent!.trim()} ${objRef?.textContent?.trim() ?? ""}`;

      // Add new header and remove old
      headerParent.insertBefore(header, objType);

      objType.remove();
      objRef?.remove();
    }

    ////
    // Convert to md
    ////

    let normalisedHtml = normaliseHtml(section);
    let formattedHtml = prettier.format(normalisedHtml.outerHTML, { parser: "html" })

    // Fix math
    formattedHtml = formattedHtml
      // For some reason we are escaping underscores... stop this please
      .replaceAll("\\_", "_")
      .replace(/\\\(\s*/g, '$')
      .replace(/\s*\\\)/g, '$')
      .replace(/\\\[/g, "\n$$$$\n\n")
      .replace(/\\\]/g, "\n\n$$$$\n\n")
      // Equation blocks we just strip the being/end, they can just be $$ ... $$
      .replace(/\\begin{equation\*?}/g, "\n\n$$$$\n\n")
      .replace(/\\end{equation\*?}/g, "\n\n$$$$\n\n")
      // Everything else, we preserve and wrap in $$'s
      .replace(/\\begin{([\w]+\*?)}/g, '\n\n$$$$\n\n\\being{$1}\n\n')
      .replace(/\\end{([\w]+\*?)}/g, '\n\n\\end{$1}\n\n$$$$\n\n');
    // .replace(/\$\\seteqnumber\{.+\}\{(\d+).?\}\{(\d+)\}\$/mg, '$$$$\n$3\n$$$$\n^$1-$2\n\n');

    let md = new turndown().turndown(formattedHtml);

    // Remove trash
    md = md.replaceAll(".  \n" + " ", '');
    md = md.replaceAll(" ", " ");
    md = md.replaceAll(" ", " ");

    //// TODO: Do I want to move this into the HTML stage
    // md = md.replace(/\$\\seteqnumber\{.+\}\{(.+)\}\{(.+)\}\$\n+[^$]+\$\$(.+)\$\$/gm, '$$$$\n$3\n$$$$\n^$1$2\n\n');

    // Format markdown
    md = prettier.format(md, { parser: 'markdown' });

    md = md.replace(/(?<!^# )((?:Theorem|Definition|Remark|Proposition|Lemma|Example|Corollary)[\s\n]+\d.\d+)/g, '[[$1]]')
    md = md.replace(/\((\d+).(\d+)\)/g, '[[^$1]]')

    sectionMds.push(md);
  }

  return sectionMds;
}

async function job(out: string, files: string[]) {
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });

  const mds: string[] = (await Promise.all(files.map(convertFile))).flat();
  mds.map((md, i) => fs.writeFileSync(path.join(out, `${i}.md`), md));
}

(async () => {
  await job(
    './out/anal-2',
    globby.sync('/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1578210/mod_resource/content/9/**/*.html')
  );

  await job(
    './out/alg-2',
    globby.sync('/Users/joshuacoles/Documents/University/NotesSnaps/people.bath.ac.uk/feb/ma20216/notes/**/*.html')
  );

  await job(
    './out/vector-calc',
    globby.sync('/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1714527/mod_resource/content/9/**/*.html')
  );
})()
