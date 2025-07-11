// :white_tick: :two: FruitList.js — Pick fruits

import React from 'react'
export default function FruitList({ fruits, addToCart }) {
  return (
    <div>
      <h2>Fruits</h2>
      <ul className='fruitsul'>
        {fruits.map(fruit => (
          <li className='fruitsli' key={fruit.id}>
            <div>{fruit.name} — ₹{fruit.price}</div>
            <div style={{marginTop:"10px"}}><button onClick={() => addToCart(fruit)}>Add</button></div>
          </li>
        ))}
      </ul>
    </div>
  )
}