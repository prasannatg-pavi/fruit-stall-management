// :white_tick: :five: App.js — Glue it all
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import FruitList from '../components/FruitList'
import Cart from '../components/Cart'
import Receipt from '../components/Receipt'
import { useReactToPrint } from 'react-to-print'
import Shop from '../components/Shop'
function POS() {
    const [fruits, setFruits] = useState([])
    const [shops, setShops] = useState([])
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
        fetchShop()
    }, [])
    const fetchFruits = async () => {
        const { data, error } = await supabase.from('fruits').select('*')
        if (error) console.log(error)
        else setFruits(data)
    }
    const fetchShop = async () => {
        const { data, error } = await supabase.from('shops').select('*')
        if (error) console.log(error)
        else setShops(data)
    }

    const convertToGrams = (weightStr) => {
        const value = parseFloat(weightStr);
        if (weightStr.toLowerCase().includes('kg')) {
            return value * 1000;
        } else if (weightStr.toLowerCase().includes('gm') || weightStr.toLowerCase().includes('g')) {
            return value;
        }
        return 0; // default if unknown unit
    };


    const addToCart = fruit => {
        const exists = cart.find(item => item.id === fruit.id);

        console.log(fruit, '-------');

        // Extract numeric weight (e.g., 200 from "200gm")
        const weightMatch = fruit.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
        if (!weightMatch) return; // skip if weight format is invalid
        console.log(weightMatch);

        const newWeightValue = parseFloat(weightMatch[1]);
        const unit = weightMatch[2];
        console.log(newWeightValue, "----------------", unit);

        if (exists) {
            setCart(cart.map(item => {
                if (item.id === fruit.id) {
                    // extract existing weight value
                    const existingWeightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
                    const existingWeightValue = existingWeightMatch ? parseFloat(existingWeightMatch[1]) : 0;

                    // Ensure same unit for simplicity
                    // if (existingWeightMatch && existingWeightMatch[2] !== unit) {
                    //   alert('Weight units do not match!');
                    //   return item;
                    // }

                    return {
                        ...item,
                        weight: (newWeightValue) + unit,
                        //   weight: (existingWeightValue + newWeightValue) + unit,
                        //   price: item.price + fruit.price
                        price: fruit.price
                    };
                }
                return item;
            }));
        } else {
            setCart([...cart, { ...fruit }]);
        }

        //   setTotal(total + (unit == "gm" ?  (fruit.price * newWeightValue) / 1000 : (fruit.price * newWeightValue)));
    };

    useEffect(() => {
        let totalPrice = 0;
        let totalWeightInGrams = 0;

        console.log("CART", cart)
        if (cart.length == 0) {
            // const weightInGrams = fruit.weight;// convertToGrams(item.weight);

            // totalWeightInGrams += weightInGrams;
            // totalPrice += fruit.price * (unit == "gm" ? newWeightValue / 1000 : newWeightValue);
        } else {
            cart.forEach(item => {

                const weightInGrams = item.weight;// convertToGrams(item.weight);
                let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
                let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
                let fruit_unit = fruit_weightMatch[2];
                console.log("mmmmmmmmmmmmm2", item, fruit_unit == "gm" ? fruit_newWeightValue / 1000 : fruit_newWeightValue);

                totalWeightInGrams += weightInGrams;
                totalPrice += item.price * (fruit_unit == "gm" ? fruit_newWeightValue / 1000 : fruit_newWeightValue);
            });
        }


        console.log("totalpriceeeeeeeee", totalPrice, totalWeightInGrams)
        const pricePerGram = totalWeightInGrams > 0 ? totalPrice / totalWeightInGrams : 0;
        console.log("pricePerGram", pricePerGram)
        setTotal(totalPrice)
    }, [cart])
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
                    order_id: order.id, fruit_id: item.id, quantity: item.qty,
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
        const message = `*Fruit Stall Bill* %0AOrder No: ${order.order_number}%0A${items}%0ATotal: ₹${total}`
        const url = `https://wa.me/${phone}?text=${message}`
        window.open(url, '_blank')
    }
    return (
        <div style={{ margin: 0 }}>
            <Shop shops={shops} cart={cart} total={total} placeOrder={placeOrder}
                     phone={phone} setPhone={setPhone}/>
            <div>
                <div>
                    <FruitList fruits={fruits} addToCart={addToCart} />
                </div>
                {/* <div>
                    <Cart cart={cart} total={total} placeOrder={placeOrder}
                     phone={phone} setPhone={setPhone} />
                    <div>
                        <Receipt ref={receiptRef} cart={cart} total={total} orderNumber={orderNumber} />
                    </div>
                </div> */}
            </div>
        </div>
    )
}
export default POS
