import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorCodes, logInternalError, resolveError } from '../utils/appErrors';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  code: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      code: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const resolved = resolveError(error, ErrorCodes.UNKNOWN);
    return {
      hasError: true,
      message: resolved.message,
      code: resolved.code,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logInternalError({ error, componentStack: info.componentStack }, ErrorCodes.UNKNOWN);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.hash = '#/';
    this.setState({ hasError: false, message: '', code: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <h1>{this.props.fallbackTitle ?? 'خطایی رخ داده است'}</h1>
            <p className="error-boundary-message">{this.state.message}</p>
            {this.state.code && (
              <p className="error-boundary-code">
                کد خطا: <span dir="ltr">{this.state.code}</span>
              </p>
            )}
            <div className="error-boundary-actions">
              <button type="button" className="error-boundary-btn primary" onClick={this.handleReload}>
                بارگذاری مجدد
              </button>
              <button type="button" className="error-boundary-btn secondary" onClick={this.handleGoHome}>
                بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
