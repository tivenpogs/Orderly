import { Component } from 'react';

// Without this, any render error unmounts the whole app and leaves a blank page.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Orderly crashed while rendering:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-xl border border-line bg-white p-8 text-maroon" role="alert">
        <h1 className="text-2xl font-extrabold">Something went wrong on this page</h1>
        <p className="mt-2 text-sm text-maroon/70">The page hit an error and couldn&apos;t be drawn. Details for debugging:</p>
        <pre className="mt-4 overflow-auto rounded-md bg-sand p-3 text-xs">{String(this.state.error?.stack || this.state.error)}</pre>
        <a href="/" className="mt-5 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">Back to home</a>
      </div>
    );
  }
}
