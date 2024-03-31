// import * as pdfjsModule from "pdfjs-dist"
// const pdfjs = ("default" in pdfjsModule ? pdfjsModule["default"] : pdfjsModule) as typeof pdfjsModule

// // https://github.com/wojtekmaj/react-pdf/blob/main/packages/react-pdf/README.md#configure-pdfjs-worker
// // pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString()
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

// export default pdfjs

import * as pdfjs from "pdfjs-dist"
// @ts-expect-error pdfjs-dist does not have types
import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs"

// Setting worker path to worker bundle.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

export { pdfjs }
