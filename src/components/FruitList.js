
import React, { useState, useEffect } from 'react';

export default function FruitList({ fruits, addToCart }) {
  const weightUnits = ["gm", "kg"];

  const [weights, setWeights] = useState([]);

  // Ensure weights array matches fruits array length
  useEffect(() => {
    setWeights(fruits.map(() => ({ value: '', unit: 'gm' })));
  }, [fruits]);

  const handleWeightChange = (index, e) => {
    const newWeights = [...weights];
    newWeights[index] = { ...newWeights[index], value: e.target.value };
    setWeights(newWeights);
  };

  const handleUnitChange = (index, e) => {
    const newWeights = [...weights];
    newWeights[index] = { ...newWeights[index], unit: e.target.value };
    setWeights(newWeights);
  };

  const handleAddToCart = (fruit, index) => {
    const finalFruit = {
      ...fruit,
      weight: weights[index].value + weights[index].unit
    };
    addToCart(finalFruit);
  };

  return (
    <div className="mainDivWithoutHeader">
      <h2>Fruits</h2>
      <ul className='fruitsul'>
        {fruits.map((fruit, index) => (
          <li title={fruit.name} className='fruitsli' key={fruit.id}>
            <div style={{
              fontWeight: "bold", whiteSpace: "nowrap",/* Prevents the text from wrapping */
              overflow: "hidden",           /* Hides the overflow */
              textOverflow: "ellipsis"
            }}>{fruit.name} </div>
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}> ₹{fruit.price} </span>
              <span style={{ textDecoration: "line-through", fontSize: "12px" }}> ₹{(fruit.price * (1.25)).toFixed(2)} </span>
            </div>
            <div className='divWeightInputUnit'>
              <div style={{ flex: 0.5 }}>
                <input
                  type="text"
                  className="txtWeight"
                  value={weights[index]?.value || ''}
                  onChange={(e) => handleWeightChange(index, e)}
                />
              </div>

              <div style={{
                flex: 0.5,
                display: "flex",
                justifyContent: "space-around",
                margin: " 10px 5px"
              }}>
                <div>
                  <select
                    className='commonButtonStyle'
                    value={weights[index]?.unit || 'gm'}
                    onChange={(e) => handleUnitChange(index, e)}
                  >
                    {weightUnits.map((unit, i) => (
                      <option key={i} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div
                  // style={{ marginTop: "10px" }}
                  >
                    <button
                      className="commonButtonStyle"
                      onClick={() => handleAddToCart(fruit, index)}>Add</button>
                  </div>
                </div>
              </div>
            </div>


          </li>
        ))}
      </ul>
    </div>
  );
}

// // :white_tick: :two: FruitList.js — Pick fruits

// import React, { useState } from 'react'
// export default function FruitList({ fruits, addToCart }) {

//   const [weight, setweight] = useState([]);
//   const weightUnits = ["gm", "kg"];

//   // track both weight and unit per index
//   const [weights, setWeights] = useState(
//     fruits.map(() => ({ value: '', unit: 'gm' }))
//   );

//   const handleWeightChange = (index, e) => {
//     const newWeights = [...weights];
//     newWeights[index].value = e.target.value;
//     setWeights(newWeights);
//   };

//   const handleUnitChange = (index, e) => {
//     const newWeights = [...weights];
//     newWeights[index].unit = e.target.value;
//     setWeights(newWeights);
//   };
//   // const handleChange = (index, input) => {
//   //   const newInput = [...weight]
//   //   newInput[index] = input.target.value;
//   //   fruits[index].weight = input.target.value
//   //   setweight(newInput)
//   //   console.log("FRUITS", fruits)
//   // }

//   //  const handleSelectChange  = (index, input, fruits) => {
//   //   const newInput = [...weight]
//   //   newInput[index] = input.target.value;
//   //   fruits[index].weight = fruits[index].weight + input.target.value
//   //   setweight(newInput)
//   //   console.log("FRUITS", fruits)
//   // }

//   return (
//     <div>
//       <h2>Fruits</h2>
//       <ul className='fruitsul'>
//         {fruits.map((fruit, index) => (
//           <li className='fruitsli' key={fruit.id}>
//             <div>{fruit.name} — ₹{fruit.price}</div>
//             <div className='divWeightInputUnit'>
//               <div style={{ flex: 0.5 }}>
//                 <input key={index} type="text" className="txtWeight"
//                   value={weights[index] && weights[index].value}
//                   onChange={(e) => handleWeightChange(index, e)}
//                 // onChange={(e) => handleChange(index, e, fruits)}
//                 // placeholder={'index - ' + index}
//                 />
//               </div>

//               <div style={{ flex: 0.5 }}>
//                 <select type="">
//                   {weightUnits.map((weightUnit, index) => (
//                     <option
//                       key={index}
//                       value={weights[index] && weights[index].unit}
//                       onChange={(e) => handleUnitChange(index, e)}

//                     // onChange={(e) => handleSelectChange(index, e, fruits)}
//                     // onChange={handleSelectChange}
//                     >
//                       {weightUnit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div style={{ marginTop: "10px" }}><button onClick={() => addToCart(fruit)}>Add</button></div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }