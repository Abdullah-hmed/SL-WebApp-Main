import Auth from './components/Auth.jsx'
import AppLayout from './components/AppLayout.jsx'
import WebcamProcessor from './components/WebcamProcessor.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { isAuthenticated } from './components/utils/authUtils.jsx'
import ProtectedRoutes from './components/utils/ProtectedRoutes.jsx'


function App() {

  const userIsAuthenticated = isAuthenticated();
  // const userIsAuthenticated = true;
  
  return (
    <>
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
