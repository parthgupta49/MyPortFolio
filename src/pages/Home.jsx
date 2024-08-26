import React, { useState } from 'react'
import { ReactTyped } from "react-typed";
import landingimage from '../assets/landingimage.png'
import myImage from '../assets/2241237.JPG'
import Icons from '../components/Icons';
import { delay, motion } from 'framer-motion';
const containerVariant = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      ease: 'easeInOut'
    }
  }
}
const iconVariants = {
  hidden: { x: "100vw", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      // delay: 1.5,
      duration: 0.3,
      type: 'spring',
      stiffness: 300
    },
  },

}

const Home = () => {


  // Icons and corresponding texts  

  return (
    <div>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        className='flex flex-col gap-10 pt-[6rem] px-[5rem] overflow-x-hidden
      w-10/12 max-w-[1120px] mx-auto h-screen
      '>
        {/* name and image div */}
        <div className='flex items-center justify-between'>
          {/* name */}
          <div className='flex flex-col gap-7'>
            <p className='text-5xl font-semibold leading-10'>Hi, I am <span className='text-[#7FA1C3]'>Parth</span></p>
            <p className='text-3xl font-bold tracking-wide leading-[2rem]'>
              <ReactTyped strings={["Front End Developer", "Backend Developer", "Full-Stack Web Developer"]} typeSpeed={90} backSpeed={80} loop />
            </p>
            <div><button className='px-4 py-2 rounded-md border'>Download CV</button></div>
            {/* var */}
          </div>

          <div>
            <img src={myImage} className=' bg-cover rounded-full object-cover w-[20rem] h-[20rem] bg-center' />
          </div>

        </div>

        <motion.div className='w-full pt-[7rem]'
        // variants={iconVariants}
        >
          <Icons />
        </motion.div>




      </motion.div>

      <div className='border-t w-10/12 max-w-[1120px] mx-auto pt-10'>
        <h3 className='text-center text-2xl font-bold'>Projects Portfolio</h3>
      </div>

    </div>
  )
}

export default Home