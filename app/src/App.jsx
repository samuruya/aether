import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Nav from './comp/Nav'
import './App.css'
import { Container, Stack } from "react-bootstrap";
import { AuthContext } from './context/AuthContext'
import { useContext } from "react"
import Login from './pages/login'
import Register from './pages/reg'
import Hub from './pages/hub'
import U from './pages/u'
import{Routes, Route, Navigate} from "react-router-dom"


function App() {
  const { user } = useContext(AuthContext)
  return (
    <>
      <Stack direction="vertical" style={{width: '100%'}}>
      <Nav />
      <div>
      <Routes>
        <Route path="/" element = {user ? <Hub/> : <Login/>} />
        <Route path="/Login" element = {user ? <Hub/> : <Login/>} />
        <Route path="/Register" element = {user ? <Hub/> : <Register/>} />
        <Route path="/u" element = {user ? <U/> : <Register/>}/>
        <Route path="*" element = {<Navigate to= "/"/>} />
      </Routes>
      </div>
      </Stack>
    </>
  )
}

export default App
