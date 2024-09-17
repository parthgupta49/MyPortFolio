import passwordGenertorImage from '../assets/projectImages/password-genertor.png'
import weatherImage from '../assets/projectImages/weather-app.png'
import tictactoeImage from '../assets/projectImages/tic-tac-toe.png'
export const projectArray = [
    {
        title: "Password Generator",
        description: "A simple password generator that generates a random password based on user input",
        image: { passwordGenertorImage },
        link: "https://password-generator-parthgupta.vercel.app/"
    },
    {
        title: "Tic-Tac-Toe",
        description: "A simple tic tac toe game that allows two players to play against each other",
        image: { tictactoeImage },
        link: "https://tictactoe-parthgupta.netlify.app/"
    },
    {
        title: "Weather App",
        description: "A simple weather app that fetches weather data from openweathermap API",
        image: { weatherImage },
        link: "https://weather-app-parthgupta.vercel.app/"
    },
]