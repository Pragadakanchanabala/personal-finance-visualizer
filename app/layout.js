// app/layout.js
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Personal Finance Visualizer",
  description: "Track your personal finances and visualize spending.",
};

export default function RootLayout({ children }) {
  // A subtle, abstract background image url
  const bgImageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop";

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          {`
            body::before {
              content: '';
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background-image: url('${bgImageUrl}');
              background-size: cover;
              background-position: center;
              filter: blur(8px) brightness(1.1);
              opacity: 0.6;
              z-index: -1;
            }
          `}
        </style>
      </head>
      <body
        className={cn(
          "h-full min-h-screen bg-slate-50/90 font-sans antialiased",
          "dark:bg-slate-900/90"
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

