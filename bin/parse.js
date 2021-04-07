#!/usr/bin/env node

import { inspect } from "util";
import * as fs from 'fs';
import { stringInput, Tree } from "lezer-tree";
import { parser } from "../dist/index.es.js";

function printTree(tree, input, from = 0, to = input.length) {
  if (typeof input === "string") input = stringInput(input);
  let out = "";
  const c = tree.cursor();
  const childPrefixes = [];
  for (;;) {
    const { type } = c;
    const cfrom = c.from;
    const cto = c.to;
    let leave = false;
    if (cfrom <= to && cto >= from) {
      if (!type.isAnonymous) {
        leave = true;
        if (!type.isTop) {
          out += "\n" + childPrefixes.join("");
          if (c.nextSibling() && c.prevSibling()) {
            out += " ?? ";
            childPrefixes.push(" ?  ");
          } else {
            out += " ?? ";
            childPrefixes.push("    ");
          }
        }
        out += type.name;
      }
      const isLeaf = !c.firstChild();
      if (!type.isAnonymous) {
        const hasRange = cfrom !== cto;
        out += ` ${
          hasRange ? `[${inspect(cfrom)}..${inspect(cto)}]` : inspect(cfrom)
        }`;
        if (isLeaf && hasRange) {
          out += `: ${inspect(input.read(cfrom, cto))}`;
        }
      }
      if (!isLeaf || type.isTop) continue;
    }
    for (;;) {
      if (leave) childPrefixes.pop();
      leave = c.type.isAnonymous;
      if (c.nextSibling()) break;
      if (!c.parent()) return out;
      leave = true;
    }
  }
}

let filename = process.argv[2];
let input = fs.readFileSync(filename, 'utf8');
let tree = parser.configure({ strict: true }).parse(input);
console.log(printTree(tree, input));