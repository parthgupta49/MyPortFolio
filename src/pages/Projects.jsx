import React from 'react'
import Cards from '../components/Cards'
import passwordGenertorImage from '../assets/projectImages/password-genertor.png'
import weatherImage from '../assets/projectImages/weather-app.png'
import tictactoeImage from '../assets/projectImages/tic-tac-toe.png'
import { motion } from 'framer-motion';
const containerVariant = {
  hidden: { 
    opacity: 0,
    y : '-100vw',
   },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      // delay: 1,
      duration: 1,
      type: 'tween',
      // stiffness: 300,
      when: 'beforeChildren'
    }

  },
  exit : {
    x : '-100vw',
    transition : {
      ease : 'easeInOut'
    }
  }
}
const Projects = () => {

  const projectArray = [
    {
      title : "Password Generator",
      description : "A simple password generator that generates a random password based on user input",
      image : {passwordGenertorImage},
      link : "https://password-generator-parthgupta.vercel.app/"
    },
    {
      title : "Weather App",
      description : "A simple weather app that fetches weather data from openweathermap API",
      image : {weatherImage},
      link : "https://github.com/parthgupta49/JavaScript-Projects"
    },
    {
      title : "Tic Tac Toe",
      description : "A simple tic tac toe game that allows two players to play against each other",
      image : {tictactoeImage},
      link : "https://github.com/parthgupta49/JavaScript-Projects"
      }
  ]

  return (
    <motion.div 
    variants={containerVariant}
    initial="hidden"
    animate = "visible"
     className='w-10/12 max-w-[1120px] mx-auto h-screen'>
      
      {/* <h1>Projects</h1> */}
      
      <div>
        <Cards data = {projectArray} />
      </div>

    </motion.div>
  )
}

export default Projects