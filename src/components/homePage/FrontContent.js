import React from 'react'
import { ReactTyped } from "react-typed";
// import myImage from '../../assets/2241237.JPG'
// import myImage from '../../assets/ParthGupta_2.jpg'
import myImage from '../../assets/ParthGupta_1.jpg'
import Icons from '../../components/Icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
const MY_IMAGE = "https://drive.google.com/thumbnail?id=1WhVVxOVhfy5JAXomuCLGZl21qrxWIkzy&sz=w1200"
const FrontContent = () => {
    return (
        <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className='flex flex-col gap-10 pt-[6rem]  overflow-x-hidden w-10/12 max-w-[1120px] mx-auto'>
            {/* name and image div */}
            <div className='flex  justify-between flex-col md:flex-row image-container:items-center image-container:gap-10'>
                {/* name */}
                <div className='flex flex-col gap-5 justify-center image-container:self-start'>
                    <p className='text-5xl font-semibold leading-10'>Hi, I am <span className='text-[#7FA1C3]'>Parth</span></p>
                    <div className='text-3xl font-bold tracking-wide leading-[2rem] mobile:w-[60%] mobile:h-[5rem]'>
                        <ReactTyped strings={["Front End Developer", "Backend Developer", "Full-Stack Developer"]} typeSpeed={90} backSpeed={80} loop />
                    </div>
                    <Link to="https://drive.google.com/file/d/1TmWoP7dgS1e-TWvFzbNPvsCTlMvLq2ga/view?usp=sharing" target='_blank' className="w-fit font-semibold relative inline-flex items-center justify-start px-6 py-3 overflow-hidden transition-all bg-yellow-100 rounded-lg hover:bg-yellow-100 group">
                        <span className="w-48 h-48 rounded rotate-[-40deg] bg-pink-400 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
                        <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">My Resume</span>
                    </Link>
                </div>
                
                {/* image */}
                <div className='relative w-[20rem] h-[20rem] hidden image-width:block mr-10 image-container:mb-10'>
                    <motion.div
                        className='absolute w-[100%] h-[100%]'
                        style={{
                            backgroundImage: 'radial-gradient(farthest-corner at 50% 50%, #1fa2ff -3.62%, #12d8fa 50.44%, #a6ffcb 104.51%)',
                            filter: 'blur(20px)',
                            borderRadius: '50%',
                        }}
                        initial={{ rotate: 0, scale: 1 }}
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    ></motion.div>
                    <img src={MY_IMAGE} alt='myMainImage' className='relative bg-cover rounded-full object-cover w-full h-full bg-center ' />
                </div>

            </div>

            {/* Skills */}
            <motion.div className='w-full pt-[7rem] md:block hidden md:mt-[2rem]'>
                <Icons />
            </motion.div>




        </motion.div>
    )
}

export default FrontContent
