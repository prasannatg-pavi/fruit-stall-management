// :white_tick: :five: App.js — Glue it all
import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import FruitList from '../components/FruitList'
import Cart from '../components/Cart'
import Receipt from '../components/Receipt'
import { useReactToPrint } from 'react-to-print'
import Shop from '../components/Shop'
import Modal from 'react-modal';
import { Dock } from 'react-dock'
import { decryptPassword, encryptPassword } from '../aes'
import { toast, ToastContainer } from 'react-toastify'
import backButton from "../assets/icons/back_button.svg"
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar'
function POS() {
    const [fruits, setFruits] = useState([])
    const [all_fruits, setall_fruits] = useState([])
    const [shops, setShops] = useState([])
    const [cart, setCart] = useState([])
    const [total, setTotal] = useState(0)
    const [cusName, setCusName] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phone, setPhone] = useState('')
    const [emailToLogin, setEmailToLogin] = useState("")
    const [PasswordToLogin, setPasswordToLogin] = useState("")
    const [PasswordToLoginEntered, setPasswordToLoginEntered] = useState("")
    const [isLogin, setisLogin] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null)
    const [selectedFruitToUpdate, setSelectedFruitToUpdate] = useState(null);
    const receiptRef = useRef()
    const [dataLoaded, setDataLoaded] = useState(false);
    const [showErrorPage, setShowErrorPage] = useState(false);
    const [newFruit, setNewFruit] = useState({
        name: '',
        price: '',
        stock: '',
    });
    const [config, setConfig] = useState({});
    const handlePrint = useReactToPrint({
        content: () => receiptRef.current
    })

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isVisible, setIsVisible] = useState(true);
    const [dockSize, setDockSize] = useState(0.3);
    const [dockPosition, setDockPosition] = useState('right');
    const [calanderDate, setCalanderDate] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [orderCumulativeSum, setOrderCumulativeSum] = useState(0.0);

    useEffect(() => {
        const updateDockLayout = () => {
            if (window.innerWidth < 950) {
                setDockSize(1);
                setDockPosition('left'); // or 'bottom' if you prefer
            } else {
                setDockSize(0.3);
                setDockPosition('right');
            }
        };

        updateDockLayout();
        window.addEventListener('resize', updateDockLayout);
        return () => window.removeEventListener('resize', updateDockLayout);
    }, []);

    useEffect(() => {


        loadConfig()
        fetchFruits()
        fetchFruitsVisibleFilterExcluded()
        fetchShop()
    }, [])

    const getDateRangeFor = (date) => {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);

        return {
            start: start.toISOString(), // 'YYYY-MM-DDT00:00:00.000Z'
            end: end.toISOString()      // 'YYYY-MM-DDT23:59:59.999Z'
        };
    };

    const handleChangePaymentMethod = (e) => {
        setPaymentMethod(e.target.value);
    }
    useEffect(() => {
        // Function to fetch orders for a specific date
        const fetchOrders = async () => {
            // If no date is selected, don't fetch data
            if (!calanderDate) return;

            const { data: orderItems, error } = await supabase
                .from('order_items')
                .select(`
    id,
    quantity,
    unit_price,
    fruit_id,
    order_id,
    orders:orders!order_items_order_id_fkey (
      id,
      created_at,
      total
    ),
    fruits:fruits!order_items_fruit_id_fkey (
      id,
      name,
      price,
      stock
    )
  `)
                .not('order_id', 'is', null)
            // .gte('orders.created_at', getDateRangeFor(formatDate(calanderDate)).start)
            // .lte('orders.created_at', getDateRangeFor(formatDate(calanderDate)).end);



            if (error) {
                console.error("Error fetching order items:", error);
                return [];
            }

            // Group items by order ID
            const grouped = {};

            for (const item of orderItems) {
                const orderId = item.order_id;
                if (!grouped[orderId]) {
                    grouped[orderId] = {
                        id: item.orders?.id,
                        created_at: item.orders?.created_at,
                        total: item.orders?.total,
                        order_items: [],
                    };
                }

                grouped[orderId].order_items.push({
                    id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    fruit_id: item.fruit_id,
                    fruit: item.fruits || null,
                });
            }

            console.log("GROUPED", grouped)
            // Convert to array
            setOrders(Object.values(grouped));

            let arrFinal = await Object.values(grouped).filter(item => {
                // if (!item.orders || !item.created_at) return false;
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                // Create Date object from the UTC string
                const date = new Date(item.created_at);

                // Convert to IST by adding 5 hours 30 minutes
                // Using Intl.DateTimeFormat with "Asia/Kolkata" timezone
                const options = {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                };

                let originalDate = Intl.DateTimeFormat("en-IN", options).format(date);
                console.log("ORIGINAL DATE", originalDate)
                // Extract YYYY-MM-DD from ISO datetime string
                const orderDate = originalDate.slice(0, 10).replaceAll("/", "-");
                console.log("ORIGINAL DATE", orderDate, formatDate(calanderDate))


                return orderDate === formatDate(calanderDate);
            });

            console.log(">>>>>>>>>>>>>>>>>>>..", arrFinal)
            setOrders(arrFinal)

            let totalCumulativeSum = 0;

            arrFinal.forEach(order => {
                order.order_items.forEach(item => {
                    const itemTotal = item.unit_price * (item.quantity / 1000);
                    // const itemTotal = item.fruit.price * (item.quantity / 1000);
                    totalCumulativeSum += itemTotal;
                });
            });

            totalCumulativeSum = totalCumulativeSum.toFixed(2);
            setOrderCumulativeSum(totalCumulativeSum);
            console.log("Total Cumulative Sum:", totalCumulativeSum); // Output: 297.02
            //       const { data: orders, error: ordersErr } = await supabase
            //   .from('orders')
            //   .select(`*`)
            //   .gte('created_at',  getDateRangeFor(formatDate(calanderDate)).start)
            //   .lte('created_at',  getDateRangeFor(formatDate(calanderDate)).end);

            // if (ordersErr) {
            //   console.error(ordersErr);
            //   return [];
            // }

            // const orderIds = orders.map(o => o.id);

            // if (orderIds.length === 0) {
            //   return orders.map(o => ({ ...o, order_items: [] }));
            // }

            // // fetch all items for those orders
            // const { data: items, error: itemsErr } = await supabase
            //   .from('order_items')
            //   .select(`
            //     *,
            //     fruits!order_items_fruit_id_fkey ( id, name, price, stock )
            //   `)
            //   .in('order_id', orderIds);

            // if (itemsErr) {
            //   console.error(itemsErr);
            //   return orders.map(o => ({ ...o, order_items: [] }));
            // }

            // // group items by order_id
            // const itemsByOrderId = items.reduce((map, item) => {
            //   const oid = item.order_id;
            //   if (!map[oid]) map[oid] = [];
            //   map[oid].push(item);
            //   return map;
            // }, {});

            // // map into orders
            // const result = orders.map(o => ({
            //   ...o,
            //   order_items: itemsByOrderId[o.id] || []
            // }));

            // setOrders(result);

            ///////////////////////////////////////////////////

            //       const { data, error } = await supabase
            //         .from('orders')
            //          .select(`
            //       *,
            //       order_items:order_items!order_items_order_id_fkey (
            //         id,
            //         quantity,
            //         unit_price,
            //         fruit_id,
            //         fruits:fruits!order_items_fruit_id_fkey (
            //           id,
            //           name,
            //           price,
            //           stock
            //         )
            //       )
            //     `)
            // //   .select(`
            // //     *,
            // //     order_items:order_items!order_items_order_id_fkey (
            // //       *,
            // //       fruits:fruits!order_items_fruit_id_fkey (
            // //         id,
            // //         name,
            // //         price,
            // //         stock
            // //       )
            // //     )
            // //   `)
            // //  .select(`
            // //       *,
            // //       order_items (
            // //         *,
            // //         fruits (
            // //           id,
            // //           name,
            // //           price,
            // //           stock
            // //         )
            // //       )
            // //     `)
            //   .gte('created_at',  getDateRangeFor(formatDate(calanderDate)).start)
            //   .lte('created_at',  getDateRangeFor(formatDate(calanderDate)).end)
            //   .order('created_at', { ascending: false });
            //         // .from('order_items')
            // //   .select(`
            // //     *,
            // //     orders!order_items_order_id_fkey (
            // //       id,
            // //       created_at
            // //     ),
            // //     fruits!order_items_fruit_id_fkey (
            // //       id,
            // //       name,
            // //       price,
            // //       stock
            // //     )
            // //   `)
            // //         .gte('orders.created_at', getDateRangeFor(formatDate(calanderDate)).start) // Filter by the selected date
            // //         .lte('orders.created_at', getDateRangeFor(formatDate(calanderDate)).end) // Filter by the selected date
            //         // .order('orders.created_at', { ascending: false });
            // //         .from('orders')
            // //   .select(`
            // //     *,
            // //     order_items:order_items!order_items_order_id_fkey (
            // //       *,
            // //       fruits:fruits!order_items_fruit_id_fkey (
            // //         id,
            // //         name,
            // //         price,
            // //         stock
            // //       )
            // //     )
            // //   `)
            //         // .select(`
            //         //   id,
            //         //   order_number,
            //         //   created_at,
            //         //   total,
            //         //   paid,
            //         //   customer_phone,
            //         //   shop_id,
            //         //   order_items (
            //         //     id,
            //         //     quantity,
            //         //     unit_price,
            //         //     fruit_id,
            //         //     fruits (
            //         //       id,
            //         //       name,
            //         //       price,
            //         //       stock
            //         //     )
            //         //   )
            //         // `)

            //   if (error) {
            //     console.error('Error fetching orders:', error);
            //   } else {
            //     setOrders(data);
            //   }
        };

        fetchOrders();
    }, [calanderDate]);


    const stringToBoolean = (value) => {
        if (typeof value === 'boolean') return value; // already a boolean
        if (typeof value !== 'string') return false;  // fallback

        switch (value.toLowerCase().trim()) {
            case 'true':
            case '1':
            case 'yes':
                return true;
            case 'false':
            case '0':
            case 'no':
                return false;
            default:
                return false;
        }
    }

    const formatDate = (date) => {
        if (!date) return ''; // Ensure the date is valid
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad single digit months with leading zero
        const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with leading zero

        return `${day}-${month}-${year}`; // Return formatted date as 'YYYY-MM-DD'
        //         return date.toLocaleDateString('en-GB', {
        //     day: '2-digit',
        //     month: 'short',
        //     year: 'numeric',
        //   });
        // return date?.toLocaleDateString(); // You can customize formatting here
    };

    const renderSelectedDate = () => {
        if (Array.isArray(calanderDate)) {
            const [start, end] = calanderDate;
            return (
                <p>
                    Selected range: {formatDate(start)} — {formatDate(end)}
                </p>
            );
        } else {
            return <p>Selected date: <b>{formatDate(calanderDate)}</b></p>;
        }
    };

    const loadConfig = async () => {
        const { data, error } = await supabase
            .from('config')
            .select('key, value');

        console.log("DDDDDDDDDDDDDDDDD", data)
        if (error) {
            console.error('Error loading config:', error.message);
            setShowErrorPage(true);
            return;
        }

        // Convert array to key-value object
        const configObject = data.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {});

        console.log("conobject", configObject)
        setShowErrorPage(stringToBoolean(configObject?.showErrorPage))
        setConfig(configObject);
    }
    const fetchFruits = async () => {
        const { data, error } = await supabase.from('fruits').select('*')
            .eq("is_visible", true)
            .eq("is_deleted", false)
            .order('name', { ascending: true });
        if (error) {
            console.log(error)
            setShowErrorPage(true);
        }
        else {
            setFruits(data)
        }
    }

    const fetchFruitsVisibleFilterExcluded = async () => {
        const { data, error } = await supabase.from('fruits').select('*')
            // .eq("is_visible", true)
            .eq("is_deleted", false)
            .order('name', { ascending: true });
        if (error) {
            setShowErrorPage(true);
            console.log(error)
        }
        else {
            setall_fruits(data)
        }
    }

    const fetchShop = async () => {
        const { data, error } = await supabase.from('shops').select('*')

        if (error) {
            setShowErrorPage(true);
            console.log(error)
        }
        else {
            setShops(data)

            // let encryptedPassword = data[0].password;
            // console.log(">>>:::encr ", encryptedPassword)
            // console.log(">>>:::", decryptPassword(data[0]?.password))

            setPasswordToLogin(decryptPassword(data[0]?.password))
            setEmailToLogin(data[0]?.email)
            setDataLoaded(true)
        }
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
        // Extract numeric weight (e.g., 200 from "200gm")
        const weightMatch = fruit.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
        if (!weightMatch) return; // skip if weight format is invalid

        const newWeightValue = parseFloat(weightMatch[1]);
        const unit = weightMatch[2];

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

    const removeFromCart = (indexToRemove) => {
        setCart(cart.filter((_, index) => index !== indexToRemove));
    }

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


        // fetch stock for all ordered fruits
        const orderedFruitIds = cart.map(c => c.id);
        const { data: orderedFruits, error: fetchError } = await supabase
            .from("fruits")
            .select('id, stock')
            .in('id', orderedFruitIds)

        console.log("+++++++++++++++==", orderedFruits)
        // validate all fruits have enough stocks
        const stockMap = new Map(orderedFruits.map(f => [f.id, f.stock]))
        console.log("STOCK MAP", stockMap)
        for (let item of cart) {
            console.log("ITEMMMMMMMMMMMMMMMM", item)
            const available = stockMap.get(item.id)
            if (available === undefined) {
                console.log(`Fruit ID ${item.id} not exists`)
                return;
            }

            const weightInGrams = item.weight;// convertToGrams(item.weight);
            let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
            let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
            let fruit_unit = fruit_weightMatch[2];
            console.log("mmmmmmmmmmmmm2", item, fruit_unit == "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue);

            console.log(" ================ ", available, fruit_newWeightValue, item)

            if (available < fruit_newWeightValue) {
                console.log(`Not enough stock for fruit ID: ${item.id} `)
                toast.error(`Stock unavailable for ${item.name} `, {
                    position: "bottom-right"
                })
                return;
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{ total, paid: true, customer_phone: phone }])
                .select().single()
            if (orderError) {
                console.log(orderError)
                return
            }
            setOrderNumber(order.order_number)
            await supabase.from('order_items').insert([
                {
                    order_id: order.id,
                    fruit_id: item.id,
                    quantity: fruit_unit == "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue,
                    // quantity: (fruit_unit == "gm" ? fruit_newWeightValue / 1000 : fruit_newWeightValue),
                    // quantity: item.weight,
                    unit_price: item.price
                }
            ])

            sendWhatsApp(order, shops[0])
        }


        const updates = await Promise.all(
            cart.map(item => {
                const weightInGrams = item.weight;// convertToGrams(item.weight);
                let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
                let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
                let fruit_unit = fruit_weightMatch[2];

                const stockAvailable = stockMap.get(item.id);
                const newStock = stockAvailable - (fruit_unit == "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue);
                return supabase.from("fruits")
                    .update({ 'stock': newStock })
                    .eq("id", item.id)
            })
        )

        // handlePrint()

        setCart([])
        setTotal(0)
        setPhone('')
        fetchFruits()
        toast.success("Order placed successfully", {
            position: "bottom-right"
        })
    }

    const sendWhatsApp = (order, shop) => {
        // const items = cart.map(item => `${item.name} x ${item.weight}`).join('%0A')
        let total = 0;

        const itemTable = cart.map(item => {
            const weightInGrams = item.weight;// convertToGrams(item.weight);
            let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
            let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
            let fruit_unit = fruit_weightMatch[2];
            const amount = item.price * (fruit_unit == "gm" ? fruit_newWeightValue / 1000 : fruit_newWeightValue);
            total += amount;
            return ` ${item.name}%0A   ₹${item.price} x ${item.weight} = ₹${amount.toFixed(2)}`;
        }).join('%0A');

        const fullItemTable = `
━━━━━━━━━━━━━━━━━━%0A
*Order Summary*%0A
━━━━━━━━━━━━━━━━━━%0A
${itemTable}%0A
━━━━━━━━━━━━━━━━━━%0A
*Total*: ₹${total.toFixed(2)}%0A
━━━━━━━━━━━━━━━━━━%0A
*Payment Mode*: ${paymentMethod}
%0A
`;
        console.log("order in whatsapp", order, shop, cart)
        let order_number = order.id
        const maskedId = `${order_number.slice(0, 8)}-${order_number.slice(-12)}`;

        const message = `
*${shop.name}*%0A
*Premium | Organic | Handpicked*%0A
Location: ${shop.address}%0A
Contact: ${shop.mobile_number}%0A
Date: ${new Intl.DateTimeFormat('en-GB', {
            timeZone: "Asia/Kolkata",
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: false,
        }).format(new Date(order.created_at))}%0A
Bill No: ORD-${maskedId.toUpperCase()}%0A
%0A
*Customer*: ${cusName}%0A
*Phone*: ${phone}%0A
%0A
${fullItemTable}
%0A
Thank you for choosing *Fresh Basket Fruits*%0A
Instagram: @freshbasketfruits
`;


// *Your Fruit Basket* %0A
        // ━━━━━━━━━━━━━━━%0A
        // 🧾 *Bill Summary*%0A
        // 🧺 Subtotal: ₹{summary.subtotal}%0A
        // 🎁 Discount: ₹{summary.discount}%0A
        // 🚚 Delivery: ₹{summary.delivery}%0A
        // 💳 *Total Payable*: ₹{summary.total}%0A
        // ━━━━━━━━━━━━━━━%0A
        // ✅ *Payment*: {summary.payment_status}%0A
        // 📦 *Delivery*: {summary.delivery_status}%0A
        // 🌱 We deliver *freshness* to your doorstep!%0A
        // 📲 Order again: wa.me/{shop.whatsapp_number}%0A
        // 🔗 Instagram: @freshbasketfruits



        // const message = `
        // *Fruit Stall Bill* %0AOrder No: ${order.order_number}%0A${items}%0ATotal: ₹${total}
        // `
        const url = `https://wa.me/${phone}?text=${message}`
        window.open(url, '_blank')
    }

    const [isAdminDockVisible, setIsAdminDockVisible] = useState(false);
    const showAdminDock = () => {
        setIsAdminDockVisible(true)
        setPasswordToLoginEntered("")
    }

    const [AdminModalIsopen, setAdminModalIsopen] = useState(false);
    const [AdminModalContent, setAdminModalContent] = useState("")
    const showMContentForAdminPurpose = (menuItem) => {
        setAdminModalIsopen(true)
        setAdminModalContent(menuItem)
        setisLogin(false)
        setPasswordToLoginEntered("")
        setIsAdminDockVisible(false)
    }

    // State to track which items are checked
    const [checkedItems, setCheckedItems] = useState([]);

    // Toggle item in checkedItems array
    const handleCheckboxChange = (item) => {
        setCheckedItems((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    const handleChangePassword = async () => {
        console.log(">>>>>>>>.. ", shops[0].password, currentPassword, newPassword, confirmPassword);
        let decryptedPasswordInDb = decryptPassword(shops[0]?.password)
        console.log(">>>>>>>>.. ", decryptedPasswordInDb, currentPassword, newPassword, confirmPassword);

        if (decryptedPasswordInDb == currentPassword) {
            if (newPassword == "" || confirmPassword == "") {
                toast.error("Password should not be empty", {
                    position: "bottom-right"
                })
            }
            else if (newPassword == confirmPassword) {
                console.log("Matched", shops, currentPassword, newPassword, confirmPassword)
                const { data, error } = await supabase.from("shops")
                    .update({ 'password': encryptPassword(newPassword) })
                    .eq("id", shops[0].id)

                console.log("datadatadata", data)
                if (error) {
                    console.error('Error Changing password:', error.message);
                    return null;
                }
                toast.success("Password has changed successfully", {
                    position: "bottom-right"
                })
                fetchShop()

                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error("New password and Confirm password not matching", {
                    position: "bottom-right"
                })
                console.log("New password and Confirm password not matching")
            }
        } else {
            toast.error("Password not matching with database", {
                position: "bottom-right"
            })
            console.log("Password not matching with Database")
        }
        // setPasswordToLogin(decryptPassword(data[0]?.password))

    }

    const handleUpdateFruit = async () => {
        console.log("FRUIT", newFruit)
        const { data, error } = await supabase
            .from("fruits")
            .update({
                name: newFruit.name,
                price: newFruit.price.toString(),
                stock: newFruit.stock.toString(),
                is_deleted: false,
                is_visible: true,
            })
            .eq("id", newFruit.id)
        if (error) {
            console.error('Error inserting fruit:', error.message);
            return null;
        }
        toast.success(`Chosen Fruit: ${newFruit.name} had updated successfully`, {
            position: "bottom-right"
        })
        setNewFruit({ name: "", price: "", stock: "" })
        fetchFruits();
        fetchAllFruits();
        console.log('Inserted fruit:', data);
    }
    const handleAddFruits = async () => {
        const { data, error } = await supabase
            .from('fruits')
            .insert([
                {
                    name: newFruit.name,
                    price: newFruit.price.toString(),
                    stock: newFruit.stock.toString(),
                    // created_at: Date.now(), // ISO string or JS Date
                    is_deleted: false, // default value if needed
                    is_visible: true,  // default value if needed
                }
            ]);

        if (error) {
            console.error('Error inserting fruit:', error.message);
            return null;
        }
        toast.success(`New Fruit: ${newFruit.name} had added successfully`, {
            position: "bottom-right"
        })
        setNewFruit({ name: "", price: "", stock: "" })
        fetchFruits();
        fetchAllFruits();
        console.log('Inserted fruit:', data);
        //   return data;
    }
    const handleRemoveFruits = async () => {
        console.log("CHECKED ITEMS ... ", checkedItems)
        const { data, error } = await supabase
            .from('fruits')
            .update({ is_deleted: true })
            .in('id', checkedItems); // array-based filter

        if (error) {
            console.error('Error deleting fruits:', error.message);
            return;
        }
        toast.success(`Selected fruit/s had removed successfully`, {
            position: "bottom-right"
        })
        fetchFruitsVisibleFilterExcluded()
        fetchFruits()
        setCheckedItems([])
        console.log('Fruits marked as deleted:', data);
    }

    const handleHideFruits = async () => {
        console.log("CHECKED ITEMS ... ", checkedItems)
        const { data, error } = await supabase
            .from('fruits')
            .update({ is_visible: false })
            .in('id', checkedItems); // array-based filter

        if (error) {
            console.error('Error deleting fruits:', error.message);
            return;
        }
        toast.success(`Selected fruit/s had hidden successfully`, {
            position: "bottom-right"
        })
        fetchFruitsVisibleFilterExcluded()
        fetchFruits()
        setCheckedItems([])
        console.log('Fruits marked as deleted:', data);
    }

    const handleUnHideFruits = async () => {
        console.log("CHECKED ITEMS ... ", checkedItems)
        const { data, error } = await supabase
            .from('fruits')
            .update({ is_visible: true })
            .in('id', checkedItems); // array-based filter

        if (error) {
            console.error('Error deleting fruits:', error.message);
            return;
        }
        toast.success(`Selected fruit/s had shown successfully`, {
            position: "bottom-right"
        })
        fetchFruitsVisibleFilterExcluded()
        fetchFruits()
        setCheckedItems([])
        console.log('Fruits marked as deleted:', data);
    }

    const fetchAllFruits = () => {
        fetchFruitsVisibleFilterExcluded()
        fetchFruits()
    }
    const renderModalContent = () => {

        switch (AdminModalContent) {
            case "ADD_FRUIT":
                return <>
                    <div
                        className='modalHeader'
                    //  style={{
                    //     display: "flex",
                    //     justifyContent: "space-between",
                    //     padding: "0px 15px",
                    //     fontWeight: "bolder",
                    //     marginBottom: "20px"
                    // }}
                    >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>
                                <img src={backButton}
                                    height={25} width={25}
                                    style={{
                                        boxShadow: "0px 0px 10px teal",
                                        borderRadius: "10px",
                                        marginBottom: "-7px",
                                        marginRight: "10px",
                                        filter: "invert(16%) sepia(90%) saturate(576%) hue-rotate(137deg) brightness(94%) contrast(93%)"
                                    }}
                                />
                                {/* &lt; */}
                            </span>
                            ADD A FRUIT</div>

                        <div
                            className='modalHeaderButtons'
                        // style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     padding: "0px 20px"
                        // }}
                        >
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={handleAddFruits.bind(this)}>ADD</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                setAdminModalIsopen(false)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>CLOSE</div>
                        </div>

                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "75%",
                        placeSelf: "center"
                    }}>
                        <div className="addFruitFieldRow">
                            <span>Enter Fruit Name </span>
                            <input type="text" value={newFruit?.name} onChange={(e) => {
                                setNewFruit((prevFruit) => ({
                                    ...prevFruit,
                                    name: e.target.value,
                                }));
                            }} />
                        </div>
                        <div className="addFruitFieldRow">
                            <span>Enter Price </span>
                            <input type="text" maxLength={5} value={newFruit?.price} onChange={(e) => {
                                setNewFruit((prevFruit) => ({
                                    ...prevFruit,
                                    price: e.target.value,
                                }));
                            }} />
                        </div>
                        <div className="addFruitFieldRow">
                            <span>Enter Stock (in gms) </span>
                            <input type="text" maxLength={5} value={newFruit?.stock} onChange={(e) => {
                                setNewFruit((prevFruit) => ({
                                    ...prevFruit,
                                    stock: e.target.value,
                                }));
                            }} />
                        </div>
                    </div>
                </>;
            case "REMOVE_HIDE_FRUIT":
                return <>
                    <div
                        className='modalHeader'

                    // style={{
                    //     display: "flex",
                    //     justifyContent: "space-between",
                    //     padding: "0px 15px",
                    //     fontWeight: "bolder",
                    //     marginBottom: "20px"
                    // }}
                    >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>
                                <img src={backButton}
                                    height={25} width={25}
                                    style={{
                                        boxShadow: "0px 0px 10px teal",
                                        borderRadius: "10px",
                                        marginBottom: "-7px",
                                        marginRight: "10px",
                                        filter: "invert(16%) sepia(90%) saturate(576%) hue-rotate(137deg) brightness(94%) contrast(93%)"
                                    }}
                                />
                                {/* &lt; */}
                            </span>
                            REMOVE / HIDE FRUITS</div>

                        <div
                            className='modalHeaderButtons'
                        // style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     padding: "0px 20px"
                        // }}
                        >
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid red",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "red",
                                cursor: "pointer"
                            }} onClick={() => {
                                handleRemoveFruits()
                            }}>REMOVE</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                handleHideFruits()
                            }}>HIDE</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                handleUnHideFruits()
                            }}>UNHIDE</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                setAdminModalIsopen(false)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>CLOSE</div>
                        </div>
                    </div >
                    <div>
                        <ul className='fruitsul'>
                            {
                                all_fruits.map((fruit) => {
                                    return (
                                        <label>

                                            <li className={fruit.is_visible ? 'fruitsli' : 'fruitsli_invisible'} key={fruit.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems.includes(fruit.id)}
                                                    onChange={() => handleCheckboxChange(fruit.id)}
                                                />
                                                <div style={{
                                                    fontWeight: "bold",
                                                    whiteSpace: "nowrap",/* Prevents the text from wrapping */
                                                    overflow: "hidden",           /* Hides the overflow */
                                                    textOverflow: "ellipsis"
                                                }}>{fruit.name} </div>
                                                <div style={{ marginBottom: "10px" }}>
                                                    <span style={{ fontSize: "14px" }}> ₹{fruit.price} </span>
                                                    <br />
                                                    <span style={{ fontSize: "14px" }}> {fruit.stock} gms </span>
                                                    {/* <span style={{textDecoration:"line-through", fontSize:"12px"}}> ₹{(fruit.price * (1.25)).toFixed(2)} </span> */}
                                                </div>
                                            </li>
                                        </label>

                                    )
                                })
                            }
                        </ul>
                    </div>
                </>;
            case "UPDATE_FRUIT":
                return <>
                    <div
                        className='modalHeader'

                    // style={{
                    //     display: "flex",
                    //     justifyContent: "space-between",
                    //     padding: "0px 15px",
                    //     fontWeight: "bolder",
                    //     marginBottom: "20px"
                    // }}
                    >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                                setNewFruit({ name: "", price: "", stock: "" })
                            }}>
                                <img src={backButton}
                                    height={25} width={25}
                                    style={{
                                        boxShadow: "0px 0px 10px teal",
                                        borderRadius: "10px",
                                        marginBottom: "-7px",
                                        marginRight: "10px",
                                        filter: "invert(16%) sepia(90%) saturate(576%) hue-rotate(137deg) brightness(94%) contrast(93%)"
                                    }}
                                />
                                {/* &lt; */}
                            </span>
                            Update Fruit</div>

                        {/* <div onClick={() => { setAdminModalIsopen(false) }}>CLOSE</div> */}
                        <div
                            className='modalHeaderButtons'
                        // style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     padding: "0px 20px"
                        // }}
                        >
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={handleUpdateFruit.bind(this)}>UPDATE</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                setAdminModalIsopen(false)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>CLOSE</div>
                        </div>

                    </div>
                    <div
                        className='updateFruitDiv'
                    // style={{
                    //     display: "flex",
                    //     flexDirection: "row",
                    //     margin: "0px 45px"
                    // }}
                    >
                        <div style={{
                            padding: "0px 20px",
                            borderRight: "2px solid darkcyan",
                            margin: "0px 20px"
                        }}>
                            {fruits.map((fruit) => {
                                return (
                                    <div style={{
                                        cursor: "pointer"
                                    }}
                                        onClick={(e) => {
                                            console.log("fruit selected", fruit)
                                            setNewFruit(fruit)
                                        }}>
                                        {fruit.name}
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: "1"
                        }}>
                            Selected Fruit<br />
                            <span style={{
                                fontWeight: "bold",
                                fontSize: "1.2em"
                            }}>
                                {newFruit?.name}
                            </span>
                            <div style={{
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div className="addFruitFieldRow">
                                    <span>Enter Fruit Name </span>
                                    <input type="text" value={newFruit?.name} onChange={(e) => {
                                        setNewFruit((prevFruit) => ({
                                            ...prevFruit,
                                            name: e.target.value,
                                        }));
                                    }} />
                                </div>
                                <div className="addFruitFieldRow">
                                    <span>Enter Price </span>
                                    <input type="text" maxLength={5} value={newFruit?.price} onChange={(e) => {
                                        setNewFruit((prevFruit) => ({
                                            ...prevFruit,
                                            price: e.target.value,
                                        }));
                                    }} />
                                </div>
                                <div className="addFruitFieldRow">
                                    <span>Enter Stock </span>
                                    <input type="text" maxLength={5} value={newFruit?.stock} onChange={(e) => {
                                        setNewFruit((prevFruit) => ({
                                            ...prevFruit,
                                            stock: e.target.value,
                                        }));
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>;
            case "ORDER_PAGE":
                let count = 0;
                return <>
                    <div
                        className='modalHeader'
                    //  style={{
                    //     display: "flex",
                    //     justifyContent: "space-between",
                    //     padding: "0px 15px",
                    //     fontWeight: "bolder",
                    //     marginBottom: "20px"
                    // }}
                    >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>
                                <img src={backButton}
                                    height={25} width={25}
                                    style={{
                                        boxShadow: "0px 0px 10px teal",
                                        borderRadius: "10px",
                                        marginBottom: "-7px",
                                        marginRight: "10px",
                                        filter: "invert(16%) sepia(90%) saturate(576%) hue-rotate(137deg) brightness(94%) contrast(93%)"
                                    }}
                                />
                                {/* &lt; */}
                            </span>
                            VIEW ORDERS</div>

                        <div
                            className='modalHeaderButtons'
                        // style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     padding: "0px 20px"
                        // }}
                        >
                            {/* <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={handleAddFruits.bind(this)}>
 🔍  
                                SELECT DATE
                            </div> */}
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                setAdminModalIsopen(false)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}>CLOSE</div>
                        </div>


                    </div>
                    <div
                        className='orderLayout'
                        style={{
                            display: "flex", flexDirection: "row",
                            // alignItems: "center", height: "75%" 
                        }}
                    >
                        <div style={{
                            display: "flex",
                            // justifyContent: "center",
                            // verticalAlign: "center",
                            height: "fit-content"
                            // alignContent: "center"
                        }}>
                            {/* <Calendar /> */}
                            <Calendar onChange={setCalanderDate} value={calanderDate} selectRange={false}
                             maxDate={new Date()} />

                        </div>
                        <div style={{
                            display: "flex", marginBottom: "auto",
                            flexDirection: "column",
                            padding: "0px 20px",
                            width: "80%"
                        }}>
                            <div>
                                {renderSelectedDate()}

                            </div>
                            <div>

                                <table width="100%" style={{
                                    height: "230px",
                                    overflowY: "auto",
                                    border: "1px solid #ccc",
                                    display: "block"
                                }}>
                                    <thead style={{
                                        position: "sticky",
                                        background: "white",
                                        color: "black",
                                        zIndex: 40
                                    }}>
                                        <tr>
                                            {/* <th align="left">Order ID</th> */}
                                            <th align="center" style={{ width: "5%" }}> SNo</th>
                                            {/* <th align="right">Order Item ID </th> */}

                                            <th align="center" style={{ width: "15%" }}>Ordered at</th>
                                            <th align="center" style={{ width: "5%" }}>Weight <br />(In GMS)</th>
                                            {/* <th align="left" style={{ width: "10%" }}>Unit price</th> */}
                                            <th align="center" style={{ width: "15%" }}>Fruit name</th>
                                            {/* <th align="center" style={{ width: "10%" }}>Fruit Price</th> */}
                                            <th align="center" style={{ width: "5%" }}>Price per weight</th>
                                            {/* <th align="center" style={{ width: "5%" }}>Total</th> */}


                                        </tr>
                                    </thead>
                                    <tbody
                                    // style={{top:"50px", position:"relative"}}
                                    >
                                        {orders.map((order) =>
                                            order.order_items.map((item, index) => (

                                                //const weightInGrams = item.weight;// convertToGrams(item.weight);
                                                // let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
                                                // let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
                                                // let fruit_unit = fruit_weightMatch[2];
                                                <tr key={item.id}>
                                                    <td align="center" style={{ width: "5%" }}>{++count}</td>
                                                    {/* <td align="right">{item.id}</td> */}
                                                    <td align="center" style={{ width: "15%" }}>{new Intl.DateTimeFormat("en-GB", {
                                                        timeZone: "Asia/Kolkata",
                                                        day: "2-digit", month: "2-digit", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                                                        hour12: false,
                                                    }).format(new Date(order.created_at.replace(/\.\d+/, ""))).replaceAll(",", "")}</td>
                                                    {/* <td align="right">{(order.created_at)}</td> */}
                                                    <td align="center" style={{ width: "5%" }}>{item.quantity}</td>
                                                    {/* <td align="left" style={{ width: "10%" }}>₹{item.unit_price}</td> */}
                                                    <td align="center" style={{ width: "15%" }}>{item.fruit.name}</td>
                                                    {/* <td align="center" style={{ width: "10%" }}>₹{item.fruit.price}</td> */}
                                                    <td align="center" style={{ width: "5%" }}>₹{(item.unit_price * Number((item.quantity / 1000))).toFixed(2)}</td>
                                                    {/* <td align="center" style={{ width: "5%" }}>₹{(item.fruit.price * Number((item.quantity / 1000))).toFixed(2)}</td> */}
                                                    {/* <td align="center" style={{ width: "10%" }}>₹{order.total}</td> */}

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {/* <td align="right"> */}
                                    {/* {item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[2] == "gm" ?
                  "₹" + ((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2) :
                  "₹" + (item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]).toFixed(2)}
              
                ₹{((item.price * item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)[1]) / 1000).toFixed(2)} */}
                                    {/* </td> */}
                                </table>
                                <div style={{
                                    display: "flex",
                                    marginTop: "12px",
                                    justifySelf: "right"
                                }}>
                                    Total profit today:
                                    <span style={{ fontWeight: "bold" }}> &nbsp; ₹ {orderCumulativeSum} </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>;
            case "CHANGE_PASSWORD":
                return <>
                    <div
                        className='modalHeader'

                    // style={{
                    //     display: "flex",
                    //     justifyContent: "space-between",
                    //     padding: "0px 15px",
                    //     fontWeight: "bolder",
                    //     marginBottom: "20px"
                    // }}
                    >
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                                setCurrentPassword("")
                                setNewPassword("")
                                setConfirmPassword("")
                                setNewFruit({ name: "", price: "", stock: "" })
                            }}>
                                <img src={backButton}
                                    height={25} width={25}
                                    style={{
                                        boxShadow: "0px 0px 10px teal",
                                        borderRadius: "10px",
                                        marginBottom: "-7px",
                                        marginRight: "10px",
                                        filter: "invert(16%) sepia(90%) saturate(576%) hue-rotate(137deg) brightness(94%) contrast(93%)"
                                    }}
                                />
                                {/* &lt; */}
                            </span>
                            Change Password</div>

                        <div
                            className='modalHeaderButtons'
                        // style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     padding: "0px 20px"
                        // }}
                        >
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={handleChangePassword.bind(this)}>CHANGE PASSWORD</div>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid black",
                                marginLeft: "5px",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "black",
                                cursor: "pointer"
                            }} onClick={() => {
                                setAdminModalIsopen(false)
                                setCheckedItems([])
                                fetchAllFruits()
                                setCurrentPassword("")
                                setNewPassword("")
                                setConfirmPassword("")
                            }}>CLOSE</div>
                        </div>

                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        margin: "0px 45px"
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: "1"
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div className="addFruitFieldRow">
                                    <span>Enter Current Password </span>
                                    <input type="password"
                                        value={currentPassword}
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value);
                                        }} />
                                </div>
                                <div className="addFruitFieldRow">
                                    <span>Enter New Password </span>
                                    <input type="password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                        }} />
                                </div>
                                <div className="addFruitFieldRow">
                                    <span>Confirm Password </span>
                                    <input type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>;
            default:
                return <>
                    <div onClick={() => { setAdminModalIsopen(false) }}>CLOSE</div>
                </>;
        }
    };
    return (
        <>
            {showErrorPage ?
                <div
                    style={{
                        display: "flex", flexDirection: "column",
                        justifyContent: "center", alignItems: "center",
                        height: "50vh",
                        marginTop: "100px"
                    }}
                >
                    <img style={{ width: "25%" }}
                        src={require("../assets/icons/Server-amico.png")} />
                    <div style={{
                        fontFamily: "calibri",
                        color: "purple", textAlign: "center", fontSize: "25px", fontWeight: "bold"
                    }}>
                        System under maintenance... Please wait for a moment... <br /><br />
                        <span style={{ fontSize: "18px" }}> &copy; Freshuit, 2025</span>
                    </div>
                </div>
                : <div style={{ margin: 0 }}>
                    <ToastContainer
                        draggable={true} />
                    <Modal
                        style={{ zIndex: 1 }}
                        isOpen={AdminModalIsopen}
                        // onAfterOpen={afterOpenModal}
                        // onRequestClose={closeModal}
                        // style={customStyles}
                        contentLabel="Example Modal"
                    >
                        {renderModalContent()}
                    </Modal>
                    <Dock dimMode='opaque'
                        size={dockSize}
                        dockStyle={{
                            boxShadow: "0px 0px 10px darkcyan",
                            zIndex: 0
                        }}
                        position='right'
                        isVisible={isAdminDockVisible}>
                        {/* you can pass a function as a child here */}
                        <div style={{
                            display: "flex",
                            float: "right",
                            margin: "20px",
                            // textDecoration: "underline",
                            textTransform: "uppercase",
                            fontWeight: "bolder",
                            cursor: "pointer",
                        }} onClick={() => {
                            setPasswordToLoginEntered("")
                            setIsAdminDockVisible(false)
                            setisLogin(false)
                        }}> {isLogin ? "Logout" : "Close"}</div>


                        {isLogin ?
                            <>
                                <div style={{
                                    margin: "80px 10px", display: "flex",
                                    flexDirection: "column",
                                }}>
                                    <div className='adminLoggedInMenuList'>
                                        Hi <span style={{ fontWeight: "bold" }}> {shops[0]?.admin_name}</span> !!!
                                    </div>
                                    <div className='adminLoggedInMenuTitle'>Menu</div>
                                    <div className='adminLoggedInMenu'>
                                        <div onClick={() => showMContentForAdminPurpose("ADD_FRUIT")} className='adminLoggedInMenuList'>Add Fruits</div>
                                        <div onClick={() => showMContentForAdminPurpose("REMOVE_HIDE_FRUIT")} className='adminLoggedInMenuList'>Remove / Hide Fruits</div>
                                        <div onClick={() => showMContentForAdminPurpose("UPDATE_FRUIT")} className='adminLoggedInMenuList'>Update Fruits Details</div>
                                        <div onClick={() => showMContentForAdminPurpose("ORDER_PAGE")} className='adminLoggedInMenuList'>Order List</div>
                                        {/* <div 
                                // onClick={() => showMContentForAdminPurpose("VIEW_ORDER")} 
                                className='adminLoggedInMenuList comingSoon'>View Orders <span className='comingSoon'>Coming soon... </span></div>
                                <div 
                                // onClick={() => showMContentForAdminPurpose("REPORTS")} 
                                className='adminLoggedInMenuList comingSoon'>Reports <span className='comingSoon'>Coming soon... </span></div> */}

                                        <hr />
                                        <div onClick={() => showMContentForAdminPurpose("CHANGE_PASSWORD")} className='adminLoggedInMenuList'>Change Password</div>
                                    </div>

                                </div>
                            </> :
                            <>
                                <div style={{ marginTop: "80px", display: "flex", alignItems: "center", flexDirection: "column", }}>
                                    <div style={{ fontWeight: "bolder" }}>
                                        Login to Admin
                                    </div>
                                    <div style={{ border: "1px solid darkcyan", marginTop: "50px", boxShadow: "0px 40px 100px darkcyan", padding: "20px", width: "60%", borderRadius: "10px", textAlign: "-webkit-center" }}>
                                        <div>
                                            <span style={{ fontSize: "0.8em", fontWeight: "bolder" }}> Mail ID</span>
                                            <div>
                                                <input disabled={true} value={emailToLogin} maxLength={10} style={{ textAlign: "center" }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "10px" }}>
                                            <span style={{ fontSize: "0.8em", fontWeight: "bolder" }}>Password</span>
                                            <div>
                                                <input type="password"
                                                    value={PasswordToLoginEntered}
                                                    onChange={(e) => { setPasswordToLoginEntered(e.target.value) }}
                                                    style={{ textAlign: "center" }} />
                                            </div>
                                        </div>
                                        <div
                                            style={{ marginTop: "10px" }}>
                                            <div style={PasswordToLogin == PasswordToLoginEntered
                                                ? { marginTop: "10px" } : { marginTop: "10px", display: "none" }}>
                                                <button
                                                    className="btnLogin"
                                                    onClick={() => {
                                                        setPasswordToLoginEntered("")
                                                        setisLogin(true)
                                                    }}
                                                >LOGIN</button>
                                            </div>
                                        </div>
                                        {/* <div style={{ marginTop: "10px", textAlign: "left", fontSize: "0.75em", color: "darkcyan" }}>
                            <div>
                                OTP sent !!
                            </div>
                        </div> */}
                                    </div>
                                    <div style={{ marginTop: "10px", fontSize: "0.8em", color: "lightcyan" }}>
                                        Conact Support
                                    </div>
                                </div></>}

                    </Dock >
                    <Shop shops={shops} cart={cart} total={total} placeOrder={placeOrder}
                        phone={phone} setPhone={setPhone}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={handleChangePaymentMethod}
                        cusName={cusName} setCusName={setCusName}
                        removeFromCart={(index) => { removeFromCart(index) }}
                        showAdminDock={() => showAdminDock()} />
                    {dataLoaded ? <div>
                        <div>
                            {fruits.length ? <FruitList fruits={fruits} addToCart={addToCart} config={config} /> : <>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                                    <img src={require("../assets/icons/empty_state_fruits.png")}
                                        style={{ width: "200px", height: "200px" }} />
                                    <div style={{ marginTop: "10px", fontSize: "0.8em", fontWeight: "bolder" }}>Fruits List is empty</div></div>
                            </>}

                        </div>
                        {/* <div>
                    <Cart cart={cart} total={total} placeOrder={placeOrder}
                     phone={phone} setPhone={setPhone} />
                    <div>
                        <Receipt ref={receiptRef} cart={cart} total={total} orderNumber={orderNumber} />
                    </div>
                </div> */}
                    </div> : <>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                            <img src={require("../assets/icons/loading_1.gif")}
                                style={{ width: "200px", height: "200px" }} />
                        </div>
                    </>}

                </div >}

        </>
    )
}
export default POS
