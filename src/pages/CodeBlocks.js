import React, { useEffect, useState, useRef } from 'react'
import { TypeAnimation } from 'react-type-animation';
import { useWindowSize } from "@uidotdev/usehooks";
const CodeBlocks = ({ codeblock, codeblock2, codeblock3, backgroundGradient }) => {
    const size = useWindowSize();
    const [color, setColor] = useState('text-yellow-300');
    const items = [
        'text-[#FFD700]', // a bold golden yellow
        'text-[#03A9F4]', // a bold blue
        'text-[#E2553F]', // a bold plum
        'text-[#34C759]', // a bold green
        'text-[#FFC107]', // a bold bronze
        'text-[#2196F3]', // a bold navy blue
        'text-[#8BC34A]', // a bold olive green
        'text-[#FF9900]', // a bold brown
        'text-[#9C27B0]', // a bold purple
        'text-[#009688]', // a bold teal
        'text-[#FFA07A]', // a bold orange
        'text-[#4CAF50]', // a bold mint green
        'text-[#F7DC6F]', // a bold yellow
        'text-[#03A9F4]', // a bold blue-green
        'text-[#FF69B4]', // a bold pink
        'text-[#8FBC8F]', // a bold lime green
        'text-[#FFC67D]', // a bold coral
        'text-[#00BFFF]', // a bold cyan
        'text-[#FFA57D]', // a bold peach
        'text-[#32CD32]', // a bold chartreuse
    ];


    const intervalIdRef = useRef(null);
    useEffect(() => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }
        intervalIdRef.current = setInterval(() => setColor(items[Math.floor(Math.random() * items.length)]), 2000);
    })
    return (
        <div className='flex w-[100%]  relative border border-richblack-800 bg-richblack-900'>
            {backgroundGradient}
            {/* Lines */}
            <div className='text-center text-richblack-400 font-inter font-bold flex flex-col w-[10%]'>
                {size.width < 600
                    ? Array.from({ length: 50 }, (_, i) => (
                        <p key={i}>{i + 1}</p>
                    ))
                    : Array.from({ length: 21 }, (_, i) => (
                        <p key={i}>{i + 1}</p>
                    ))}
            </div>


            <div className='absolute w-[60%] h-[40%] top-0 right-0' style={{
                backgroundImage: 'radial-gradient(farthest-corner at 50% 50%, #7A288A -3.62%, #8E24AA 50.44%, #C5107A 104.51%)',
                filter: 'blur(120px)'
            }}></div>

            <div className='absolute w-[50%] h-[40%] bottom-0 left-0' style={{
                backgroundImage: 'radial-gradient(farthest-corner at 50% 50%, #FF99CC -3.62%, #FFC67D 50.44%, #F7DC6F 104.51%)',
                filter: 'blur(100px)'
            }}></div>

            <div className='absolute w-[50%] h-[40%] left-0 top-3 ' style={{
                backgroundImage: 'radial-gradient(farthest-corner at 50% 50%, #1fa2ff -3.62%, #12d8fa 50.44%, #a6ffcb 104.51%)',
                filter: 'blur(100px)'
            }}></div>
            {/* Code */}
            <div className={`w-[90%] ${color} text-lg flex flex-col gap-2 font-mono pr-2 transition-all duration-200`}
            >
                <TypeAnimation
                    sequence={[codeblock + codeblock2 + codeblock3, 5000]}
                    // cursor={true}
                    omitDeletionAnimation={true}
                    speed={{ type: 'keyStrokeDelayInMs', value: 15 }}
                    style={{
                        whiteSpace: "break-spaces",
                        display: "block"
                    }}
                />
            </div>
        </div>
    )
}
export default CodeBlocks