import { motion } from 'framer-motion';
import React from 'react'
import {Link} from 'react-router-dom';
const listItemsVariants = {
  hover: {
    scale: 1.2,
    color: '#7FA1C3',
  }
}
const Card = ({card}) => {
    console.log(card.image);
    const key = Object.keys(card.image)
  return (
    <div className='flex flex-col items-center border border-[#7CA5B8] w-[350px] rounded-lg p-2'>
        <img src = {card.image[key]} className='w-full h-[250px] object-fill rounded-lg' />
        <Link to = {card.link} >
            <motion.h1 variants={listItemsVariants} whileHover="hover" className='underline leading-10 text-xl hover:no-underline '>{card.title}</motion.h1>
        </Link>
        <p className='text-center opacity-40'>{card.description}</p>
        
    </div>
  )
}

export default Card