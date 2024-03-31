import * as pdfjs from "pdfjs-dist"

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

export { pdfjs }
