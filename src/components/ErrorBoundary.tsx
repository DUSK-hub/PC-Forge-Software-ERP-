import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let displayMsg = 'An unexpected error occurred.';
      try {
        if (this.state.errorMsg) {
           const parsed = JSON.parse(this.state.errorMsg);
           if (parsed.error) {
             displayMsg = `Operation failed: ${parsed.error}`;
           }
        }
      } catch (e) {
        displayMsg = this.state.errorMsg || displayMsg;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900 mb-1">Application Error</h2>
                <p className="text-sm text-red-700 break-words">{displayMsg}</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
