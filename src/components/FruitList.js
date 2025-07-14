// :white_tick: :two: FruitList.js — Pick fruits

import React, { useState } from 'react'
export default function FruitList({ fruits, addToCart }) {

  const [weight, setweight] = useState([]);

  const handleChange = (index, input) => {
    const newInput = [...weight]
    newInput[index] = input.target.value;
    fruits[index].weight = input.target.value
    setweight(newInput)
    console.log("FRUITS", fruits)
  }

  return (
    <div>
      <h2>Fruits</h2>
      <ul className='fruitsul'>
        {fruits.map((fruit, index) => (
          <li className='fruitsli' key={fruit.id}>
            <div>{fruit.name} — ₹{fruit.price}</div>
            <div className='divWeightInputUnit'>
               <div>
              <input  key={index} type="text" className="txtWeight"
                value={weight[index] || ''}
              onChange={(e)=> handleChange(index, e, fruits)}
              placeholder={'index - ' +index}/>
            </div>
           
            <div>
              <select type="">
                <option>gm</option>
                <option>kg</option>
              </select>
            </div>
            </div>
            <div style={{marginTop:"10px"}}><button onClick={() => addToCart(fruit)}>Add</button></div>
          </li>
        ))}
      </ul>
    </div>
  )
}