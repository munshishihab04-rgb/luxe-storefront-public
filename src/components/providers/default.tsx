import { AuthProvider } from "./auth.tsx";
import { ConvexProvider } from "./convex.tsx";
import { QueryClientProvider } from "./query-client.tsx";
import { ThemeProvider } from "./theme.tsx";
import { Toaster } from "../ui/sonner.tsx";
import { TooltipProvider } from "../ui/tooltip.tsx";
import { hasAuthConfiguration } from "./auth-config.ts";

function CoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  const authEnabled = hasAuthConfiguration({
    authority: import.meta.env.VITE_HERCULES_OIDC_AUTHORITY,
    clientId: import.meta.env.VITE_HERCULES_OIDC_CLIENT_ID,
    convexUrl: import.meta.env.VITE_CONVEX_URL,
  });

  if (!authEnabled) return <CoreProviders>{children}</CoreProviders>;

  return (
    <AuthProvider>
      <ConvexProvider>
        <CoreProviders>{children}</CoreProviders>
      </ConvexProvider>
    </AuthProvider>
  );
}
