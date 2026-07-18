import React from "react";

type Props = { children: React.ReactNode; label?: string };

type State = { hasError: boolean; error?: Error | null; info?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, info: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info: info.componentStack ?? undefined });
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-white p-6 text-center shadow-[var(--shadow-lg)]">
            <h2 className="text-lg font-semibold text-heading">
              {this.props.label ?? "Something went wrong"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              This part of the page hit an unexpected error. You can try reloading — your progress
              elsewhere is safe.
            </p>
            {this.state.error?.message ? (
              <pre className="mt-4 max-h-40 overflow-auto rounded-[var(--radius)] border border-border-soft bg-page-background-alt p-3 text-left text-xs text-muted">
                {this.state.error.message}
              </pre>
            ) : null}
            <button
              onClick={() => location.reload()}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--crimson-hover)]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
