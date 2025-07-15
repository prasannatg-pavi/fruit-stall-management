import React from "react";
import "../styles/style.css"
import Cart from "./Cart";
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
// :white_tick: :three: Cart.js — Show cart
export default function Shop({shops, cart, total, placeOrder, phone, setPhone }) {
    let shop = shops[0]
      let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);
  return (
    <>
    <Modal
        isOpen={modalIsOpen}
        // onAfterOpen={afterOpenModal}
        // onRequestClose={closeModal}
        // style={customStyles}
        contentLabel="Example Modal"
      >

        <Cart cart={cart} total={total} placeOrder={placeOrder} 
        phone={phone} setPhone={setPhone} />
              <div onClick={()=>{setIsOpen(false)}}>
                Close
                </div>              
      </Modal>
    <div className="bannerArea">
        <div className="bannerLeft">
      <div style={{fontWeight:"bold"}}>{shop?.name}</div>
      <div>{shop?.mobile_number}</div>
      </div>
      <div className="bannerRight">
        <div style={{width:"50px", float:"right"}}>
        <img 
        onClick={()=>{
          setIsOpen(true);
        }}
        style={{width:"30px", marginTop:"5px"}} src= {require("../assets/icons/cart_white.webp")} />
        
        <div className="cartEncircled">{cart?.length}</div>
        </div>
      </div>
      </div>
      </>
  )
}