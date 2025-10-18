import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Loading } from './components/loading'
import React from 'react'

function App() {
  return (
    <React.Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </React.Suspense>
  )
}

export default App
