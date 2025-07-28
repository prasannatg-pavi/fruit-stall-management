

// :white_tick: :four: Receipt.js — Printable bill
import React from 'react'
const Receipt = React.forwardRef(({ cart, total, orderNumber }, ref) => {
  console.log(" >>>>>>>>>>>>>>>> ", cart, total)
  return (
        <div ref={ref} style={{ padding: '10mm', fontFamily: 'monospace' }}>
      <div style={{textAlign:"right", cursor:"pointer"}}>PRINT</div>
      <h2 style={{ textAlign: 'center' }}>Store Name</h2>
      <p>Date: {new Date().toLocaleDateString()}</p>
      <hr />
      <table width="100%">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="right">Price</th>
            <th align="right">Weight</th>
            <th align="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td align="right">₹{item.price.toFixed(2)}</td>
              <td align="right">{item.weight}</td>
              <td align="right">
                {item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[2] == "gm" ?
                  "₹" + ((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2) :
                  "₹" + (item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]).toFixed(2)}
              
                {/* ₹{((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2)} */}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <p style={{textAlign:"right", fontWeight:"bold", fontSize:"1.2em"}}>Total: ₹{total.toFixed(2)}</p>
      <p style={{ textAlign: 'center' }}>Thank you!</p>
    </div>
    // <div ref={ref}>
    //   <h2> Receipt</h2>
    //   <p>Order No: {orderNumber}</p>
    //   <hr />
    //   <ul>
    //     {cart.map(item => (
    //       <li key={item.id}>            {item.name} x {item.weight} =  {((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2)}
    //       </li>
    //     ))}
    //   </ul>
    //   <hr />
    //   <h3>Total: ₹{total}</h3>
    //   <p>Thank you! Visit again.</p>
    // </div>
  )
})
export default Receipt