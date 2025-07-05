// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css"; // Your global CSS
import { cn } from "@/lib/utils"; // Import cn utility from shadcn

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Finance Visualizer",
  description: "Track your personal finances and visualize spending.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        {children}
      </body>
    </html>
  );
}