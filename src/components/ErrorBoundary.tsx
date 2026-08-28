import React, { ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] w-full p-4 flex items-center justify-center">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-2xl border border-white/10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#ffd79b]/15 border border-[#ffd79b]/30 flex items-center justify-center text-[#ffd79b]">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#ffd79b] mb-2">
              {this.props.fallbackTitle || 'Cosmic Signal Interrupted'}
            </h2>

            <p className="text-xs text-[#d6c4ac] mb-5 leading-relaxed">
              A temporary disturbance occurred in the celestial feed. Your saved memories and cosmic dates remain safe.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd79b] to-[#ffb300] text-[#131125] font-semibold text-xs hover:brightness-110 transition-all shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Starlight Feed</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

