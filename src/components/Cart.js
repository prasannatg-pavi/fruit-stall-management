import { QRCodeCanvas } from "qrcode.react";

// :white_tick: :three: Cart.js — Show cart
export default function Cart({ cart, total, placeOrder, phone, setPhone, removeFromCart }) {
  console.log("item", cart)
  let sno = 0;
  return (
    <>
      {cart?.length ? <div>
        <h2>Cart</h2>
        <div>
          {cart.length} item{cart.length > 1 ? "s" : ""} in cart
        </div>
        <ul className="ulcart">
          {cart.map((item, index) => (
            <li className="licart" key={item.id}>
              <div style={{
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
                    className="btnCartReceipt" onClick={() => removeFromCart(index)}>Remove</button>
                </div>
              </div>

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
        <div style={{ textAlign: 'center' }}>
          <h3>Scan to Pay with UPI</h3>
          <QRCodeCanvas
            value={`upi://pay?pa=tgprasanna12-1@okicici&pn=Prasanna%20TG&am=${total}&cu=INR&tn=FRUIT%20STALL`}
            size={200}
            includeMargin={true}
          />
        </div>
      </div> : <>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <img src={require("../assets/icons/empty_state_cart.png")}
            style={{ width: "200px", height: "200px" }} />
          <div style={{ marginTop: "10px", fontSize: "0.8em", fontWeight: "bolder" }}>Your cart is empty</div></div>
      </>}
    </>


  )
}