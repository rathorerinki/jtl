import React from 'react'

function Navbar({logo}) {
  return (
    <>
      <nav className='fixed w-full z-20 top-0 left-0 border-gray-200 dark:border-gray-600 bg-[#6938dc]'>
        <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4'>
          <img src={logo} className='h-8 mr-3' alt='Flowbite Logo' />
          {/* </a> */}
          <div className='bg-purple-600 hidden w-full md:block md:w-auto ' id='navbar-multi-level'>
            {/* <ul className='flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-purple-600 md:flex-row md:space-x-8 md:mt-0 md:border-0 bg-purple-600 md:bg-purple-600 '>
                        <li>
                          <a href='#' className='block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-white-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent' aria-current='page'>
                            Home
                          </a>
                        </li>

                        <li>
                          <a href='#' className='block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-white-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent' aria-current='page'>
                            Services
                          </a>
                        </li>
                      </ul> */}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
