

// :white_tick: :four: Receipt.js — Printable bill
import React from 'react'
const Receipt = React.forwardRef(({ cart, total, orderNumber }, ref) => {
  return (
    <div ref={ref}>
      <h2>Fruit Stall Receipt</h2>
      <p>Order No: {orderNumber}</p>
      <hr />
      <ul>
        {cart.map(item => (
          <li key={item.id}>            {item.name} x {item.qty} = ₹{item.price * item.qty}
          </li>
        ))}
      </ul>
      <hr />
      <h3>Total: ₹{total}</h3>
      <p>Thank you! Visit again.</p>
    </div>
  )
})
export default Receipt