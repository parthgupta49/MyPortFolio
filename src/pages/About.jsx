import React from 'react'
import me from '../assets/coat-Image-3.jpg'
const About = () => {
  return (
    <div>
      <div className='w-10/12 max-w-[1120px] mx-auto'>
        <div className='flex'>
         
          <div>
            <p>Hi, I'm Parth Gupta</p>
            <br />
            <p>I'm a final year BCA student at Christ University, Bangalore, with a passion for building full-stack applications. With a strong foundation in multiple programming languages, including C, C++, Java, and JavaScript, I enjoy crafting seamless user experiences and efficient backend systems. I'm also proficient in HTML, CSS, and SQL, and have experience with various frameworks and tools such as ExpressJS, Git, Github, TailwindCSS, and Postman.</p>
            <br />
            <p>In addition, I've worked with popular libraries like ReactJS and Mongoose, and have hands-on experience with MongoDB as a database solution. Furthermore, I'm interested in cloud computing and have explored AWS as a platform for scalable and efficient application deployment.</p>
            <br />
            <p>Currently, I'm driven to learn more about creating scalable applications that can handle high traffic and large datasets. I'm excited to apply my skills and knowledge to real-world problems and make a meaningful impact.</p>
          </div>
          <div>
            <img src={me} className='w-[1000px] h-[300px] object-cover rounded-full' alt='MyImage'/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About