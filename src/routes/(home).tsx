import type { TextItem } from "pdfjs-dist/types/src/display/api"
import { For, Show, createMemo, createSignal } from "solid-js"
import { groupCommonWords } from "~/lib/stats"

const START_TX_HEADER = /NEW TRANSACTIONS/
const END_TX_HEADER = /GRAND TOTAL FOR ALL CARD ACCOUNTS:/

// DD MMM
const MONTHS_MMM = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const TX_PREFIX = new RegExp(`(\\d{2})\\s(${MONTHS_MMM.join("|")})`)

type Tx = { date: string; desc: string; amount: string }

function replaceFilenameExt(filename: string, currentExt: string, newExt: string) {
  let lastIndex = filename.lastIndexOf(currentExt)
  if (lastIndex === -1) {
    throw new Error(`Invalid filename, does not contain ${currentExt} extension`)
  }
  return filename.slice(0, lastIndex) + newExt + filename.slice(lastIndex + currentExt.length)
}

export default function Home() {
  const [result, setResult] = createSignal<{
    url: string
    filename: string
    txs: Tx[]
  }>()

  async function convertPdf(formData: FormData) {
    const file = formData.get("file") as File
    console.log("file", file)
    const { pdfjs } = await import("~/lib/pdfjs")

    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise

    console.log("doc", doc.numPages, doc)

    let inTxTable = false
    const txs: Tx[] = []

    let txDate: string | null = null
    let txDesc: string | null = null
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const textContent = (await page.getTextContent().then((content) => content.items)).filter(
        (item): item is TextItem => "str" in item && item.str !== "" && item.str !== " "
      )

      // walk textContent.items.str to find the start header
      for (let j = 0; j < textContent.length; j++) {
        const item = textContent[j]

        if (START_TX_HEADER.test(item.str)) {
          inTxTable = true
        }
        if (!inTxTable) continue
        if (END_TX_HEADER.test(item.str)) {
          inTxTable = false
          break
        }

        if (TX_PREFIX.test(item.str)) {
          txDate = item.str
          txDesc = null
          continue
        }

        if (!txDate) continue

        // peek next if it's a TX_PREFIX or end
        const nextStr = textContent[j + 1]?.str
        if (
          j + 2 >= textContent.length ||
          (nextStr &&
            (TX_PREFIX.test(nextStr) ||
              /SUB-TOTAL/.test(nextStr) ||
              /DBS Cards P.O. Box/.test(nextStr) ||
              /\d+\sof\s\d+/.test(nextStr) ||
              nextStr === "CR"))
        ) {
          let amount = item.str.replaceAll(",", "")
          if (nextStr === "CR") {
            amount = "-" + amount
          }

          // means current should be amount
          txs.push({ date: txDate, desc: txDesc ?? "", amount })
          txDate = null
          txDesc = null
          continue
        }

        // Collect as strings
        txDesc = txDesc ? txDesc + " " + item.str : item.str
      }
    }

    // export txs as csv
    console.log("txs", txs)
    const headers = ["Date", "Description", "Amount"]
    const csv = headers.join(",") + "\n" + txs.map((tx) => `${tx.date},${tx.desc},${tx.amount}`).join("\n")
    // export to object
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    setResult({ url, filename: replaceFilenameExt(file.name, ".pdf", ".csv"), txs })
  }
  return (
    <main class="container">
      <h1>DBS Statement Converter</h1>
      <p>Convert Credit Card Statement transactions from PDF to CSV</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          convertPdf(formData)
        }}
        class="my-4 space-y-4"
      >
        <div class="flex flex-col">
          <label for="file">Select PDF file</label>
          <input
            onInput={(e) => {
              // trigger form submission
              e.currentTarget.form?.dispatchEvent(new Event("submit"))
            }}
            type="file"
            name="file"
            id="file"
            accept="application/pdf"
          />
        </div>
        <button type="submit">Convert</button>
      </form>

      <Show when={result()}>
        {(result) => {
          const groups = createMemo(() => {
            const grouped = groupCommonWords(result().txs.map((tx) => tx.desc.toUpperCase()))
            // convert to array and sort number of indices
            return Object.entries(grouped)
              .map(([key, indices]) => {
                let sum = 0
                for (const i of indices) {
                  const num = Number(result().txs[i].amount)
                  if (isNaN(num)) continue
                  sum += num
                }
                return { key, indices, sum }
              })
              .sort((a, b) => b.sum - a.sum)
          })
          const sum = () =>
            result().txs.reduce((acc, tx) => {
              const num = Number(tx.amount)
              if (isNaN(num)) return acc
              return acc + num
            }, 0)
          return (
            <div>
              <div>
                <h2>Parsed Statement</h2>
                <a href={result().url} download={result().filename} class="py-2 block">
                  Download CSV
                </a>

                {/* Stats */}
                <div>
                  <table>
                    <tbody>
                      <tr>
                        <td>Total Transactions</td>
                        <td>{result().txs.length}</td>
                      </tr>
                      <tr>
                        <td>Total Amount</td>
                        <td>{sum().toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table>
                    <thead>
                      <tr>
                        <th colSpan={3}>Summary</th>
                      </tr>
                      <tr>
                        <th>Group</th>
                        <th>Count</th>
                        <th>Sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={groups()}>
                        {(group) => (
                          <tr>
                            <td>{group.key}</td>
                            <td>{group.indices.length}</td>
                            <td>{group.sum.toLocaleString()}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th colSpan={3}>Transactions</th>
                  </tr>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={result().txs}>
                    {({ date, desc, amount }) => {
                      const displayAmount = () => {
                        const num = Number(amount)
                        if (isNaN(num)) return amount
                        return num.toLocaleString()
                      }
                      return (
                        <tr>
                          <td>{date}</td>
                          <td>{desc}</td>
                          <td>{displayAmount()}</td>
                        </tr>
                      )
                    }}
                  </For>
                </tbody>
              </table>
            </div>
          )
        }}
      </Show>
    </main>
  )
}
