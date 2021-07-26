import { AuthProvider } from '../../context/Auth.context'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../../scss/Main.scss'
import { ErrorBoundary } from '../../errors/boundary'

const queryClient = new QueryClient()

function Fitlink({ children }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default Fitlink
