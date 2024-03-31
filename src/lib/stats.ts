class TrieNode {
  children: Map<string, TrieNode>
  indices: number[]

  constructor() {
    this.children = new Map()
    this.indices = []
  }

  insert(str: string, i: number) {
    let node: TrieNode = this
    for (const char of str) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)!
      node.indices.push(i)
    }
  }

  visualize(prefix: string = "", depth: number = 0): string {
    let result = ""
    if (depth === 0) result += "Root\n"

    const indentation = " ".repeat(depth * 2)

    this.children.forEach((child, char) => {
      result += `${indentation}${char} -> (${child.indices.join(", ")})\n`
      result += child.visualize(prefix + char, depth + 1)
    })

    return result
  }

  static extractGroups(node: TrieNode, prefix: string, strings: string[], groups: GroupMap) {
    if (node.indices.length === 1 || prefix.endsWith(" ")) {
      const key = prefix.includes(" ") ? prefix.trim() : strings[node.indices[0]]
      if (!groups[key]) {
        groups[key] = []
      }
      for (const i of node.indices) {
        groups[key].push(i)
      }
      return
    }
    for (const [char, child] of node.children) {
      TrieNode.extractGroups(child, prefix + char, strings, groups)
    }
  }
}

type GroupMap = Record<string, number[]>

export function groupCommonWords(strings: string[]): GroupMap {
  const root = new TrieNode()
  for (let i = 0; i < strings.length; i++) {
    root.insert(strings[i], i)
  }
  // console.log(root.visualize());

  const groups: GroupMap = {}
  TrieNode.extractGroups(root, "", strings, groups)
  return groups
}
