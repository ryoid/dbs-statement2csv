import { A } from "@solidjs/router"

export default function NotFound() {
  return (
    <main class="container">
      <h1>404: Page not found</h1>

      <div>
        Return to <A href="/">home</A>
      </div>
    </main>
  )
}
