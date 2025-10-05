'use client'

import { QRCodeCanvas } from "qrcode.react";
import { supabase } from '../supabaseClient'
import { useEffect, useState } from "react";

// :white_tick: :three: Cart.js — Show cart
export default function Cart({ cart, total, placeOrder, paymentMethod, setPaymentMethod, phone, setPhone, cusName, setCusName,  removeFromCart }) {
  console.log("item", cart)
  let sno = 0;
  const [stockMap, setStockMap] = useState(new Map()); // ✅ FIXED
const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false); // ✅

  const getCurrentStock = async () => {
console.log("!@@@@@@@@@@@@@@@@@@@@@@@", cart)
  const orderedFruitIds = cart.map(c => c.id);
  const { data: orderedFruits, error: fetchError } = await supabase
    .from("fruits")
    .select('id, stock')
    .in('id', orderedFruitIds)

  console.log("+++++++++++++++==", orderedFruits)
  // validate all fruits have enough stocks
     const map = new Map(orderedFruits.map(f => [f.id, f.stock]));
    console.log("STOCK MAP", map);

    setStockMap(map);

      // ✅ Check if any item is out of stock
  let outOfStock = false;
  for (let item of cart) {
    const stock = map.get(item.id);
    let match = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
    if (!match) continue;
    let qty = parseFloat(match[1]);
    let unit = match[2];
    let requiredQty = unit === "kg" ? qty * 1000 : qty;
    
    if (stock !== undefined && stock < requiredQty) {
      outOfStock = true;
      break;
    }
  }

  setHasOutOfStockItems(outOfStock); // ✅ update state

  }
  useEffect(()=>{
    getCurrentStock()
  },[])

  useEffect(()=>{
    getCurrentStock()  
  }, [cart])

  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '900px',
    // margin: '0 auto',
    // padding: '10px',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
  };

  const halfWidthSection = {
    width: '50%',
    padding: '0px 16px',
    boxSizing: 'border-box',
  };

  const sectionBoxStyle = {
    // border: '1px solid #ccc',
    // borderRadius: '8px',
    padding: '5px 0px',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginTop: '8px',
    marginBottom: '12px',
    borderRadius: '4px',
    border: '1px solid #aaa',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    fontSize: '16px',
  };

  // Responsive styles using a media query (with inline workaround)
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  if (mediaQuery.matches) {
    halfWidthSection.width = '100%';
  }
  // fetch stock for all ordered fruits
  return (
    <>
      {cart?.length ? <div>
        <h2>Cart</h2>
        <div>
          {cart.length} item{cart.length > 1 ? "s" : ""} in cart
        </div>
        <ul className="ulcart">
          {cart.map((item, index) => {
              console.log("ITEMMMMMMMMMMMMMMMM", item)
            const available = stockMap && stockMap.get(item.id)

                const weightInGrams = item.weight;// convertToGrams(item.weight);
            let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
            let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
            let fruit_unit = fruit_weightMatch[2];
              let requiredQty = fruit_unit === "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue;
            console.log("123123123123123132", item, available, fruit_unit == "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue);
// alert(available+"---"+fruit_newWeightValue)
            return (
            <li className="licart" key={item.id}>
              <div style={available < requiredQty ? {
                  display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border:"2px solid red",
                padding:"5px",
                borderRadius:"5px",
                color:"red"
              }
              :{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ flex: 0.05 }}>
                  {++sno}
                </div>
                <div style={{ flex: 0.4 }}>

                  <span style={{ fontWeight: "bold" }}>{item.name}</span> <br />
                  <span>₹  {item.price} per kg</span> <br />
                  {/* <span>{JSON.stringify(item)}</span> */}
                </div>
                <div style={{ flex: 0.1 }}>
                  {item.weight}
                </div>
                <div style={{ flex: 0.1 }}>
                  {/* {item.name} x {item.weight} = */}
                  {item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[2] == "gm" ?
                    "₹" + ((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2) :
                    "₹" + (item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]).toFixed(2)}
                </div>
                <div style={{ flex: 0.1 }}>
                  <button
                    style={{
                      color: "red",
                      backgroundColor: "white",
                      color: "red",
                      border: "1px solid red",
                      borderRadius: "10px",
                      cursor: "pointer"
                    }}
                    className="btnCartReceipt" onClick={() => {
                      removeFromCart(index)
                    
                      }}>Remove</button>
                </div>
              </div>

            </li>
          )})}
        </ul>
        {hasOutOfStockItems && (
  <div style={{ color: "red", fontWeight:"bold", marginLeft:"25px",
   marginTop: 10 }}>
    ⚠️ One or more items are out of stock. Please update your cart.
  </div>
)}

{!hasOutOfStockItems ? (
  <>
  <h3>Total: ₹{total.toFixed(2)}</h3>
      <div style={containerStyle}>
      {/* Left: Customer Details */}
      <div style={halfWidthSection}>
        <div style={sectionBoxStyle}>
          <h3>Customer Details</h3>
          <input
            type="text"
            placeholder="Customer Name"
            value={cusName}
            onChange={e => setCusName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Customer WhatsApp"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Right: Payment Method */}
      <div style={halfWidthSection}>
        <div style={sectionBoxStyle}>
          <h3>Payment Method</h3>
          <label style={labelStyle}>
            <input
              type="radio"
              value="Cash"
              checked={paymentMethod === 'Cash'}
              onChange={setPaymentMethod}
            />
            Cash
          </label>
          <label style={labelStyle}>
            <input
              type="radio"
              value="UPI"
              checked={paymentMethod === 'UPI'}
              onChange={setPaymentMethod}
            />
            UPI
          </label>
        </div>
      </div>
    </div>
        {/* <h3>Customer Details</h3>

        <input
          type="text"
          placeholder="Customer Name"
          value={cusName}
          onChange={e => setCusName(e.target.value)}
        />
  <br/>
        <input
          type="text"
          placeholder="Customer WhatsApp"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <div>
      <h3>Payment Method</h3>
      <label>
        <input
          type="radio"
          value="Cash"
          checked={paymentMethod === 'Cash'}
          onChange={setPaymentMethod}
        />
        Cash
      </label>


      <label>
        <input
          type="radio"
          value="UPI"
          checked={paymentMethod === 'UPI'}
          onChange={setPaymentMethod}
        />
        UPI
      </label>

      <br /><br />
    </div> */}
        <button onClick={placeOrder}>Place Order</button>
        <div style={{ textAlign: 'center' }}>
          <h3>Scan to Pay with UPI</h3>
          <QRCodeCanvas
            value={`upi://pay?pa=tgprasanna12-1@okicici&pn=Prasanna%20TG&am=${total}&cu=INR&tn=FRUIT%20STALL`}
            size={200}
            includeMargin={true}
          />
        </div>
  </>
): null}
        
      </div> : <>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <img src={require("../assets/icons/empty_state_cart.png")}
            style={{ width: "200px", height: "200px" }} />
          <div style={{ marginTop: "10px", fontSize: "0.8em", fontWeight: "bolder" }}>Your cart is empty</div></div>
      </>}
    </>


  )
}