import React from 'react'
import './App.css' // Add styles for the spinner
import Encoder from './components/Encoder'
import Decoder from './components/Decoder'

const DNSApp = () => {
  return (
    <div className='dns-app p-8 px-24'>
      <h1 className='text-4xl font-semibold text-center'>DNS Encoder/Decoder</h1>
      <div className='grid grid-cols-8 gap-4 mt-24'>
        <Encoder />
        <Decoder />
      </div>
    </div>
  )
}

export default DNSApp
