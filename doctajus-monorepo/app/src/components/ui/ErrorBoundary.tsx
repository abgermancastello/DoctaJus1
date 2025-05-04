import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          title="Ha ocurrido un error en la aplicación"
          subTitle={this.state.error?.message || 'Error desconocido'}
          extra={[
            <Button type="primary" key="reset" onClick={this.handleReset}>
              Reintentar
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          ]}
        >
          {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-left overflow-auto max-h-96">
              <details>
                <summary className="cursor-pointer font-medium">Detalles del error</summary>
                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
                <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
