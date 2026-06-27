import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jAudioCassette = localFont({
  src: "./fonts/j_audio_cassette/J Audio Cassette.woff2",
  display: "swap",
});

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
      <body className={jAudioCassette.className}>{children}</body>
    </html>
  );
}
