import { ErrorBoundary } from '@repo/ui';
import config from '@/../plugin.config.mjs';

export function PluginErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary config={config}>{children}</ErrorBoundary>;
}
