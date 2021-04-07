import visit, { Visitor } from "unist-util-visit-parents";
import h from "hastscript";
import { Node, Parent } from "unist";
import { VFile } from "vfile";
import R from "ramda";

export default () => transformer;

function transformer(tree: Node, file: VFile) {
  visit(tree, "text", visitor);

  function visitor(node: Node & { type: 'text', value: string }, ancestors: Node[]) {
    try {
      let nodes = new BracketTexParser(node).parse();
      let parent: Parent = ancestors[ancestors.length - 1] as Parent;

      let index = parent.children.findIndex((child) => child === node);
      parent.children.splice(index, 1, ...nodes);

      return index + nodes.length;
    } catch (e) {
      file.message("Bad dollar signs.");
    }
  }
}

abstract class MathParser {
  parts: Node[] = [];
  buffer: string = '';
  mode: 'text' | 'mathInline' | 'mathDisplay';

  content: string;

  constructor(textNode: Node & { type: 'text', value: string }) {
    if (textNode.type !== 'text') throw new Error('Invalid Node type');

    this.content = textNode.value;
    this.mode = 'text';
  }

  static makeNode: Record<typeof MathParser.prototype.mode, (v: string) => Node> = {
    text(value: string): Node {
      return { type: "text", value };
    },

    mathInline(tex: string): Node {
      return h("span", { class: "math-inline" }, [tex]);
    },

    mathDisplay(tex: string): Node {
      return h("div", { class: "math-display" }, [tex]);
    },
  }

  pushNode(makeNode: (buf: string) => Node) {
    if (this.buffer !== "") {
      this.parts.push(makeNode(this.buffer));
      this.buffer = "";
    }
  }

  transitionTo(to: typeof MathParser.prototype.mode) {
    this.pushNode(MathParser.makeNode[this.mode]);
    this.mode = to;
  }

  abstract parse(): void
}

class DollarTexParser extends MathParser {
  parse() {
    let content = this.content;

    for (let index = 0; index < content.length; index++) {
      if (content[index] === '$') {
        // Is it escaped?
        if (content[index - 1] === '\\') {
          this.buffer = R.dropLast(1, this.buffer);
          continue;
        }

        // If we are in text mode atm, this will be the start of a math block
        if (this.mode === "text") {
          // End the current node
          this.pushNode(MathParser.makeNode.text);

          // Do we have a double dollar?
          // Change mode
          if (content[index + 1] === "$") {
            this.mode = "mathDisplay";
            // Skip over the second dollar
            index++;
          } else {
            this.mode = "mathInline";
          }

          continue;
        }

        if (this.mode === "mathInline") {
          this.transitionTo('text');
        }

        if (this.mode === 'mathDisplay') {
          if (content[index + 1] === "$") {
            this.transitionTo('text');

            // Skip over second dollar
            index++;
          } else {
            throw new Error(`Expected $ at position ${index + 1}`);
          }
        }
      } else {
        this.buffer += content[index];
      }
    }

    // If everything has been closed properly, we have been reading till the end
    // of the node in text mode, if so push it; else erorr.
    if (this.mode === "text") {
      this.pushNode(MathParser.makeNode.text);
    } else {
      throw new Error(`Text node ends in math mode.`);
    }

    return this.parts;
  }
}

class BracketTexParser extends MathParser {
  parse() {
    let content = this.content;

    for (let index = 0; index < content.length; index++) {
      if (this.mode === 'text') {
        if (content[index] === '\\' && content[index + 1] === '(') {
          this.transitionTo('mathInline');
          index++;
        } else if (content[index] === '\\' && content[index + 1] === '[') {
          this.transitionTo('mathDisplay');
          index++;
        } else {
          this.buffer += content[index];
        }

        continue;
      }

      if (this.mode === 'mathInline') {
        if (content[index] === '\\' && content[index + 1] === ')') {
          this.transitionTo('text');
          index++;
        } else {
          this.buffer += content[index];
        }

        continue;
      }

      if (this.mode === 'mathDisplay') {
        if (content[index] === '\\' && content[index + 1] === ']') {
          this.transitionTo('text');
          index++;
        } else {
          this.buffer += content[index];
        }

        continue;
      }
    }

    // If everything has been closed properly, we have been reading till the end
    // of the node in text mode, if so push it; else erorr.
    if (this.mode === "text") {
      this.pushNode(MathParser.makeNode.text)
    } else {
      throw new Error(`Text node ends in math mode.`);
    }

    return this.parts;
  }
}
