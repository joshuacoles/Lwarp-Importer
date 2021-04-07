import visit from "unist-util-visit-parents";
import { Node } from "unist";
import { VFile } from "vfile";

export default function () {
  return function transformer(tree: Node, file: VFile) {
    visit(tree, 'element', visitor)

    function visitor(node: Node) {
      console.log(node)
    }
  }
}
