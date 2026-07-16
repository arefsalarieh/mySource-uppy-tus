import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div style={{display : 'flex' , gap : '10px'}}>
      <Link to='/' >Register</Link>
      <Link to='/Login' >Login</Link>
      <Link to='/UppyDashboard' >UppyDashboard</Link>


      
    </div>
  )
}

export default Header
