// import React, { useState } from 'react'
// import { FaReact } from "react-icons/fa";
// import { motion } from "framer-motion";

// const iconVariant = {
//   hidden: {
//     opacity: 1
//   },
//   hover: {
//     opacity: 0,
//     transition: {
//       duration: 0.2
//     }
//   },
// }

// const textVariant = {
//   hidden: {
//     opacity: 0
//   },
//   hover: {
//     opacity: 1,
//     transition: {
//       duration: 0.2
//     }
//   }
// }

// const Icons = () => {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <motion.div 
//       className='relative flex bg-black w-fit'
//       onHoverStart={() => setIsHovered(true)}
//       onHoverEnd={() => setIsHovered(false)}
//     >
//       <motion.div
//         variants={iconVariant}
//         animate={isHovered ? "hover" : "hidden"}
//         className=''
//       >
//         <FaReact size={"2rem"} />
//       </motion.div>
//       <motion.p
//         variants={textVariant}
//         animate={isHovered ? "hover" : "hidden"}
//         className='absolute'
//       >
//         React
//       </motion.p>
//     </motion.div>
//   )
// }

// export default Icons

import React from 'react'
import { FaReact } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { IoLogoJavascript } from "react-icons/io5";
import { FaJava } from "react-icons/fa";
import { SiMongodb } from "react-icons/si";
import { FaNode } from "react-icons/fa6";
import { color, motion } from "framer-motion";

const iconVariant = {
    hidden: {
        opacity: 1
    },
    hover: {
        opacity: 0,
        transition: {
            duration: 0.4,
            
        }
    },
}

const textVariant = {
    hidden: {
        opacity: 0
    },
    hover: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease : 'easeInOut'
        }
    }
}

const Icons = () => {
    return (
        <div className='flex gap-[5rem] w-full justify-center'>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            // drag
            // dragConstraints = {{top : 0, left : 0   ,right : 0,bottom : 0}}
            // dragElastic = {0.8}
            >
            <motion.div variants={iconVariant} className=''>
                <FaReact size={"4rem"} color='#00FFFF' />
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                React
            </motion.p>
            </motion.div>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            >
            <motion.div variants={iconVariant} className=''>
                <IoLogoJavascript color='yellow'  size={"4rem"} />
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                JavaScript
            </motion.p>
            </motion.div>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            >
            <motion.div variants={iconVariant}  className=''>
                <FaNode size={"4rem"} color=''/>
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                NodeJS
            </motion.p>
            </motion.div>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            >
            <motion.div variants={iconVariant} className=''>
                <SiMongodb color='green' size={"4rem"} />
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                MongoDB
            </motion.p>
            </motion.div>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            >
            <motion.div variants={iconVariant} className=''>
                <RiTailwindCssFill size={"4rem"} color='#38BDF8' />
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                TailwindCSS
            </motion.p>
            </motion.div>
            <motion.div
            className='relative flex justify-center items-center'
            whileHover="hover"
            initial="hidden"
            >
            <motion.div variants={iconVariant} className=''>
                <FaJava size={"4rem"} color='#FFFF00' />
            </motion.div>
            <motion.p variants={textVariant}
                className='absolute text-3xl'>
                Java
            </motion.p>
            </motion.div>
            
        </div>
    )
}

export default Icons