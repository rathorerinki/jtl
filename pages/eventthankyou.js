import React from 'react'
import Navbar from '../pages/event/component/Navbar'

function EventThankyou() {
  const rocket = '/image/rocket.png'
  const apple_store_btn = '/image/apple_store_btn.png'
  const google_store_btn = '/image/google_store_btn.png'
  // const logo = '/image/logo_y.png';
  const logo = '/image/white_logo-57af796889902ef9ae0307d22f218b20.png'

  return (
  
  <>
   <Navbar logo={logo} />
   <div className='event-ty'>
   
      <div className='eventthankyou container lg:px-5 lg:py-24 px-3 py-20  mx-auto lg:w-2/6 text-center dark:text-white'>
      <img className='rocket h-[300px] mx-auto' src={rocket} />
        <p className='mt-5 mb-0 text-xl text-[#32325d] dark:text-slate-300'>Thank You!</p>
        <p className='mt-1 lg:text-xl text-[#32325d] dark:text-white'>Ticket(s) are on the way to your inbox.</p>
        <p className='mt-3 text-lg text-[#32325d] dark:text-white'> Can’t find your ticket? check email spam or contact us on IG — <b className="dark:text-[#6938dc] ">@Gojumptheline</b> or <b className="dark:text-[#6938dc] ">contact the event organizer(s)</b> to resend your ticket(s).</p>
        <p className='text-center mt-[3rem] mb-2 text-xl lg:text-2xl font-bold dark:text-slate-300'>Download the JumpTheLine app</p>
        <div className='flex align-items-center justify-content-center dark:text-white'>
          <img className='store_img w-[150px] ml-auto' src={apple_store_btn} onClick={() => window.open('https://apps.apple.com/us/app/go-jumptheline/id1568153823', '_blank')} />
          <img className='store_img w-[150px] mr-auto ml-2 ' src={google_store_btn} onClick={() => window.open('https://play.google.com/store/apps/details?id=com.jumptheline.app', '_blank')} />
        </div>
      </div>
    </div>
  </>
    
  )
}

export default EventThankyou
