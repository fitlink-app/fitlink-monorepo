import React from 'react'

export class ErrorBoundary extends React.Component {
  state: { hasError: boolean; error: string }

  constructor(props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo)
    this.setState({
      ...this.state,
      error: error.toString()
    })
  }

  render() {
    if (this.state.hasError) {
      return <h1>Error: {this.state.error}</h1>
    }

    return this.props.children
  }
}
