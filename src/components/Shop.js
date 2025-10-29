import React, { useRef } from "react";
import "../styles/style.css"
import Cart from "./Cart";
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Receipt from "./Receipt";
import { useReactToPrint } from "react-to-print";
import POSPrinter from "./POSReceipt";
// :white_tick: :three: Cart.js — Show cart
export default function Shop({ shops, cart, total, placeOrder, phone, setPhone, 
  paymentMethod, setPaymentMethod,
  cusName, setCusName, removeFromCart, showAdminDock }) {
  let shop = shops[0]
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const receiptRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current
  })

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        // onAfterOpen={afterOpenModal}
        // onRequestClose={closeModal}
        // style={customStyles}
        contentLabel="Example Modal"
      >
        <div
          onClick={() => { setIsOpen(false) }}

          style={{
            width: "fit-content",
            cursor: "pointer",
            float: "right",
            border: "1px solid red",
            // padding:"10px",
            borderRadius: "30px",
            height: "30px",
            width: "30px",
            textAlign: "center",
            // placeContent:"center",
            backgroundColor: "red",
            color: "white",
            fontSize: "19px",
            fontWeight: "bold"
          }}>&times;</div>
        <div
          className="modalCartReceipt"
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%"
          }}>
          <div style={cart?.length?{
            flex: 0.5,
            height: "75vh",
            overflow: "overlay"
          }: {
             flex: 1,
            height: "75vh",
            overflow: "overlay"
          }}>
            <Cart cart={cart} total={total} placeOrder={placeOrder}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cusName={cusName} setCusName={setCusName}
              phone={phone} setPhone={setPhone} removeFromCart={removeFromCart} />
          </div>
          <div style={cart?.length?{
            flex: 0.5, height: "75vh",
            overflow: "overlay"
          }: {display:"none"}}>
            <Receipt ref={receiptRef} cart={cart} total={total}
            //  orderNumber={orderNumber}
            />
            {/* <POSPrinter
             ref={receiptRef}
             cart={cart} total={total} /> */}
          </div>
        </div>
      </Modal>
      <div className="bannerArea">
        <div className="bannerLeft">
          <div style={{
            display:"flex",
            flexDirection:"row"
          }}>
            
          <img className="freshuitLogoTop" src={require("..//assets//icons//freshuit_transparent.png")} 
    />
    <div>
          <div style={{ fontWeight: "bold" }}>{shop?.name}</div>
          <div>{shop?.mobile_number}</div>
          </div>
          </div>
        </div>
        <div className="bannerRight">
          <div style={{ display: "flex", float: "right" }}>
            <div>
              <img
                onClick={() => {
                  setIsOpen(true);
                }}
                style={{ width: "30px", marginRight: "20px", marginTop: "5px" }} src={require("../assets/icons/cart_white.webp")} />

              <div className="cartEncircled">{cart?.length}</div>

            </div>
            <div>
              <img
                onClick={
                  showAdminDock
                }
                style={{ width: "30px", marginTop: "5px" }} src={require("../assets/icons/admin.png")} />

            </div>
          </div>
        </div>
      </div>
    </>
  )
}