import React from 'react'
import Card from './Card'

const Cards = ({ data,isDescriptionShowing }) => {
  return (
    <div className='flex gap-4 mt-[5rem] flex-wrap xl:justify-start justify-center '>
      {
        data.map((item, index) => {
          return <Card key={index} card = {item} isDescriptionShowing = {isDescriptionShowing} />
        }
        )
      }
    </div>
  )
}

export default Cards