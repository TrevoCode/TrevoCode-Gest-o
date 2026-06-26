import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "TrevoCode · Gestão", template: "%s · TrevoCode Gestão" },
  description: "Plataforma interna de gestão da TrevoCode.",
  // Ferramenta interna: fora dos índices de busca.
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  )
}
