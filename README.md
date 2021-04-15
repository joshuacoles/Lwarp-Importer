# HTML to Markdown Math Importer

Some scripts to break up and understand
the HTML output of the various html forms
of math notes. These include:

- The lwarp LaTeX utility.
- Gitbook.
- Tex4ht
 
The outputted markdown is designed for use in the Obsidian app,
as a baseline for me to start re-writing the content and cleaning it up.

It is a best effort, it is not pretty nor even necessarily valid or
correct/faithful to the input (this is especially the case with `tex4ht`
output). When working with these notes, it is best to keep a copy open
in a web browser nearby for checking against the actual content itself.

## Rational

PDFs are a pain to work with programmatically,
however often lecturers will offer "accessible"
versions of their notes in HTML form having gone
through the [`lwarp`](https://ctan.org/pkg/lwarp?lang=en) or
[`tex4t`](https://tug.org/tex4ht/) program.

While this output is not necessarily pretty (or even
necessarily standards conforming!), it is much easier to
work with than the PDF files themselves.

This is very heuristic based, it is messy, it is working
with formats that are not meant to be used in this way, if
anyone wants to use this I would suggest you read the code
and take inspiration. I have tried to keep the scripts clean,
but they often require the output of a previous script or worse
a previous version (of which is unlikely to be tracked here).

## Use

Mainly these are used to break out each theorem / definition / etc
into its own file so that they can be connected in an app such as
[Obsidian](https://obsidian.md). However you could also use this as a basis
to transform it into a prettier version of the HTML form, with the addition
of some CSS and HTML clean up.

## Areas for Improvement

Mainly notes for myself for when I inevitably try to do this all again next
semester,

1. Lists, both numbered and bulleted.
2. Block math and the equation environment directly in HTML?
