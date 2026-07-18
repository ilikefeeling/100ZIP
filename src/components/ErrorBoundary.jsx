import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 나중에 Sentry 같은 에러 로깅 도구를 여기에 추가할 수 있습니다.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          padding: '24px', 
          textAlign: 'center', 
          gap: '16px' 
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ font: 'var(--font-heading-2)', color: 'var(--color-text-primary)' }}>일시적인 오류가 발생했습니다</h2>
          <p style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
            잠시 후 다시 시도해주세요.<br/>문제가 지속되면 고객센터로 문의 바랍니다.
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '16px' }}
          >
            홈으로 돌아가기
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
