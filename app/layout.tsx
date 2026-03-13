import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Meta Room - AI Skills & Agents Knowledge Base',
  description: 'A searchable knowledge base and explorer for AI skills, agents, and prompt systems.',
  keywords: ['AI', 'skills', 'agents', 'prompts', 'knowledge base', 'LLM'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>The Meta Room - AI Skills & Agents Knowledge Base</p>
                </div>
              </footer>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
