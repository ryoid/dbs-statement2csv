import { A } from "@solidjs/router"

export default function NotFound() {
  return (
    <main class="container">
      <h1>404: Page not found</h1>

      <div>
        Return to{" "}
        <A class="text-blue-500 hover:text-blue-600" href="/">
          home
        </A>
      </div>
    </main>
  )
}
