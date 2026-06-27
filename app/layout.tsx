import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CinemaGuesser",
  description: "Угадайте, на какой минуте фильма сделан этот кадр.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
