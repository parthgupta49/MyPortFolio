import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FaTwitter } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaMedium } from "react-icons/fa6";
import { SiLeetcode } from "react-icons/si";

const iconVariant = {
    hidden: {
        opacity: 1,
    },
    hover: {
        opacity: 1,
    },
};

const textVariant = {
    hidden: {
        opacity: 0,
    },
    hover: {
        opacity: 1,
        transition: {
            duration: 0.4,
        },
    },
};

const Socials = () => {
    const [showTooltips, setShowTooltips] = useState({}); // Create an object to store tooltip states
    const size = "3.5rem";

    const socials = [
        {
            id: 1,
            element: <FaTwitter size={size} color='#1DA1F2' />, // Twitter's blue color
            title: "Twitter",
            linkTo: "https://twitter.com/parthgupta49",
        },
        {
            id: 2,
            element: <FaGithub size={size} color='#fff' />, // GitHub's dark gray color
            title: "GitHub",
            linkTo: "https://github.com/parthgupta49",
        },
        {
            id: 3,
            element: <FaLinkedin size={size} color='#2867B2' />, // LinkedIn's blue color
            title: "LinkedIn",
            linkTo: "https://www.linkedin.com/in/parth-gupta49/",
        },
        {
            id: 4,
            element: <FaMedium size={size} color='#00ab6c' />, // Medium's green color
            title: "Medium",
            linkTo: "https://medium.com/@ParthGupta49",
        },
        {
            id: 5,
            element: <SiLeetcode size={size} color='#FFA07A' />, // LeetCode's orange color
            title: "Leetcode",
            linkTo: "https://leetcode.com/Parth-gupta49/",
        },
    ];

    const handleHover = (id) => {
        setShowTooltips((prev) => ({ ...prev, [id]: true }));
    };

    const handleLeave = (id) => {
        setShowTooltips((prev) => ({ ...prev, [id]: false }));
    };

    return (
        <div className='w-10/12 max-w-[1240px] mx-auto mb-10 mt-10'>
            <div className='flex justify-center items-center gap-10 flex-wrap'>
                {socials.map((skill) => (
                    <motion.div
                        onMouseEnter={() => handleHover(skill.id)}
                        onMouseLeave={() => handleLeave(skill.id)}
                        initial="hidden"
                        className='relative'
                        key={skill.id}
                    >
                        <a href={skill.linkTo} target='_blank'>
                            <motion.div variants={iconVariant} className='relative'>
                                {skill.element}
                            </motion.div>
                            <motion.div
                                variants={textVariant}
                                initial="hidden"
                                animate={showTooltips[skill.id] ? "hover" : "hidden"}
                                className={`absolute ${showTooltips[skill.id] ? 'animate' : ''} tooltip-text`}
                            >
                                {skill.title}
                            </motion.div>
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Socials;