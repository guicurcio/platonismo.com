import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "platonismo.com – infinite canvas with non-linear thinking",
  description:
    "platonismo.com is a web-based infinite canvas that lets you place and organize different types of content—videos, images, text notes, code snippets, and color swatches—in a freeform layout. Everything is draggable, zoomable, and easy to edit, providing a visually driven workspace for brainstorming, prototyping, or storing references.",
  keywords: [
    "platonismo",
    "infinite canvas",
    "drag-and-drop",
    "videos",
    "images",
    "text notes",
    "code snippets",
    "color swatches",
    "brainstorm",
    "prototype",
    "web-based workspace",
    "tldraw",
    "ultra.tf",
    "mural",
    "FigJam",
    "draw.io",
    "Excalidraw",
    "Miro",
    "LimanDoc",
    "Freehand",
    "Muse Canvas",
    "decker",
  ],
  openGraph: {
    title: "platonismo.com – The Infinite Canvas Web App",
    description:
      "A clean, minimal, and visually driven workspace for organizing videos, images, text, and more on a freeform canvas.",
    url: "https://platonismo.com",
    siteName: "platonismo.com",

    images: [
      {
        url: "https://platonismo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "platonismo.com – The Infinite Canvas Web App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "platonismo.com – The Infinite Canvas Web App",
    description:
      "Organize, brainstorm, and store references in a single flexible, draggable, zoomable canvas space.",

    images: ["https://platonismo.com/og-image.jpg"],

    creator: "@YourTwitterHandle",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load external scripts or meta tags here if absolutely needed */}
        <script
          async
          src="https://platform.twitter.com/widgets.js"
          charSet="utf-8"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground`}
      >
        {/* 3. Wrap the app in ClientProviders for ThemeProvider, ReactFlow, etc. */}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
