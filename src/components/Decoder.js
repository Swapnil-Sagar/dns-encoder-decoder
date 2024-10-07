import React, { useState } from 'react'
import '../App.css'
import { Buffer } from 'buffer'

const Decoder = () => {
  const [hexString, setHexString] = useState('')
  const [loading, setLoading] = useState(false)
  const [decodedRecords, setDecodedRecords] = useState([])
  const [error, setError] = useState('')

  const decodeDNSRecords = (hexData) => {
    try {
      const records = []
      let buffer = Buffer.from(hexData, 'hex')
      let offset = 0

      while (offset < buffer.length) {
        const record = {}

        // Decode domain name
        const domainParts = []
        while (buffer[offset] !== 0) {
          const length = buffer[offset++]
          const label = buffer.slice(offset, offset + length).toString('utf-8')
          domainParts.push(label)
          offset += length
        }
        offset++ // Move past the null byte

        record.domain = domainParts.join('.')

        // Decode record type (2 bytes)
        record.type = buffer.readUInt16BE(offset)
        offset += 2

        // Decode class (2 bytes)
        record.class = buffer.readUInt16BE(offset)
        offset += 2

        // Decode TTL (4 bytes)
        record.ttl = buffer.readUInt32BE(offset)
        offset += 4

        // Decode data length (2 bytes)
        const dataLength = buffer.readUInt16BE(offset)
        offset += 2

        // Decode data (variable length)
        record.data = buffer.slice(offset, offset + dataLength).toString('hex')
        offset += dataLength

        records.push(record)
      }

      return records
    } catch (err) {
      throw new Error('Invalid hex data format or incomplete input.')
    }
  }

  const handleDecode = () => {
    setError('')
    setDecodedRecords([])
    setLoading(true)
    var re = /[0-9A-Fa-f]{6}/g
    try {
      if (re.test(hexString)) {
        const decoded = decodeDNSRecords(hexString)
        setDecodedRecords(decoded)
      } else {
        setError('Invalid hex string format. Please enter a valid hex string.')
      }
    } catch (err) {
      setError('Decoding failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='col-span-3'>
      <h2 className='text-2xl mb-8'>Decode DNS Hex String</h2>
      <input
        className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
        type='text'
        value={hexString}
        onChange={(e) => setHexString(e.target.value)}
        placeholder='Enter hex string to decode'
        disabled={loading}
      />
      <button
        className='bg-blue-500 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={handleDecode}
        disabled={loading}
      >
        Decode
      </button>{' '}
      <h3 className='mt-4'>Decoded DNS Records:</h3>
      {error ? (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>
          {error}
        </div>
      ) : (
        <pre className='bg-gray-100 p-4 shadow-md rounded'>
          {JSON.stringify(decodedRecords, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default Decoder
