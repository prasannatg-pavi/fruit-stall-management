// :white_tick: :three: Cart.js — Show cart
export default function Cart({ cart, total, placeOrder, phone, setPhone }) {
  console.log("item", cart)
  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            {item.name} x {item.weight} =
            {item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[2] == "gm" ?
              "₹" + (item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000 :
              "₹" + (item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1])}
          </li>
        ))}
      </ul>
      <h3>Total: ₹{total.toFixed(2)}</h3>
      <input
        type="text"
        placeholder="Customer WhatsApp"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <button onClick={placeOrder}>Place Order</button>
    </div>
  )
}