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

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />

          <Suspense>{props.children}</Suspense>

          <footer class="container">
            <span class="opacity-80">Processed on your machine, your data is never uploaded. </span>
            <a href="https://github.com/ryoid/dbs-statement2csv" target="_blank">
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
