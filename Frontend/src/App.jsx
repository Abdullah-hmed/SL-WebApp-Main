import Auth from './components/Auth.jsx'
import AppLayout from './components/AppLayout.jsx'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isAuthenticated } from './components/utils/authUtils.jsx'
import ProtectedRoutes from './components/utils/ProtectedRoutes.jsx'


function App() {

  const userIsAuthenticated = isAuthenticated();
  // const userIsAuthenticated = true;
  
  return (
    <>
    <Toaster containerStyle={{ bottom: 75 }} position='bottom-center' reverseOrder={false} toastOptions={{duration: 1000}} />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoutes/>}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
