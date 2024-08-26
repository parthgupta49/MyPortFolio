import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
const pathVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,

    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  }
}

const listItemsVariants = {
  hover: {
    scale: 1.2,
    color: '#7FA1C3',
  }
}
const Navbar = () => {
  return (
    <div className='flex justify-between pt-10 w-10/12 max-w-[1120px] mx-auto'>
      <div className='flex gap-10'>
        {/* logo */}
        <NavLink to="/">
          <motion.div className=''>
            <motion.svg width="200" height="50"
              initial={{ y: -250 }}
              animate={{ y: -10 }}
              transition={{ type: "spring", stiffness: 120 }}
              
              className="border-b "
            >
              <motion.text
                // variants={pathVariants}
                // initial="hidden"
                // animate="visible"
                className="myName"
                initial={{y:-250}}
                animate={{y:0,x:5}}
                whileHover={{
                scale: 1.2,
                textShadow: "0 0 4px rgb(255,255,255)", 
              }}
                transition={{type : "spring" , stiffness : 120}}
                x="10" y="30" fontSize="30" fontFamily="'Pacifico', cursive" fill="#FFFFFF" >
                Parth Gupta
              </motion.text>
            </motion.svg>
          </motion.div>
        </NavLink>
        {/* nav-links */}
        <menu className='flex gap-10 text-lg font-semibold pt-1'>
          <NavLink to="/projects">
            <motion.li
              variants={listItemsVariants}
              whileHover="hover"
            >Projects</motion.li></NavLink>
          <NavLink to="/about"><motion.li
            variants={listItemsVariants}
            whileHover="hover">About Me</motion.li></NavLink>
          <NavLink to="/contact"><motion.li
            variants={listItemsVariants}
            whileHover="hover">Contact me</motion.li></NavLink>
        </menu>
      </div>
      {/* hire me button */}
      <NavLink to="/contact">
        <motion.button 
       
        whileHover = {{scale : 1.1}}
        className='px-4 py-2 rounded-md border mr-4'>Hire Me</motion.button>
      </NavLink>
    </div>
  )
}

export default Navbar