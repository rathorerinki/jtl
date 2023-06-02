
import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'

import moment from 'moment'
import { Input } from 'reactstrap'
import CounterInput from 'react-counter-input'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // requires a loader
import { Carousel } from 'react-responsive-carousel'
import { PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { EventContext } from '../../context/eventContext'
import { API_URL } from '../../config/config'
import { cardNumberFormat, cardExpFormat, phoneFormat } from '../../utils/commonUtil'
import handleToastify from '../../components/Toast'
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import Navbar from './component/Navbar'
import {numberToEncodedLetter,encodedLetterToNumber } from "./component/Convert"
import ShowMoreLess from './component/ShowMoreLess'


const TIMER_DURATION = 300
export default function Home({ resServerSide }) {
  const { isSubmit, eventTicketDetail, eventBuyerList, getEventDetail, payWebEventTicket, getBuyersByEvent } = useContext(EventContext)
  let router = useRouter()

  const [event_id, setEventId] = useState(0)
  const [ticketPriceRange, setTicketPriceRange] = useState('')
  const [step, setStep] = useState(0)
  const [card_no, setCardNo] = useState('')
  const [card_cvv, setCardCvv] = useState('')
  const [zip, setZip] = useState('')
  const [card_exp, setCardExp] = useState('')
  const [first_name, setFirstName] = useState('')
  const [last_name, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')

  const [phone, setPhone] = useState('')

  const [selectedTickets, setSelectedTickets] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [ticketsPrice, setTicketsPrice] = useState(0)
  const [ticketFee, setTicketFee] = useState(0)
  const [isActivated, setActivated] = useState(true)
  const [isStartTimer, setStartTimer] = useState(false)
  const [countDown, setCountDown] = useState(TIMER_DURATION)
  const [promoCode, setPromoCode] = useState('')
  const [isAddPromo, setAddPromo] = useState(false)
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0)
  const [totalTicketCount, setTotalTicketCount] = useState(0)
  const [usedTicketCount, setUsedTicketCount] = useState(0)
  const [buyerList, setBuyerList] = useState([])
  const [transactionId, setTransactionId] = useState('')
  const [showMore, setShowMore] = useState(false)

  const [photoes, setPhotoes] = useState([])
  const [video,setVideo]=useState(false)


  const [paymentRequest, setPaymentRequest] = useState(null)
  const [isApplePay, setApplePay] = useState(false)
  const AvatarColors = ['gray', 'blue', 'orange', 'red', 'pink', 'black', 'indigo', 'purple', 'pink']
  const [check, setCheck] = useState(0)
  const [quantity, setQuantity] = useState([])
  const stripe = useStripe();
  const elements = useElements();

  const arr = router.query.slug != undefined ? router.query.slug.split('-') : ''
  // const slug=encodedLetterToNumber(arr[Number(arr.length-2)])
  const slug = arr[Number(arr.length - 1)]

  useEffect(() => {
    setEventId(slug)
    let params = {
      event_id: slug,
    }
    getEventDetail(params)
    getBuyersByEvent({ event_id: slug })
  }, [slug])


  useEffect(()=>{
    const id = setInterval(function() {  
      getBuyersByEvent({ event_id: slug });
      setCheck(check + 1)
      }, 1000);

    return () => clearInterval(id);
    
  },[check])


    useEffect(() => {

      // stripe && elements
      if (stripe) {
        const pr = stripe.paymentRequest({
          country: 'US',
          currency: 'usd',
          total: {
            label: '',
            amount: 0,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        // Check the availability of the Payment Request API.
        pr.canMakePayment().then((result) => {

          if (result) {
            setPaymentRequest(pr);
            // setApplePay(result.applePay);
            setApplePay(true);

          }
        });
      }
    }, [stripe]);

  useEffect(() => {
    if (Object.keys(eventTicketDetail).length > 0) {
      const { has_tickets, event_end_time } = eventTicketDetail
      setActivated(moment(new Date()).isBefore(moment.unix(event_end_time)))

      // document.title = eventTicketDetail.event_name;
      if (has_tickets === 1 && eventTicketDetail.tickets.length > 0) {
        let eventTickets = eventTicketDetail.tickets
        if (eventTickets.length === 1) {
          setTicketPriceRange(`$${eventTickets[0].ticket_price}`)
        } else {
          let max = Math.max.apply(
            Math,
            eventTickets.map(function (o) {
              return o.ticket_price
            })
          )
          let min = Math.min.apply(
            Math,
            eventTickets.map(function (o) {
              return o.ticket_price
            })
          )
          if (max === min) {
            if (min === 0) setTicketPriceRange(`$0`)
            else setTicketPriceRange(`$${min.toFixed(2)}`)
          } else {
            setTicketPriceRange(`$${min.toFixed(2)} ~ $${max.toFixed(2)}`)
          }
          let total_ticket_count = 0
          eventTickets.forEach((e) => (total_ticket_count += parseInt(e.ticket_quantity)))
          setTotalTicketCount(total_ticket_count)
        }
      }
      eventTicketDetail.event_photo !== undefined ? setPhotoes(eventTicketDetail.event_photo.split(',')) : []
    } else {
      setTicketPriceRange('')
    }
  }, [eventTicketDetail, router.query.slug])

  useEffect(() => {
   
    let amount = Math.floor(parseFloat((totalPrice * (100 - promoCodeDiscount)) / 100) * 100) / 100

    if (amount > 0 && isApplePay) {
      paymentRequest.update({
        total: { label: eventTicketDetail.event_name, amount: Math.round(amount * 100) },
      })

      paymentRequest.on('paymentmethod', async (ev) => {
        console.log({ ev })
        console.log("inside ...... payment request")
        const response = await fetch(`${API_URL}event/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_price: amount,
          }),
        }).then((r) => r.json())

        console.log({ response })
        const { code, id, client_secret } = response
        if (code !== 200) {
          console.log(response.message)
          return
        }
        // Confirm the PaymentIntent without handling potential next actions (yet).
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(client_secret, { payment_method: ev.paymentMethod.id }, { handleActions: false })
        if (confirmError) {
          ev.complete('fail')
        } else {
          ev.complete('success')
          if (paymentIntent.status === 'requires_action') {
            // Let Stripe.js handle the rest of the payment flow.
            const { error } = await stripe.confirmCardPayment(client_secret)
            if (error) {
              // The payment failed -- ask your customer for a new payment method.
            } else {
              // The payment has succeeded.
              // onHandleApplePay(id);
              setTransactionId(id)
            }
          } else {
            // The payment has succeeded.
            setTransactionId(id)
            // onHandleApplePay(id);
          }
        }
      })
    }
  }, [totalPrice, promoCodeDiscount, isApplePay, eventTicketDetail, paymentRequest])

  useEffect(() => {
    if (selectedTickets.length > 0) {
      var ticketsCost = 0
      var fee = 0
      const { percent_fee, flat_fee, is_base_fee } = eventTicketDetail

      selectedTickets.forEach((e) => {
        const { ticket_price, used_quantity } = e
        let ticket_fee = 0
        if (is_base_fee === 0) {
          ticket_fee = calculateFee(ticket_price, flat_fee, percent_fee)
        }

        fee += parseFloat(ticket_fee) * used_quantity
        ticketsCost += parseFloat(ticket_price) * used_quantity
      })
      setTicketsPrice(ticketsCost)
      setTicketFee(fee)
      setTotalPrice(parseFloat(ticketsCost) + parseFloat(fee))
    } else {
      setTicketFee(0)
      setTicketsPrice(0)
      setTotalPrice(0)
    }
  }, [selectedTickets, eventTicketDetail])

  useEffect(() => {
    if (isStartTimer) {
      const interval = setInterval(() => {
        setCountDown(countDown - 1)
      }, 1000)

      if (countDown === 0) {
        clearInterval(interval)
        clearTicketData()
        handleToastify('bg-red-600', 'Time Out!')
      }

      return () => clearInterval(interval)
    }
  }, [isStartTimer, countDown])

 

  useEffect(() => {
    let usedCount = 0
    if (eventBuyerList.length > 0) {
      eventBuyerList.forEach((e) => {
        usedCount += parseInt(e.ct)
      })

      const unique = []
      for (const item of eventBuyerList) {
        const isDuplicate = unique.find((obj) => obj.id === item.id)
        if (!isDuplicate) {
          unique.push(item)
        }
      }
      setBuyerList(unique)
      setUsedTicketCount(usedCount)
    }
  }, [eventBuyerList])


 
  useEffect(() => {
    if (transactionId.length > 0) {
      onHandleApplePay(transactionId)
    }
  }, [transactionId])

  const onHandleApplePay = (transaction_id) => {
    let params = {
      event_id,
      transaction_id,
      card_no: 'Apple Pay',
      card_exp_month: '',
      card_exp_year: '',
      card_cvv: '',
      zip: '',
      percent_fee: eventTicketDetail.percent_fee,
      flat_fee: eventTicketDetail.flat_fee,
      creator_id: eventTicketDetail.creator_id,
      ticket_data: selectedTickets,
      event_end_time: eventTicketDetail.event_end_time,
      is_base_fee: eventTicketDetail.is_base_fee,
      first_name,
      last_name,
      email,
      phone: phoneFormat(phone),
      is_promo: promoCodeDiscount !== 0,
      promo_code: promoCode,
      is_applepay: 1,
    }
    payWebEventTicket(params)
    setTimeout(() => clearTicketData(), 1000)
  }
  const onTogglePromo = () => {
    if (isAddPromo) {
      onHandleRemovePromo()
    }
    setAddPromo(!isAddPromo)
  }

  const onHandleRemovePromo = () => {
    setPromoCodeDiscount(0)
    setPromoCode('')
  }

  const onHandleApplyPromo = async () => {
    if (promoCode.length == 0) return handleToastify('bg-red-600', 'Empty Promo Code!')
    if (promoCode.length < 7) return handleToastify('bg-red-600', 'Promo Code must be 7 characters!')

    try {
      const response = await fetch(`${API_URL}promo/getPromoCodeInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promo_code: promoCode,
          is_biz: 3,
          id: event_id,
          user_id: 0,
        }),
      })
      const result = await response.json()
      console.log({ result })
      if (result.code === 200) {
        setPromoCodeDiscount(result.data.discount)
      } else {
        handleToastify('bg-red-600', result.message)
      }
    } catch (error) {
      handleToastify('bg-red-600', error)
    }
  }

  const clearTicketData = () => {
    setStartTimer(false)
    setCountDown(TIMER_DURATION)
    setFirstName('')
    setLastName('')
    setCardNo('')
    setCardExp('')
    setCardCvv('')
    setEmail('')
    setPhone('')
    setZip('')
    setPromoCode('')
    setAddPromo(false)
    setPromoCodeDiscount(0)
    setSelectedTickets([])
    setStep(0)
    setTransactionId('')
    setShowMore(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
  });
  }

  const calculateFee = (price, flat_fee, percentage) => {
    if (parseFloat(price) === 0) return 0
    let percent_price = Math.floor(parseFloat(price) * parseFloat(percentage) * 100) / 10000
    return percent_price > flat_fee ? percent_price : flat_fee
  }

  const onHandleBack = () => {
    // setStep(0);
    clearTicketData()
  }

  const onHandleSelect = (val, e) => {
    let temp = [...selectedTickets]
    setQuantity(temp)
    let index = temp.findIndex((el) => el.id === e.id)
    if (val === 0) {
      temp.splice(index, 1)
      setStartTimer(false)
      setCountDown(TIMER_DURATION)
    } else {
      if (!isStartTimer) setStartTimer(true)
      if (index > -1) {
        temp[index] = {
          ...e,
          used_quantity: val,
        }
      } else {
        temp.push({
          ...e,
          used_quantity: val,
        })
      }
    }
    setSelectedTickets(temp)
  }

  const handleChange = (e) => {
    e.preventDefault()
    return false
  }

  const onBuyTickets = () => {
    if (selectedTickets.length === 0) return handleToastify('bg-red-600 py-0', 'Please select a ticket to continue.')
    if (first_name == '' && last_name == '' && email == '' && phone == '') return handleToastify('bg-red-600', 'Please fill out your email, confirm email, phone, first name and last name before proceeding to checkout')
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) return handleToastify('bg-red-600', 'Email is invalid.')
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(confirmEmail.trim())) return handleToastify('bg-red-600', 'Confirm Email is invalid.')
    if (confirmEmail === '') return handleToastify('bg-red-600', 'Confirm email is empty.')
    if (email != confirmEmail) return handleToastify('bg-red-600', "Email and Confirm email field isn't match.")
    if (!phone.match(/^(\+\d{1,3}[- ]?)?\d{10}$/))
    return handleToastify('bg-red-600', 'Phone is invalid.');

    if (first_name === '') return handleToastify('bg-red-600', 'First name is empty.')
    if (last_name === '') return handleToastify('bg-red-600', 'Last name is empty.')

    let temp = card_exp.toString().split('/')
    if (selectedTickets.length > 0 && parseFloat((totalPrice * (100 - promoCodeDiscount)) / 100) > 0) {
      if (card_no === '') return handleToastify('bg-red-600', 'Please select a payment option or provide your card information to continue.')
      if (card_exp === '') return handleToastify('bg-red-600', 'Card expiry date is empty.')

      if (parseInt(temp[0]) === 0 || parseInt(temp[0]) > 12) return handleToastify('bg-red-600', 'Card expiry date is invalid.')
      if (card_cvv === '') return handleToastify('bg-red-600', 'Card cvv is empty.')
      if (zip === '') return handleToastify('bg-red-600', 'Zipcode is empty.')    }
    
   


    let params = {
      event_id,
      card_no: selectedTickets.length > 0 && totalPrice > 0 ? card_no.replace(/\W/gi, '') : '',
      card_exp_month: selectedTickets.length > 0 && totalPrice > 0 ? temp[0] : '',
      card_exp_year: selectedTickets.length > 0 && totalPrice > 0 ? temp[1] : '',
      card_cvv: selectedTickets.length > 0 && totalPrice > 0 ? card_cvv : '',
      zip: selectedTickets.length > 0 && totalPrice > 0 ? zip : '',
      percent_fee: eventTicketDetail.percent_fee,
      flat_fee: eventTicketDetail.flat_fee,
      creator_id: eventTicketDetail.creator_id,
      ticket_data: selectedTickets,
      event_end_time: eventTicketDetail.event_end_time,
      is_base_fee: eventTicketDetail.is_base_fee,
      first_name,
      last_name,
      email,
      phone: phoneFormat(phone),
      is_promo: promoCodeDiscount !== 0,
      promo_code: promoCode,
      is_applepay: 0,
    }

    console.log('here ...')
    payWebEventTicket(params)
    setTimeout(() => clearTicketData(), 1000)
  }

 
  const fileExt = (filename)=>{

    var fileExt = filename.split('.').pop();
    if(fileExt == 'mp4'){
      // setVideo(true)
      return "video"
    }
    else{
      return "image"
    }
  
  }

  // fileExt("https://vod-progressive.akamaized.net/exp=1684944044~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F829%2F10%2F254146872%2F927072573.mp4~hmac=296d76054d2dbc1eaf31d93541d13025c8fd0ecdc4042eb3d8294e55e600e2af/vimeo-prod-skyfire-std-us/01/829/10/254146872/927072573.mp4?filename=file.mp4");


  const logo = '/image/white_logo-57af796889902ef9ae0307d22f218b20.png'

  return (
    <>
      {eventTicketDetail && eventTicketDetail.tickets && eventTicketDetail.tickets.length > 0 ? (
        <div className='eventonline'>
          {isSubmit ? (
            <div className='spinner-container'>
              <span className='spinner-border text-primary' />
            </div>
          ) : (
            <section className='text-gray-600 body-font overflow-hidden'>
              {Object.keys(eventTicketDetail).length > 0 ? (
                <>
                  <Navbar logo={logo} />

                  <div className='container lg:px-5 lg:py-24 px-3 py-20  mx-auto'>
                    {step === 0 ? (
                      <div className='lg:w-4/5 mx-auto flex flex-wrap'>
                        {photoes.length > 0 && (
                          <div className='lg:w-1/3 w-full lg:h-auto h-auto object-cover object-center rounded-md'>
                            <Carousel showThumbs={false} autoPlay={true} showArrows={false} infiniteLoop={true} showIndicators={photoes.length !== 1} showStatus={photoes.length !== 1} className='rounded-lg bg-black'>
                              {photoes.map((e, index) => (
                                <>
                                {fileExt(e) == 'video'?
                                <video className="bg-video__content h-80" autoPlay muted loop>
                                  <source src={e} type="video/mp4"/>
                                </video>
                                :
                                <img key={index} className='lg:w-1/2 w-full lg:h-80 h-auto border border-gray-500 rounded-md bg-white' src={e} /> 
                                }
                                </>
                                
                              ))}
                            </Carousel>
                          </div>
                        )}

                        <div className='lg:w-1/2 w-full lg:pl-10 mt-3 lg:mt-0 '>
                          <h2 className='mb-2'  onCut={handleChange} onCopy={handleChange} onPaste={handleChange}>
                            <span className='text-gray-800 text-xs font-medium mr-2 px-2.5 py-1 rounded-full border border-gray-500'> {eventTicketDetail.event_type} </span>
                          </h2>
                          <h1 className='text-gray-900 text-3xl title-font font-medium mb-2'>{eventTicketDetail.event_name}</h1>

                          <span className='flex items-center  mb-2 mt-2'>
                            {/* <svg fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' viewBox='0 0 24 24' className='w-4 h-5 text-violet-700'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'></path>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'></path>
                          </svg> */}

                            <FontAwesomeIcon icon={faLocationDot} className='text-violet-700 text-xs'></FontAwesomeIcon>

                            <span className='bg-gray-100 px-2.5 py-1.5 rounded dark:bg-gray-200 ml-3 text-xs'>
                              <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-700'>{eventTicketDetail.event_address}</h1>
                            </span>
                          </span>

                          <div className='flex mb-2'>
                            <span className='flex items-center'>
                              <FontAwesomeIcon icon={faCalendarDays} className='text-violet-700 mr-3 text-xs'></FontAwesomeIcon>
                              <span className='bg-gray-100 px-2.5 py-1.5 rounded dark:bg-gray-200 mr-3 text-xs'>
                                <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-700'>{moment.unix(eventTicketDetail.event_start_time).format('MMM DD h:mm A')}</h1>
                              </span>
                              ~
                              <span className='bg-gray-100 px-2.5 py-1.5 rounded dark:bg-gray-200 ml-3 text-xs'>
                                <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-700'>{moment.unix(eventTicketDetail.event_end_time).format('MMM DD h:mm A')} </h1>
                              </span>
                            </span>
                          </div>

                          {usedTicketCount > 0 && (
                            <div className='flex -space-x-4 items-center mt-6 block max-w-sm p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700' onCut={handleChange} onCopy={handleChange} onPaste={handleChange}>
                              {buyerList.slice(0, 4).map((e, index) => (
                                <div key={index} style={{ zIndex: 8 - index, marginRight: 3 }}>
                                  {e.photo ? (
                                    <img className='w-10 h-10 border-2 border-white rounded-full dark:border-gray-800' src={e.photo} alt='' />
                                  ) : (
                                    <>
                                      <div className='relative w-10 h-10 overflow-hidden rounded-full dark:bg--600'>
                                        <a className='flex items-center justify-center w-10 h-10 text-xs font-medium text-white  border-2 border-white rounded-full hover:bg-gray-600 text-center uppercase' title={e.first_name + ' ' + e.last_name} style={{ background: AvatarColors[index] }}>
                                          {e.first_name.substring(0, 1) + '' + e.last_name.substring(0, 1)}
                                        </a>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}

                              <span className='h5 pl-5 mb-0 f-bold'>
                                {' '}
                                +{usedTicketCount > 3 ? usedTicketCount - 3 : usedTicketCount} People {isActivated ? 'attending.' : 'attended'}
                              </span>
                            </div>
                          )}

                          {eventTicketDetail.event_about && (
                            <div className='mt-5'>
                              <label className='ml-1 text-gray-800 text-lg font-semibold'>About the Event</label>
                              <ShowMoreLess about={eventTicketDetail.event_about}/>    
                            </div>
                          )}

                          <div className='mb-5 mt-2 ml-1'>
                            <label className='text-gray-800 text-lg font-semibold'>Organizer</label>
                            <span className='flex items-center mr-3'>
                              <span className='text-gray-600' title='Orgnizer'>
                                {eventTicketDetail.organizer}
                              </span>
                            </span>

                            <div className='mt-2'>
                              <label className='text-gray-800 text-lg font-semibold'>About the Organizer</label>
                              <span className='flex items-center mr-3'>
                                <span className='text-gray-600' title='Orgnizer E-mail'>
                                  {eventTicketDetail.organizer_about}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {eventTicketDetail.has_tickets === 1 && eventTicketDetail.tickets.length > 0 && (
                          <footer className='fixed bottom-0 left-0 z-20 w-full p-3'>
                            <div className='rounded-md w-full h-full mx-auto bg-gradient-to-r p-[4px] from-[#6938dc] to-[#f472b6]'>
                              <div className='d-flex flex-row align-items-center justify-content-between bottomNav p-4 bg-white' style={{ fontFamily: 'Metropolis-Bold !important' }}>
                                <span className='font-semibold	text-sm text-black sm:text-center dark:text-gray-400 '>{ticketPriceRange === '$0' ? 'Free ' : ticketPriceRange} / Ticket</span>
                                <button disabled={!(isActivated && eventTicketDetail.is_cancel === 0)} className='outline-0 btn btn-sm py-2 px-4 bg-pink-400 absolute right-7 lg:bottom-6 bottom-6 text-white rounded disabled:opacity-50 text-medium' onClick={() => setStep(1)}>
                                  {isActivated && eventTicketDetail.is_cancel === 0 ? (ticketPriceRange === '$0' ? 'RSVP' : `Buy Ticket(s)`) : isActivated && eventTicketDetail.is_cancel === 1 ? `Event Cancelled` : `Event Ended`}
                                </button>
                              </div>
                            </div>
                          </footer>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* step-2 */}

                        {/* ---Timer--- */}
                        <div className='container px-1 py-0 mx-auto lg:w-3/6'>
                          <div className='mt-4' />
                          {isStartTimer && (
                            <div className='text-center mb-3'>
                              <span className='h3 font-medium text-red-600'>{`0${Math.floor(countDown / 60)} : ${Math.floor(countDown % 60) < 10 ? '0' + Math.floor(countDown % 60) : Math.floor(countDown % 60)}`}</span>
                              <p className='font-medium text-current text-xs lg:text-sm'>Your ticket will be held for 5mins, after which it’ll be released for sale.</p>
                            </div>
                          )}

                          {eventTicketDetail.tickets.map((item, index) => {

                            
                            const { is_ticket_schedule, ticket_name, ticket_price, ticket_quantity, ticket_start_time, ticket_end_time, ticket_type, ticket_used_quantity, ticket_description, ticket_limit } = item

                            const valueAfterFilter = quantity.filter(el=>{
                                return el.ticket_name ==ticket_name
                                })

                             
                            let availableTicket = 1
                            if (is_ticket_schedule === 1) {
                              let tt = moment().isBetween(moment.unix(ticket_start_time), moment.unix(ticket_end_time))
                              availableTicket = tt ? 1 : 0
                            }

                            let stock = parseInt(ticket_quantity) - parseInt(ticket_used_quantity)
                            let availableStock = stock >= ticket_limit ? ticket_limit : stock

                            return (
                              <>
                              
                              <div className={`shadow p-3 mb-5 bg-white rounded flex-col ${valueAfterFilter.length > 0 ? `border border-violet-700` : `border`}`} key={index}>
                                <div className='align-items-start mb-1 columns-2 relative'>
                                  <div className='relative'>
                                    <span className='text-[0.8125rem] lg:text-base font-semibold block text-[#32325d]'>{ticket_name}</span>
                                    <span className='text-base lg:text-md  font-semibold mb-0 block text-[#32325d]'>{ticket_type === 1 ? `$${parseFloat(ticket_price).toFixed(2)}` : 'Free'}</span>
                                  </div>
                                  {availableTicket === 1 ? (
                                    availableStock > 0 ? (
                                      <div className='relative'>
                                        <div className='absolute right-0'>
                                          <CounterInput
                                            wrapperStyle={{
                                              borderWidth: 1,
                                              borderColor: '#753ff6',
                                              borderStyle: 'solid',
                                              borderRadius: 4,
                                            }}
                                            btnStyle={{
                                              backgroundColor: '#753ff6',
                                              color: '#fff',
                                              paddingTop: 0,
                                              paddingBottom: 0,
                                            }}
                                            inputStyle={{ paddingTop: 0, paddingBottom: 0, width: 30 }}
                                            min={0}
                                            max={availableStock}
                                            onCountChange={(count) => onHandleSelect(count, item)}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className='d-flex flex-col text-right ml-2 min-w-50 ab'>
                                        <span className='h5 font-weight-bold mb-0'>0</span>
                                        <span className='h5 text-xs text-red-600 font-medium mb-0 block'>sold out</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className='px-2 border border-light rounded'>
                                      <span className='h5 mb-0'>0</span>
                                    </div>
                                  )}
                                </div>
                                {is_ticket_schedule === 1 && <p className='h5 font-weight-bold mb-1'>{moment().isBefore(moment.unix(ticket_end_time)) ? moment().isBefore(moment.unix(ticket_start_time)) ? <span className='text-red-600 text-[0.8125rem]'>{`Sales starts ${moment.unix(ticket_start_time).format('MMM DD YYYY h:mm A')}`}</span> : <span className='text-danger'>{`Sales ends ${moment.unix(ticket_end_time).format('MMM DD YYYY h:mm A')}`}</span> : <span className='text-red-600'>{`Sales ended at ${moment.unix(ticket_end_time).format('MMM DD YYYY h:mm A')}`}</span>}</p>}

                                {ticket_description.length > 0 && <span className='text-gray-800 text-xs lg:text-sm'>{ticket_description}</span>}
                                <span className='mt-1 block text-gray-500 text-[0.8125rem] lg:text-sm'>Limit : Up to {ticket_limit} tickets per person</span>
                              </div>
                              </>
                             
                            )
                          })}

                          {/* ---calculations part----- */}

                          {isStartTimer && (
                          <div className='row mt-5'>
                            <div className='col-sm-12 mt-3'>
                              <span className='font-medium'>
                                Ticket Price:&nbsp;&nbsp;
                                {`$${parseFloat((ticketsPrice * (100 - promoCodeDiscount)) / 100).toFixed(2)}`}
                              </span>
                              {eventTicketDetail?.is_base_fee === 0 && (
                                <span className='font-medium ml-4'>
                                  Fee: &nbsp;&nbsp;
                                  {`$${ticketFee > 0 ? parseFloat((ticketFee * (100 - promoCodeDiscount)) / 100).toFixed(2) : 0}`}
                                </span>
                              )}
                            </div>
                          </div>
                          )}
                          {isStartTimer && (
                            <>
                              {promoCode.length > 0 && promoCodeDiscount > 0 ? (
                                <div className={`promo-view mt-4  p-2  ${promoCode != '' ? `border border-violet-700` : `border`} shadow rounded relative`}>
                                  <span className='font-bold mr-4'>
                                    {promoCodeDiscount}% applied (-$
                                    {parseFloat((totalPrice * promoCodeDiscount) / 100).toFixed(2)})
                                  </span>
                                  <button className='btn btn-remove bg-red-600 text-white absolute outline-0 right-2 top-1.5 px-5 py-0.5 rounded ' onClick={onHandleRemovePromo}>
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                
                                <div className={`promo-view mt-3 ${promoCode != '' ? `border border-violet-700` : `border`} shadow rounded p-1 relative`}>

                                  <Input className='form-control outline-0 p-2 outline-0 remove' placeholder='Promo Code' onChange={(e) => setPromoCode(e.target.value)} value={promoCode} autoCapitalize={'none'} maxLength={7} />
                                  <button className={`${promoCode == '' ? `bg-gradient-to-r p-[4px] from-gray-200 to-gray-200` : ` hover:bg-gradient-to-r p-[4px] hover:from-[#753ff6] hover:to-[#03a9f4] bg-gradient-to-r p-[4px] from-[#753ff6] to-[#5e72e4]`} absolute outline-0 right-1 btn btn-apply text-white px-8 py-2 rounded`} onClick={onHandleApplyPromo}>
                                    Apply
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                          <div className='mt-3 text-sm font-medium text-[#fb6340]'>{`WARNING! Please input correct email address to receive your tickets 🎟️`}</div>
                          <div className='row mt-2'>
                            <div className='col-sm-12'>
                            {/* className={`form-control outline-0 p-2 border w-full rounded ${email != '' ? `border border-violet-700` : `border`} shadow`} */}
                              <Input className={`form-control outline-0 p-2 border w-full rounded ${email != '' ? `border border-violet-700` : `border`} shadow remove`} placeholder='Email' onChange={(e) => setEmail(e.target.value)} value={email} autoCapitalize={'none'} />
                            </div>
                          </div>
                          <div className='row mt-2'>
                            <div className='col-sm-12'>                          

                              <Input className={`form-control outline-0 p-2 border w-full rounded ${confirmEmail != '' ? `border border-violet-700` : `border`} shadow mt-1 remove`} placeholder='Confirm Email' onChange={(e) => setConfirmEmail(e.target.value)} value={confirmEmail} autoCapitalize={'none'} />
                            </div>
                          </div>
                          {/* -- More fields --- */}
                          <div className='row mt-3'>
                            <div className='col-sm-12'>
                              <Input className={`form-control outline-0 p-2 border w-full rounded ${phone != '' ? `border border-violet-700` : `border`} shadow remove`} placeholder='Phone' onChange={(e) => setPhone(e.target.value)} value={phone} autoCapitalize={'none'} />
                            </div>
                          </div>
                          <div className='mt-3 columns-2'>
                            <div className='col-sm-6'>
                              <Input className={`form-control outline-0 p-2 border w-full rounded ${first_name != '' ? `border border-violet-700` : `border`} shadow remove`} placeholder='First name' onChange={(e) => setFirstName(e.target.value)} value={first_name} autoCapitalize={'none'} />
                            </div>
                            <div className='col-sm-6'>
                              <Input className={`form-control outline-0 p-2 border w-full rounded ${last_name != '' ? `border border-violet-700` : `border`} shadow remove`} placeholder='Last name' onChange={(e) => setLastName(e.target.value)} value={last_name} autoCapitalize={'none'} />
                            </div>
                          </div>

                          {parseFloat((totalPrice * (100 - promoCodeDiscount)) / 100) > 0 && first_name !== '' && last_name !== '' && email !== '' && phone !== '' && (
                            <>                              
                              {paymentRequest && isApplePay && (
                                <>
                                  <PaymentRequestButtonElement className='mt-3 mb-10' options={{ paymentRequest }} />
                                  <div className='hr-text border-t-2 mt-5 text-center pt-4 mb-10 font-semibold '> Or Pay with card </div>

                                </>
                              )}


                              <div className='row mt-3'>
                                <div className='col-sm-12'>
                                  <Input className={`form-control outline-0 p-2 border w-full rounded ${card_no != '' ? `border border-violet-700` : `border`} shadow remove`} placeholder='Credit card number' onChange={(e) => setCardNo(cardNumberFormat(e.target.value))} value={card_no} autoCapitalize={'none'} maxLength={22} />
                                </div>
                              </div>
                              <div className='flex'>
                                <div className='col-sm-4 mr-1 w-full'>
                                  <Input className={`form-control outline-0 p-2 border w-full rounded ${card_exp != '' ? `border border-violet-700` : `border`} shadow mt-3 remove`} placeholder='MM/YY' onChange={(e) => setCardExp(cardExpFormat(e.target.value))} value={card_exp} autoCapitalize={'none'} maxLength={5} />
                                </div>
                                <div className='col-sm-4 mr-1 w-full'>
                                  <Input className={`form-control outline-0 p-2 border w-full rounded ${card_cvv != '' ? `border border-violet-700` : `border`} shadow mt-3 remove`} placeholder='CVV' onChange={(e) => setCardCvv(e.target.value)} value={card_cvv} autoCapitalize={'none'} maxLength={4} />
                                </div>
                                <div className='col-sm-4 w-full'>
                                  <Input className={`form-control outline-0 p-2 border w-full rounded ${zip != '' ? `border border-violet-700` : `border`} shadow mt-3 remove`} placeholder='ZIP' onChange={(e) => setZip(e.target.value)} value={zip} autoCapitalize={'none'} maxLength={8} />
                                </div>
                              </div>
                              <span className='mt-4' style={{ fontSize: '0.8125rem' }}>
                                {`* By clicking Apple Pay or checkout, you agree to JTL, Technologies terms of conditions and privacy policy. You also understand that JTL’s service fee is non refundable. Furthermore organizers have the sole right to approve or decline refunds. JTL Technologies shall not be held liable for refunds, chargebacks. Please contact the organizer for refunds by clicking refund on the ticket detail page. Please note, there are absolutely no refunds if the ticket has been redeemed or scanned or the event is over. Refunds shall be evaluated on a case by case basis by the organizer and evaluated based on circumstances.`}
                              </span>
                            </>
                          )}
                          <div className='row mt-6 lg:w-full lg:flex'>
                            <div className='col-sm-3 mb-2 lg:w-1/3 lg:mr-5'>
                              <button className='rounded-md bg-gradient-to-r p-[3px] from-[#fb6340] to-[#f5365c] w-full outline-0' onClick={onHandleBack}>
                                <div className='btn bg-white font-medium px-8 p-2 rounded-sm  hover:bg-gradient-to-r p-[10px] hover:from-[#fb6340] hover:to-[#f5365c] hover:text-white capitalize'>Go Back</div>
                              </button>
                            </div>

                            <div className='col-sm-9 mb-2 w-full'>
                              <button disabled={isSubmit} className='rounded-md bg-gradient-to-r p-[3px] from-[#6938dc] to-[#f472b6] w-full outline-0' onClick={onBuyTickets}>
                                <div className='btn bg-white font-medium px-8 rounded-sm hover:bg-gradient-to-r p-[10px] hover:from-[#6938dc] hover:to-[#f472b6] hover:text-white capitalize' >
                                  {selectedTickets.length === 0 ? `Checkout` : parseFloat((totalPrice * (100 - promoCodeDiscount)) / 100) === 0 ? `RSVP` : `Checkout - Total $${parseFloat((totalPrice * (100 - promoCodeDiscount)) / 100).toFixed(2)}`}
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <span></span>
              )}
            </section>
          )}
        </div>
      ) : (
        <>
          <spna className='text-xl m-2'>
          
          {/* Loading.... */}
          
          </spna>
        </>
      )}
    </>
  )
}

export async function getServerSideProps(context) {
  const arr = context.query.slug.split('-')
  // const slug = atob(arr[Number(arr.length-2)])
  const slug = arr[Number(arr.length - 1)]

  const params = {
    event_id: slug,
    // event_id:context.query.slug,
  }

  const response = await axios.post(`${API_URL}/event/eventTicketDetail`, params)
  return { props: { resServerSide: response.data.payload } }
}
