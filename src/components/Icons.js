
import React from 'react'
import { FaReact } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { IoLogoJavascript } from "react-icons/io5";
import { FaJava } from "react-icons/fa";
import { SiMongodb } from "react-icons/si";
import { FaNode } from "react-icons/fa6";
import { motion } from "framer-motion";
import { iconVariant,textVariant } from '../utils/iconsAnimation-framer-motion';

const skillsArray = [
    {
        id: 1,
        element: <FaReact size={"4rem"} color='#00FFFF' />,
        title: "React"
    },
    {
        id: 2,
        element: <IoLogoJavascript color='yellow' size={"4rem"} />,
        title: "JavaScript"
    },
    {
        id: 3,
        element: <FaNode size={"4rem"} color='' />,
        title: "NodeJS"
    },
    {
        id: 4,
        element: <SiMongodb color='green' size={"4rem"} />,
        title: "MongoDB"
    },
    {
        id: 5,
        element: <RiTailwindCssFill size={"4rem"} color='#38BDF8' />,
        title: "TailwindCSS"
    },
    {   
        id : 6,
        element: <FaJava size={"4rem"} color='#FFFF00' />,
        title: "Java"
    },
]

const Icons = () => {
    return (
        <div className='flex gap-[5rem] w-full justify-center'>
            {
                skillsArray.map((icon) => (
                    <motion.div
                        className='relative flex justify-center items-center'
                        whileHover="hover"
                        initial="hidden"
                        key={icon.id}
                    >
                        <motion.div variants={iconVariant} className=''>
                            {icon.element}
                        </motion.div>
                        <motion.p variants={textVariant}
                            className='absolute text-3xl font-medium'>
                            {icon.title}
                        </motion.p>
                    </motion.div>
                ))
            }

            
        </div>
    )
}

export default Icons