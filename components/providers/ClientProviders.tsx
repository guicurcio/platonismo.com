"use client";

import { ThemeProvider } from "next-themes";
import { ReactFlowProvider } from "reactflow";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </ThemeProvider>
  );
}
