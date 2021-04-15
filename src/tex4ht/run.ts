import * as path from "path";
import globby from "globby";

import fss from "fs";
import fsp from "fs/promises";
import { JSDOM } from "jsdom";
import { install, xsltProcess } from "xslt-ts";

import tempfile from "tempfile";

import Turndown from "turndown";
import { exec, execSync } from "child_process"
import { arrowBBoxW } from "mathjax-full/js/output/common/Notation";

// Replace escape
Turndown.prototype.escape = s => s;
const turndown = new Turndown();

const root = '/Users/joshuacoles/Documents/University/NotesSnaps/moodle.bath.ac.uk/pluginfile.php/1625344/mod_resource/content/13/MA10209-notes';
const outRoot = 'tex4ht';

const mdOut = path.join(outRoot, 'mds');
const resOut = path.join(outRoot, 'res');

fss.mkdirSync(mdOut, { recursive: true });
fss.mkdirSync(resOut, { recursive: true });

const resources = globby.sync(path.posix.join(root, '**/*.{svg,png,jpeg,jpg}'));
resources.forEach(r => fss.copyFileSync(r, path.join(resOut, path.basename(r))));

const htmls = globby.sync(path.posix.join(root, '**/*.html'));

(async () => {
  console.log("HEY")

  for (let htmlPath of htmls) {
    let html = await fsp.readFile(htmlPath, 'utf-8');
    html = html.replaceAll('".MathJax_MathML"', '.null-selector');
    const tf = tempfile('.html');
    await fsp.writeFile(tf, html);

    await fsp.writeFile(path.join(mdOut, '0-' + path.basename(htmlPath, '.html') + '.html'), html);

    const dom = await JSDOM.fromFile(tf);
    install(new dom.window.DOMParser(), new dom.window.XMLSerializer(), dom.window.document.implementation);

    const document = dom.window.document;
    await Promise.all(Array.from(document.querySelectorAll('math')).map(async math => {
      let mode = math.getAttribute('display');
      console.log(mode);

      const el = document.createElement(mode === 'inline' ? 'span' : 'div');
      el.className = `math math-${mode}`;
      const xmlFile = tempfile('.xml');
      fss.writeFileSync(xmlFile, math.outerHTML.replaceAll('&nbsp;', ' '));

      let tex = await new Promise(((resolve, reject) => {
        exec(`/usr/local/anaconda3/bin/xsltproc /Users/joshuacoles/Downloads/xsltml_2.1.2/mmltex.xsl ${xmlFile}`, (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            reject(error);
          } else {
            resolve(stdout)
          }
        })
      }))

      el.textContent = execSync(`/usr/local/anaconda3/bin/xsltproc /Users/joshuacoles/Downloads/xsltml_2.1.2/mmltex.xsl ${xmlFile}`)
        .toString('utf-8')
      // el.textContent = mathmlToLatex.convert(math.outerHTML);

      math.replaceWith(el);
    }))

    // await fsp.writeFile(path.join(mdOut, '1-' + path.basename(htmlPath)), dom.serialize());

    let relHtml = document.getElementById('main')?.outerHTML || document.body.outerHTML;

    await fsp.writeFile(path.join(mdOut, '2-' + path.basename(htmlPath, '.html') + '.md'), turndown.turndown(relHtml));
  }
})();

