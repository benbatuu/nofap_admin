'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred while rendering this component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Error Details
                </h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>
              
              {this.props.showDetails && this.state.error?.stack && (
                <details className="bg-muted rounded-lg p-4">
                  <summary className="cursor-pointer font-medium mb-2">
                    Stack Trace
                  </summary>
                  <pre className="text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.resetError} variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children, onError }: { 
  children: React.ReactNode
  onError?: (error: Error) => void 
}) {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection')
      setError(error)
      onError?.(error)
      event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [onError])

  if (error) {
    return (
      <ErrorBoundary>
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <h3 className="font-medium text-destructive mb-2">Async Error</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button 
            onClick={() => setError(null)} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      </ErrorBoundary>
    )
  }

  return <>{children}</>
}

// API error boundary for handling API-specific errors
export function APIErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              API Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Failed to communicate with the server'}
            </p>
            <div className="flex gap-2">
              <Button onClick={resetError} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Form error boundary for handling form-specific errors
export function FormErrorBoundary({ children, onError }: { 
  children: React.ReactNode
  onError?: (error: Error) => void 
}) {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <h4 className="font-medium text-destructive mb-2">Form Error</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {error?.message || 'An error occurred while processing the form'}
          </p>
          <Button onClick={resetError} size="sm" variant="outline">
            Reset Form
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}