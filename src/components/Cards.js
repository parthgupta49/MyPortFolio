import React from 'react'
import Card from './Card'

const Cards = ({ data }) => {
  return (
    <div className='flex gap-4 mt-[5rem]'>
      {
        data.map((item, index) => {
          return <Card key={index} card = {item} />
        }
        )
      }
    </div>
  )
}

export default Cards