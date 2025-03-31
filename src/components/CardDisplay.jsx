import React from 'react'
import statcard from "../assets/statcard.png"
import { ArrowDown } from 'lucide-react'
import bg from '../assets/bg.avif'

function CardDisplay() {
  return (
    <div className='relative flex font-anek flex-col items-center justify-center h-fit pb-20'>
        {/* Background styling */}
        <div 
          className='absolute inset-0' 
          style={{ 
            backgroundImage: `url(${bg})`, 
            backgroundSize: "cover", 
            backgroundPosition: 'center', 
            filter: 'blur(3px)', 
            opacity: 0.15 
          }}
        ></div>
        {/* Content */}
        <div className='relative flex flex-col items-center'>
          <h1 className='font-semibold tracking-tight text-xl md:text-4xl'>Your Stat Card will look like</h1>
          <img src={statcard} alt="Stat Card" className=' w-[90%] md:max-w-4xl mt-5 rounded-2xl shadow-lg' />
        </div>
    </div>
  )
}

export default CardDisplay