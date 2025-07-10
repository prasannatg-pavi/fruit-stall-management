// :white_tick: :five: App.js — Glue it all
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import FruitList from './components/FruitList'
import Cart from './components/Cart'
import Receipt from './components/Receipt'
import { useReactToPrint } from 'react-to-print'
function App() {
  const [fruits, setFruits] = useState([])
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState(null)
  const receiptRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current
  })
  useEffect(() => {
    fetchFruits()
  }, [])
  const fetchFruits = async () => {
    const { data, error } = await supabase.from('fruits').select('*')
    if (error) console.log(error)
    else setFruits(data)
  }
  const addToCart = fruit => {
    const exists = cart.find(item => item.id === fruit.id)   
    if (exists) {
      setCart(cart.map(item =>
        item.id === fruit.id ? { ...item, qty: item.qty + 1 } : item
      ))
    } else {
      setCart([...cart, { ...fruit, qty: 1 }])
    }
    setTotal(total + fruit.price)
  }
  const placeOrder = async () => {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ total, paid: true, customer_phone: phone }])
      .select().single()
    if (orderError) {
      console.log(orderError)
      return
    }
    setOrderNumber(order.order_number)
    for (let item of cart) {
      await supabase.from('order_items').insert([
        {
          order_id: order.id,         fruit_id: item.id,         quantity: item.qty,
          unit_price: item.price
        }
      ])
    }
    handlePrint()
    sendWhatsApp(order)
    setCart([])
    setTotal(0)
    setPhone('')
  }
  const sendWhatsApp = (order) => {
    const items = cart.map(item => `${item.name} x ${item.qty}`).join('%0A')
    const message = `**Fruit Stall Bill** %0AOrder No: ${order.order_number}%0A${items}%0ATotal: ₹${total}`
    const url = `https://wa.me/${phone}?text=${message}` 
    window.open(url, '_blank')
  }
  return (
    <div>
      <h1>Fruit Stall POS</h1>
      <FruitList fruits={fruits} addToCart={addToCart} />
      <Cart cart={cart} total={total} placeOrder={placeOrder} phone={phone} setPhone={setPhone} />
      <div>
        <Receipt ref={receiptRef} cart={cart} total={total} orderNumber={orderNumber} />
      </div>
    </div>
  )
}
export default App


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   console.log("Prasanna")
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
