import '../styles/globals.css'
import EventContextContainer from '../context/eventContext'
// import Font Awesome CSS
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import HeadPage from './event/Head'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '../config/config'
import {encodedLetterToNumber } from "../pages/event/component/Convert"
import React, {useEffect} from "react"


config.autoAddCss = false

const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function MyApp({ Component, pageProps }) {
  // console.log("resServerSide in app ",pageProps.resServerSide)
  // console.log("slug  ",pageProps.slug)
  return (
    <div className="dark:bg-black dark:text-white">
      {pageProps.resServerSide && <HeadPage title={pageProps.resServerSide.event_name} content={pageProps.resServerSide.event_about && pageProps.resServerSide.event_about.substring(0, 150)} photo={pageProps.resServerSide.event_photo && pageProps.resServerSide.event_photo.split(',')[0]} />}
      <Elements stripe={stripePromise} >
        <EventContextContainer>
          <ToastContainer />
          <Component {...pageProps} />
        </EventContextContainer>
      </Elements>
    </div>
  )
}
export default MyApp

export async function getServerSideProps(context) {
  // const arr = context.query.slug.split('-')
  // const slug = arr[Number(arr.length - 1)]
  // const slug = encodedLetterToNumber(arr[arr.length-2])
  const slug=context.query.slug
  const params = {
    event_id: slug,
  }

  const response = await axios.post(`${API_URL}/event/eventTicketDetail`, params)
  return { props: { resServerSide: response.data.payload,slug:slug} }
}
