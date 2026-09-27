import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold font-serif mb-2">कुछ तकनीकी समस्या आई है</h1>
            <p className="text-sm text-slate-300 mb-6">
              पेज लोड करने में रुकावट आई है। कृपया पेज को रीफ्रेश करें या मुख्य पृष्ठ पर जाएं।
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-950/60 rounded-lg text-left text-xs font-mono text-red-300 border border-red-900/40 break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                पेज रीफ्रेश करें
              </button>
              <button
                onClick={this.handleReset}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                मुख्य पृष्ठ पर जाएं
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

