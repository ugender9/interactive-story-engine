import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interactive Story Engine",
  description: "AI-powered branching adventure stories using IBM Granite",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f0f0f] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
