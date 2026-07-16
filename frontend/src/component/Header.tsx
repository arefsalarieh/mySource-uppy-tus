import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div style={{display : 'flex' , gap : '10px'}}>
      <Link to='/' >Register</Link>
      <Link to='/Login' >Login</Link>
      <Link to='/UppyDashboard' >UppyDashboard</Link>
      <Link to='/AddCourse' >AddCourse</Link>
      <Link to='/GetAllCourses' >GetAllCourses</Link>
      
    </div>
  )
}

export default Header
