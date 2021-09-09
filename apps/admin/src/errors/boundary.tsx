import React from 'react'
import Feedback from '../components/elements/Feedback'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'

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
      return (
        <Login title="Login">
          <div className="text-center">
            <Logo height={32} />
            <h1 className="h6 mt-2 color-grey">
              An unexpected error has occurred.
            </h1>
            <p>
              Please contact support at support@fitlinkapp.com if the issue
              persists.
            </p>
            <Feedback type="error" message={this.state.error} />
          </div>
        </Login>
      )
    }

    return this.props.children
  }
}
