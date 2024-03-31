class WordTrieNode {
  children: Map<string, WordTrieNode> = new Map()
  indices: number[] = []

  insert(str: string, i: number): void {
    let node: WordTrieNode = this
    const words = str.split(" ")
    for (const word of words) {
      if (!node.children.has(word)) {
        node.children.set(word, new WordTrieNode())
      }
      node = node.children.get(word)!
      node.indices.push(i)
    }
  }

  visualize(prefix: string = "", depth: number = 0): string {
    let result = ""
    if (depth === 0) result += "Root\n"

    const indentation = " ".repeat(depth * 2)

    this.children.forEach((child, word) => {
      result += `${indentation}${word} -> (${child.indices.join(", ")})\n`
      result += child.visualize(prefix + word + " ", depth + 1)
    })

    return result
  }

  static extractGroups(node: WordTrieNode, prefix: string, strings: string[], groups: GroupMap): void {
    if (node.indices.length === 1 || prefix.endsWith(" ")) {
      const key = prefix.trim()
      if (!groups[key]) {
        groups[key] = []
      }
      for (const i of node.indices) {
        groups[key].push(i)
      }
      return
    }
    for (const [word, child] of node.children) {
      WordTrieNode.extractGroups(child, prefix + word + " ", strings, groups)
    }
  }
}

type GroupMap = Record<string, number[]>

export function groupCommonWords(strings: string[]): GroupMap {
  const root = new WordTrieNode()
  for (let i = 0; i < strings.length; i++) {
    root.insert(strings[i], i)
  }
  // console.log(root.visualize());

  const groups: GroupMap = {}
  WordTrieNode.extractGroups(root, "", strings, groups)
  return groups
}
