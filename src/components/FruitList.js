// :white_tick: :two: FruitList.js — Pick fruits

import React from 'react'
export default function FruitList({ fruits, addToCart }) {
  return (
    <div>
      <h2>Fruits</h2>
      <ul>
        {fruits.map(fruit => (
          <li key={fruit.id}>            {fruit.name} — ₹{fruit.price}
            <button onClick={() => addToCart(fruit)}>Add</button>
          </li>
        ))}
      </ul>
    </div>
  )
}