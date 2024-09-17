import React from 'react'
import Cards from '../components/Cards'
import { motion } from 'framer-motion';
import { containerVariant } from '../utils/mainAnimation'
import { projectArray } from '../utils/projectsData'

const Projects = ({ isDescriptionShowing }) => {


  return (
    <motion.div
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      className={`w-10/12 max-w-[1120px] mx-auto ${isDescriptionShowing && "h-screen"}`}>
      <div>
        <Cards data={projectArray} isDescriptionShowing={isDescriptionShowing} />
      </div>

    </motion.div>
  )
}

export default Projects