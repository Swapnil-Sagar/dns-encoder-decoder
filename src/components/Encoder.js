import React, { useState } from 'react'
import { dnsRecordTypes } from '../constants'
import { Buffer } from 'buffer'
import '../App.css'

const Encoder = () => {
  const [dnsRecords, setDnsRecords] = useState([
    { domain: '', type: 'A', class: 1, ttl: 3600, data: '' }
  ])
  const [encodedRecords, setEncodedRecords] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const encodeDNSRecords = (records) => {
    let buffers = []

    records.forEach((record) => {
      // Encode domain name
      const domainParts = record.domain.split('.')
      domainParts.forEach((part) => {
        const labelBuffer = Buffer.from([part.length, ...Buffer.from(part, 'utf-8')])
        buffers.push(labelBuffer)
      })
      buffers.push(Buffer.from([0])) // Null byte to terminate the domain name

      // Encode type (2 bytes)
      const typeBuffer = Buffer.alloc(2)
      typeBuffer.writeUInt16BE(dnsRecordTypes[record.type], 0)
      buffers.push(typeBuffer)

      // Encode class (2 bytes)
      const classBuffer = Buffer.alloc(2)
      classBuffer.writeUInt16BE(record.class, 0)
      buffers.push(classBuffer)

      // Encode TTL (4 bytes)
      const ttlBuffer = Buffer.alloc(4)
      ttlBuffer.writeUInt32BE(record.ttl, 0)
      buffers.push(ttlBuffer)

      // Encode data length (2 bytes)
      const dataBuffer = Buffer.from(record.data, 'hex')
      const dataLengthBuffer = Buffer.alloc(2)
      dataLengthBuffer.writeUInt16BE(dataBuffer.length, 0)
      buffers.push(dataLengthBuffer)

      // Add the actual data
      buffers.push(dataBuffer)
    })

    const finalBuffer = Buffer.concat(buffers)
    return finalBuffer.toString('hex')
  }

  const handleRecordChange = (index, field, value) => {
    const updatedRecords = [...dnsRecords]
    updatedRecords[index][field] = value
    setDnsRecords(updatedRecords)
  }

  const addRecord = () => {
    setDnsRecords([...dnsRecords, { domain: '', type: 'A', class: 1, ttl: 3600, data: '' }])
  }

  const handleEncode = () => {
    setLoading(true)
    setError('')
    try {
      const encoded = encodeDNSRecords(dnsRecords)
      setEncodedRecords(encoded)
    } catch (err) {
      setError('Encoding failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='col-span-5'>
      {' '}
      <h2 className='text-2xl mb-8'>Encode DNS Records</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {dnsRecords.map((record, index) => (
          <div key={index} className='bg-white p-4 rounded-lg shadow-md'>
            <label>
              Domain:
              <input
                type='text'
                value={record.domain}
                onChange={(e) => handleRecordChange(index, 'domain', e.target.value)}
                disabled={loading}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
              />
            </label>
            <label>
              Type:
              <select
                value={record.type}
                onChange={(e) => handleRecordChange(index, 'type', e.target.value)}
                disabled={loading}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
              >
                {Object.keys(dnsRecordTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Class:
              <input
                type='number'
                value={record.class}
                onChange={(e) => handleRecordChange(index, 'class', e.target.value)}
                disabled={loading}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
              />
            </label>
            <label>
              TTL:
              <input
                type='number'
                value={record.ttl}
                onChange={(e) => handleRecordChange(index, 'ttl', e.target.value)}
                disabled={loading}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
              />
            </label>
            <label>
              Data (IP in hex):
              <input
                type='text'
                value={record.data}
                onChange={(e) => handleRecordChange(index, 'data', e.target.value)}
                disabled={loading}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
              />
            </label>
          </div>
        ))}
      </div>
      <div className='flex mt-4'>
        <button
          onClick={addRecord}
          disabled={loading}
          className='px-4 py-2 text-white bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
        >
          + Add Record
        </button>
        <button
          onClick={handleEncode}
          disabled={loading}
          className='ml-2 px-4 py-2 text-white bg-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200'
        >
          Encode Records
        </button>
      </div>
      {loading ? <div className='spinner'></div> : null}
      {error ? <div className='error'>{error}</div> : null}
      <h2 className='mt-8'>Encoded DNS Records</h2>
      <pre className='bg-gray-100 w-3/4 p-4 rounded-lg shadow-md'>{encodedRecords}</pre>
    </div>
  )
}

export default Encoder
