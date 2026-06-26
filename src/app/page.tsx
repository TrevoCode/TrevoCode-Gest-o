import { redirect } from "next/navigation"

// App de gestão: a "home" é o painel. Sem login, o middleware leva ao /app/login.
export default function Home() {
  redirect("/app")
}
