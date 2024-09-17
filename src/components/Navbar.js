import React, { useContext, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RxHamburgerMenu } from "react-icons/rx";
import { FaXmark } from "react-icons/fa6";
import { ThemeContext } from '../utils/context/ThemeContext';
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { bgTheme } from '../utils/themes';
const listItemsVariants = {
  hover: {
    scale: 1.2,
    color: '#7FA1C3',
  }
}
const Navbar = () => {
  const themeSize = "2rem"
  const { darkTheme, changeTheme } = useContext(ThemeContext);
  const themeButtonHandler = () => {
      changeTheme();
  }
  const location = useLocation();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const handleHamburgerClick = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  }

  useEffect(() => {
    setIsHamburgerOpen(false);
  }, [location])
  return (
    <div className='flex justify-between pt-10 w-10/12 max-w-[1400px] mx-auto image-container:mx-0 image-container:w-full'>
      <div className='flex gap-10 mobile:gap-1 flex-row w-full h-[3rem] relative justify-between'>
        {/* logo */}
        <NavLink to="/">
          <motion.div className='mx-5'>
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
                initial={{ y: -250 }}
                animate={{ y: 0, x: 5 }}
                whileHover={{
                  scale: 1.2,
                  textShadow: "0 0 4px rgb(255,255,255)",
                }}
                transition={{ type: "spring", stiffness: 120 }}
                x="10" y="30" fontSize="30" fontFamily="'Pacifico', cursive" fill="#FFFFFF" >
                Parth Gupta
              </motion.text>
            </motion.svg>
          </motion.div>
        </NavLink>
        {/* nav-links */}
        <menu className={` gap-4 md:gap-10 font-semibold pt-1 ${bgTheme}  text-xl w-full hidden md:flex  ${isHamburgerOpen ? " image-container:flex flex-col items-center w-screen absolute top-[3rem] text-white min-h-screen z-[1000] hamburgerAnimation" : ""}`}>
          <NavLink to="/projects">
            <motion.li
              variants={listItemsVariants}
              whileHover="hover"
            >Projects</motion.li></NavLink>
          <NavLink to="/about"><motion.li
            variants={listItemsVariants}
            whileHover="hover">About Me</motion.li></NavLink>
        </menu>
        


        {/* HamBurger */}
        <div className='flex items-center gap-10 mobile:gap-1'>
        <button className='text-2xl self-center justify-end' onClick={themeButtonHandler}>
          {
            darkTheme ? <MdDarkMode size={themeSize} /> : <MdOutlineLightMode size={themeSize} />
          }
        </button>
        <div className='mr-3 md:hidden' onClick={handleHamburgerClick}>
          {
            isHamburgerOpen ? <FaXmark size={"2rem"} /> : <RxHamburgerMenu size={"2rem"} />
          }
        </div>
        </div>

      </div>


    </div>
  )
}

export default Navbar