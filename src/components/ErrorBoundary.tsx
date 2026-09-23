import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('tfh_cart');
      localStorage.removeItem('tfh_active_dealer_id');
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EDE3D0] text-[#2C2417] flex items-center justify-center p-4">
          <div className="bg-[#FBF7EE] border border-[#DACBAA] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#9C4630]/15 text-[#9C4630] rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9C4630] block">
                  Application Exception Caught
                </span>
                <h2 className="font-display font-bold text-lg text-[#2C2417]">
                  Something interrupted this screen
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#766A57] leading-relaxed">
              THE FAB HOUSE portal encountered an unexpected runtime issue while rendering. Your saved fabrics, orders, and ledger records remain safely preserved in storage.
            </p>

            {this.state.error && (
              <div className="p-3 bg-[#F3EBDA] border border-[#DACBAA]/60 rounded-xl font-mono text-[11px] text-[#9C4630] overflow-x-auto select-text">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-[#8B5A3C] hover:bg-[#72482E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#DACBAA] hover:bg-[#F3EBDA] text-[#2C2417] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-[#8B5A3C]" />
                <span>Recover to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
