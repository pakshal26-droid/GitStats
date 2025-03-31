// import React from 'react'
// import bg from '../assets/bg.avif'
// import statcard from "../assets/statcard.png"
// import { Link } from 'react-router-dom'
// import { ArrowBigRight, CircleArrowOutUpRight , ArrowRight } from 'lucide-react'

// function Home() {
//   const features = [
//     {
//       number : 1,
//       title : "Open Source contributions",
//     },
//     {
//       number : 2,
//       title : "Top Commits",
//     },
//     {
//       number : 3,
//       title : "Top PR's and repositories",
//     },


//   ]
//   return (<>
//     <div className='absolute w-full px-24 z-10 pt-10 flex items-center justify-between  '>
//       <Link to="/" className='font-semibold text-2xl font-anek'>GitDaddy</Link>
//       <Link to="/github" className='font-semibold bg-black px-5 py-1 rounded-full flex items-center gap-x-1 text-white text-lg font-anek'>Try Out <ArrowRight/></Link>
//     </div>
//     <div className='bg-white font-anek text-black/90  flex flex-col items-center justify-center'>
    
//         <div 
//             className='absolute inset-0' 
//             style={{ 
//                 backgroundImage: `url(${bg})`, 
//                 backgroundSize:"cover", 
//                 backgroundPosition: 'center', 
//                 filter: 'blur(3px)', // Blur only the background image
//                 opacity: 0.15 // Reduce opacity of the background image
//             }}
//         ></div>
       
//         <div className='relative flex flex-col h-screen items-center max-w-7xl justify-center '>
          
//             <h1 className='text-3xl md:text-7xl tracking-tight text-center font-bold'>
//               Showcase Your GitHub Contributions
//             </h1>
//             <h3 className='text-2xl mt-3 font-medium text-gray-500'>Insightful Analytics & A Shareable Stat Card for Your CV</h3>
//             <ul className='flex flex-wrap font-medium text-xl flex-row mt-10 gap-x-4'>
//                 {features.map((feature)=>{
//                   return(
//                     <li key={feature.number} className='border-2 border-black px-4 py-1 transitions-colors duration-200 cursor-pointer rounded-full hover:bg-black hover:text-white'>{feature.title}</li>
//                   )
//                 })}
//             </ul>
            
//         </div>
       
        
//     </div>
//     </>
//   )
// }

// export default Home
import React from 'react'
import bg from '../assets/bg.avif'
import statcard from "../assets/statcard.png"
import { Link } from 'react-router-dom'
import { ArrowBigRight, CircleArrowOutUpRight, ArrowRight, ArrowDown } from 'lucide-react'
import CardDisplay from '../components/CardDisplay'

function Home() {
  const features = [
    {
      number: 1,
      title: "Open Source contributions",
    },
    {
      number: 2,
      title: "Top Commits",
    },
    {
      number: 3,
      title: "Top PR's and repositories",
    }
  ]
  
  return (<>
    <div className='absolute w-full px-4 sm:px-8 md:px-16 lg:px-24 z-10 pt-6 md:pt-10 flex items-center justify-between'>
      <Link to="/" className='font-semibold text-xl sm:text-2xl font-anek'>GitDaddy</Link>
      <Link to="/github" className='font-semibold bg-black px-3 py-1 sm:px-5 sm:py-1 rounded-full flex items-center gap-x-1 text-white text-base sm:text-lg font-anek'>
        <span className='hidden sm:inline'>Try Out</span>
        <span className='sm:hidden'>Try</span>
        <ArrowRight size={16} className="sm:w-5 sm:h-5" />
      </Link>
    </div>
    <div className='bg-white font-anek text-black/90 flex flex-col items-center justify-center'>
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
       
      <div className='relative flex flex-col h-screen items-center max-w-8xl justify-center px-4 sm:px-6 '>
        <h1 className='text-4xl sm:text-3xl md:text-5xl lg:text-7xl tracking-tight text-center font-bold'>
          Showcase Your GitHub Contributions
        </h1>
        <h3 className='text-sm sm:text-xl md:text-2xl mt-2 md:mt-3 font-medium text-gray-500 text-center'>
          Insightful Analytics & A Shareable Stat Card for Your CV
        </h3>
        <ul className='flex flex-wrap justify-center font-medium text-base sm:text-lg md:text-xl mt-6 md:mt-10 gap-3 md:gap-4'>
          {features.map((feature) => {
            return (
              <li 
                key={feature.number} 
                className='border-2 border-black px-3 py-1 md:px-4 md:py-1 transitions-colors duration-200 cursor-pointer rounded-full hover:bg-black hover:text-white text-center'
              >
                {feature.title}
              </li>
            )
          })}
        </ul>
        <div className='absolute flex flex-col h-[60vh] justify-end items-center mt-10 md:mt-16'>
          <p className='text-gray-500 text-lg font-semibold'>Scroll Down</p>
          <ArrowDown size={30} className="w-5 h-5 text-gray-500 mt-5 animate-bounce" />
        </div>
      </div>
      
    </div>
    <div>
      <CardDisplay/>
    </div>
  </>)
}

export default Home