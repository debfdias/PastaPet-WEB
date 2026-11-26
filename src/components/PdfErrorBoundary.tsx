"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches synchronous render errors thrown by react-pdf / pdf.js (e.g. the
 * worker failing to initialize on mobile Safari). Without this, such a throw
 * bubbles to Next.js's root error page and white-screens the whole app.
 */
export default class PdfErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("PDF preview failed to render:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
