import { Meta, MetaProvider, Title } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense } from "solid-js"
import "./app.css"

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>DBS Statement Converter from PDF to CSV</Title>
          <Meta name="description" content="Convert Credit Card Statement transactions from PDF to CSV" />

          <Suspense>{props.children}</Suspense>

          <footer class="container">
            <span class="opacity-80">Processed on your machine, your data is never uploaded. </span>
            <a
              class="text-blue-500 hover:text-blue-600"
              href="https://github.com/ryoid/dbs-statement2csv"
              target="_blank"
            >
              Source Code
            </a>
          </footer>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
