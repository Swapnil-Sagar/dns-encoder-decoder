import React, { useState } from 'react'
import { Buffer } from 'buffer'
import './App.css' // Add styles for the spinner

const DNSApp = () => {
  const [dnsRecords, setDnsRecords] = useState([
    { domain: '', type: 'A', class: 1, ttl: 3600, data: '' }
  ])
  const [encodedRecords, setEncodedRecords] = useState('')
  const [decodedRecords, setDecodedRecords] = useState([])
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState('') // Error state
  const [hexString, setHexString] = useState('') // State for input hex string

  // DNS record types stored in JSON object
  const dnsRecordTypes = {
    A: 1,
    AAAA: 28,
    CAA: 257
    // Add more record types here if needed
  }

  // Function to decode DNS records from a hex string with error handling
  const decodeDNSRecords = (hexData) => {
    try {
      const records = []
      let buffer = Buffer.from(hexData, 'hex')
      let offset = 0

      while (offset < buffer.length) {
        const record = {}

        // Decode domain name (labels separated by length)
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

  // Function to encode DNS records to a hex string
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
      typeBuffer.writeUInt16BE(dnsRecordTypes[record.type], 0) // Use JSON object for type code
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

  // Handler to update DNS records
  const handleRecordChange = (index, field, value) => {
    const updatedRecords = [...dnsRecords]
    updatedRecords[index][field] = value
    setDnsRecords(updatedRecords)
  }

  // Handler to add a new record input field
  const addRecord = () => {
    setDnsRecords([...dnsRecords, { domain: '', type: 'A', class: 1, ttl: 3600, data: '' }])
  }

  // Handler for encoding records
  const handleEncode = () => {
    setLoading(true) // Set loading to true when encoding starts
    setError('') // Clear previous error
    try {
      const encoded = encodeDNSRecords(dnsRecords)
      setEncodedRecords(encoded)
    } catch (err) {
      setError('Encoding failed: ' + err.message)
    } finally {
      setLoading(false) // Set loading to false after encoding completes
    }
  }

  // Handler for decoding input hex string
  const handleDecode = () => {
    setError('') // Clear previous error
    setDecodedRecords([]) // Reset decoded records
    setLoading(true) // Set loading to true when decoding starts
    var re = /[0-9A-Fa-f]{6}/g
    try {
      if (re.test(hexString)) {
        const decoded = decodeDNSRecords(hexString)
        setDecodedRecords(decoded)
      } else {
        setError('Invalid hex string format. Please enter a valid hex string.')
      }
    } catch (err) {
      setError('Decoding failed: ' + err.message) // Set error if decoding fails
    } finally {
      setLoading(false) // Set loading to false after decoding completes
    }
  }

  return (
    <div className='dns-app'>
      <h1>DNS Encoder/Decoder</h1>
      <h2>Enter DNS Records</h2>
      {dnsRecords.map((record, index) => (
        <div key={index}>
          <label>
            Domain:
            <input
              type='text'
              value={record.domain}
              onChange={(e) => handleRecordChange(index, 'domain', e.target.value)}
              disabled={loading} // Disable input during loading
            />
          </label>
          <label>
            Type:
            <select
              value={record.type}
              onChange={(e) => handleRecordChange(index, 'type', e.target.value)}
              disabled={loading} // Disable input during loading
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
              disabled={loading} // Disable input during loading
            />
          </label>
          <label>
            TTL:
            <input
              type='number'
              value={record.ttl}
              onChange={(e) => handleRecordChange(index, 'ttl', e.target.value)}
              disabled={loading} // Disable input during loading
            />
          </label>
          <label>
            Data (in hex):
            <input
              type='text'
              value={record.data}
              onChange={(e) => handleRecordChange(index, 'data', e.target.value)}
              disabled={loading} // Disable input during loading
            />
          </label>
        </div>
      ))}
      <button onClick={addRecord} disabled={loading}>
        Add Record
      </button>
      <button onClick={handleEncode} disabled={loading}>
        Encode Records
      </button>
      {loading ? <div className='spinner'></div> : null} {/* Show spinner during loading */}
      <h2>Encoded DNS Records</h2>
      <pre>{encodedRecords}</pre>
      <h2>Decode DNS Hex String</h2>
      <input
        type='text'
        value={hexString}
        onChange={(e) => setHexString(e.target.value)} // Update hex string state
        placeholder='Enter hex string to decode'
        disabled={loading}
      />
      <button onClick={handleDecode} disabled={loading}>
        Decode
      </button>{' '}
      {/* Decode button */}
      <h3>Decoded DNS Records:</h3>
      {error ? (
        <div className='error'>{error}</div>
      ) : (
        <pre>{JSON.stringify(decodedRecords, null, 2)}</pre>
      )}
    </div>
  )
}

export default DNSApp
