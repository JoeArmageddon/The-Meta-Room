import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "The Hub - AI Agent Knowledge Base",
  description: "The ultimate resource for AI agents, prompts, patterns, and workflows. Learn, discover, and build better AI systems.",
  keywords: ["AI agents", "prompt engineering", "LLM", "machine learning", "automation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
            <Navigation />
            <main className="pt-16">
              {children}
            </main>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff'
                }
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
