import "../styles/style.css"

// :white_tick: :three: Cart.js — Show cart
export default function Shop({shops}) {
    let shop = shops[0]
  return (
    <div className="bannerArea">
        <div className="bannerLeft">
      <div style={{fontWeight:"bold"}}>{shop?.name}</div>
      <div>{shop?.mobile_number}</div>
      </div>
      <div className="bannerRight">
        Place order
      </div>
      </div>
  )
}