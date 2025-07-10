// :white_tick: :three: Cart.js — Show cart
export default function Cart({ cart, total, placeOrder, phone, setPhone }) {
  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>            {item.name} x {item.qty} = ₹{item.price * item.qty}
          </li>
        ))}
      </ul>
      <h3>Total: ₹{total}</h3>
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