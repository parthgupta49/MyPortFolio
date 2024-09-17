import React from 'react'
import FrontContent from '../components/homePage/FrontContent';
import Projects from './Projects';
import { useNavigate } from 'react-router';
import Socials from '../components/homePage/Socials';
import HorizontalLine from '../components/homePage/HorizontalLine';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className='relative'>
      <FrontContent />
      <HorizontalLine/>
      {/* Projects */}
      <p className='text-5xl  font-medium text-white  text-center mt-10'>Projects</p>
      <span onClick={()=>navigate("/projects")} className=' cursor-pointer'><Projects/></span>
      <HorizontalLine/>
      {/* Social Links */}
      <p className='text-3xl  font-medium text-white  text-center mt-10 w-full'>Connect With Me</p>
      <Socials/>
    </div>
  )
}

export default Home