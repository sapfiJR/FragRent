
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRAGRENT — аренда FACEIT аккаунтов",
  description:
    "Каталог FACEIT аккаунтов в аренду. Сравнивай ELO, выбирай подходящий рейтинг и изучай условия.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
