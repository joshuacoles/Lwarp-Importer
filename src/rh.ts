import fs from "fs";
import fromMarkdown from "mdast-util-from-markdown";
import toMarkdown from "mdast-util-to-markdown";
// @ts-ignore
import syntax from "micromark-extension-math";
// @ts-ignore
import math from "mdast-util-math";

// const doc = fs.readFileSync('/Users/joshuacoles/checkouts/jc3091/lwarp-importer/out/alg-2/14.md');
const doc = `
# Hey

$$ x = 1 $$
`

const tree = fromMarkdown(doc, {
  extensions: [syntax],
  mdastExtensions: [math.fromMarkdown]
});

console.log(tree)

fs.writeFileSync('./xx.json', JSON.stringify(tree));

const out = toMarkdown(tree, { extensions: [math.toMarkdown] });

console.log(out)
