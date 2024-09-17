import React from 'react'
import Projects from '../../pages/Projects'
const Project = () => {
  return (
    <div className='w-10/12 max-w-[1120px] mx-auto pt-[5rem]'>

        <hr/>
        <p className='text-3xl font-medium text-white  text-center '>Projects</p>
        <Projects isDescriptionShowing = {true}/>
    </div>
  )
}

export default Project