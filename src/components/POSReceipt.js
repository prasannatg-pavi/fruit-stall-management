// POSPrinter.js
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import Receipt from './Receipt';
const POSPrinter = ({cart, total}) => {
  const componentRef = useRef();
  const items = [
    { name: 'Coffee', price: 90 },
    { name: 'Sandwich', price: 150 },
    { name: 'Cake', price: 70 },
  ];
  return (
    <div>
      <Receipt ref={componentRef} cart={cart} total={total} />
      <ReactToPrint
        trigger={() => <button>Print Receipt</button>}
        content={() => componentRef.current}
      />
    </div>
  );
};
export default POSPrinter;