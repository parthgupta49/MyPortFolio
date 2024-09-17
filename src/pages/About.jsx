import React from 'react'
import CodeBlocks from './CodeBlocks'
import { TypeAnimation } from 'react-type-animation';
import GraphemeSplitter from 'grapheme-splitter';
const About = () => {
  const splitter = new GraphemeSplitter();
  return (
    <div>
      <div className='w-10/12 max-w-[1120px] mx-auto h-screen flex flex-col gap-10  image-container:pt-[4.5rem]' >
        <div className='self-center'>
          <TypeAnimation
            splitter={(str) => splitter.splitGraphemes(str)}
            sequence={[
              'Hello 🇬🇧',
              2000,
              'Ciao 🇮🇹',
              2000,
              '你好 🇨🇳',
              2000,
              'Здравейте 🇧🇬 ',
              2000,
              'Hola 🇪🇸',
              2000,
              'Bonjour 🇫🇷',
              2000,
              'नमस्ते 🇮🇳',
              2000
            ]}
            style={{ fontSize: '2em' }}
            repeat={Infinity}
          />
        </div>
        <CodeBlocks

          codeblock={`I'm Parth Gupta\nI'm a final year BCA student at Christ University, Bangalore, with a passion for building full-stack applications.\n
With a strong foundation in multiple programming languages, including C, Java, and JavaScript, I enjoy crafting seamless user experiences and efficient backend systems.\n
I'm also proficient in HTML, CSS, and SQL, and have experience with various frameworks and tools such as ExpressJS, Git, Github, TailwindCSS, and Postman.\n`}

          codeblock2={`\nIn addition, I've worked with popular libraries like ReactJS and Mongoose, and have hands-on experience with MongoDB as a database solution.\nFurthermore, I'm interested in cloud computing and have explored AWS as a platform for scalable and efficient application deployment.\n`
          }
          codeblock3={`\nCurrently, I'm driven to learn more about creating scalable applications that can handle high traffic and large datasets. I'm excited to apply my skills and knowledge to real-world problems and make a meaningful impact.`
          }


          backgroundGradient={<div className='absolute w-[50%] h-[40%] bottom-0 right-0' style={{
            backgroundImage: 'radial-gradient(farthest-corner at 50% 50%, #FFC394 -3.62%, #F8E231 50.44%, #FFD7BE 104.51%)',
            filter: 'blur(100px)'
          }}></div>
          }

        >

        </CodeBlocks>

      </div>
    </div>
  )
}

export default About