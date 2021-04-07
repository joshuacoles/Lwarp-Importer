import * as fs from "fs";

import parseHtml from "rehype-parse";
// @ts-ignore
import rehype2remark from "rehype-remark";

import stringify from "remark-stringify";

import math from "remark-math";
import markdown from "remark-parse";
import unified from "unified";
import rehypeMath from "./rehypeMath";
import inspect from "unist-util-inspect";
import plugin from "./plugin";

const html = `
<h1> Title </h1>

<span>\\(Math\\)</span>
`

const md = `$hey$`

const astMd = unified().use(markdown).use(math).parse(md)

fs.writeFileSync('./s.json', JSON.stringify(astMd));

const ast = unified()
  .use(parseHtml)
  .use(plugin)
  .use(rehypeMath)
  .use(rehype2remark)
  .use(stringify)
  .processSync(html);

fs.writeFileSync('./j.json', JSON.stringify(ast))

// console.log(unified()
//   .use(parseHtml)
//   .use(rehypeMath)
//   .use(rehype2remark)
//   .processSync(html))/*
//   // .use(markdown)
//   .use(stringify)
//   .processSync(html).contents);
// */
