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
function POS() {
    const [fruits, setFruits] = useState([])
    const [all_fruits, setall_fruits] = useState([])
    const [shops, setShops] = useState([])
    const [cart, setCart] = useState([])
    const [total, setTotal] = useState(0)
    const [phone, setPhone] = useState('')
    const [emailToLogin, setEmailToLogin] = useState("")
    const [PasswordToLogin, setPasswordToLogin] = useState("")
    const [PasswordToLoginEntered, setPasswordToLoginEntered] = useState("")
    const [isLogin, setisLogin] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null)
    const [selectedFruitToUpdate, setSelectedFruitToUpdate] = useState(null);
    const receiptRef = useRef()
    const [newFruit, setNewFruit] = useState({
        name: '',
        price: '',
        stock: '',
    });
    const [config, setConfig] = useState({});
    const handlePrint = useReactToPrint({
        content: () => receiptRef.current
    })
    useEffect(() => {


        loadConfig()
        fetchFruits()
        fetchFruitsVisibleFilterExcluded()
        fetchShop()
    }, [])

    const loadConfig = async () => {
        const { data, error } = await supabase
            .from('config')
            .select('key, value');

        console.log("DDDDDDDDDDDDDDDDD", data)
        if (error) {
            console.error('Error loading config:', error.message);
            return;
        }

        // Convert array to key-value object
        const configObject = data.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {});

        console.log("conobject", configObject)
        setConfig(configObject);
    }
    const fetchFruits = async () => {
        const { data, error } = await supabase.from('fruits').select('*')
            .eq("is_visible", true)
            .eq("is_deleted", false)
            .order('name', { ascending: true });
        if (error) console.log(error)
        else setFruits(data)
    }

    const fetchFruitsVisibleFilterExcluded = async () => {
        const { data, error } = await supabase.from('fruits').select('*')
            // .eq("is_visible", true)
            .eq("is_deleted", false)
            .order('name', { ascending: true });
        if (error) console.log(error)
        else setall_fruits(data)
    }

    const fetchShop = async () => {
        const { data, error } = await supabase.from('shops').select('*')

        if (error) console.log(error)
        else setShops(data)

        // let encryptedPassword = data[0].password;
        // console.log(">>>:::encr ", encryptedPassword)
        // console.log(">>>:::", decryptPassword(data[0]?.password))

        setPasswordToLogin(decryptPassword(data[0]?.password))
        setEmailToLogin(data[0]?.email)
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
                return;
            }
            // await supabase.from('order_items').insert([
            //     {
            //         order_id: order.id, fruit_id: item.id, quantity: item.qty,
            //         unit_price: item.price
            //     }
            // ])
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

        const updates = await Promise.all(
            cart.map(item => {
                  const weightInGrams = item.weight;// convertToGrams(item.weight);
            let fruit_weightMatch = item.weight.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
            let fruit_newWeightValue = parseFloat(fruit_weightMatch[1]);
            let fruit_unit = fruit_weightMatch[2];
            
            const stockAvailable =stockMap.get(item.id);
                const newStock = stockAvailable - ( fruit_unit == "kg" ? fruit_newWeightValue * 1000 : fruit_newWeightValue);
                return supabase.from("fruits")
                .update({'stock': newStock})
                .eq("id", item.id)
            })
        )

        // handlePrint()
        // sendWhatsApp(order)
        setCart([])
        setTotal(0)
        setPhone('')
        fetchFruits()
    }

    const sendWhatsApp = (order) => {
        const items = cart.map(item => `${item.name} x ${item.qty}`).join('%0A')
        const message = `*Fruit Stall Bill* %0AOrder No: ${order.order_number}%0A${items}%0ATotal: ₹${total}`
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
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0px 15px",
                        fontWeight: "bolder",
                        marginBottom: "20px"
                    }}>
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}> &lt; </span>
                            ADD A FRUIT</div>

                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            padding: "0px 20px"
                        }}>
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
                            <span>Enter Stock </span>
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
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0px 15px",
                        fontWeight: "bolder",
                        marginBottom: "20px"
                    }}>
                        <div>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                                setAdminModalIsopen(false)
                                setAdminModalContent("")
                                setisLogin(true)
                                setPasswordToLoginEntered("")
                                setIsAdminDockVisible(true)
                                setCheckedItems([])
                                fetchAllFruits()
                            }}> &lt; </span>
                            REMOVE / HIDE FRUITS</div>

                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            padding: "0px 20px"
                        }}>
                            <div style={{
                                padding: "2px 15px",
                                border: "1px solid red",
                                fontSize: "0.9em",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "red"
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
                                color: "black"
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
                                color: "black"
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
                                color: "black"
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
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0px 15px",
                        fontWeight: "bolder",
                        marginBottom: "20px"
                    }}>
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
                            }}> &lt; </span>
                            Update Fruit</div>

                        {/* <div onClick={() => { setAdminModalIsopen(false) }}>CLOSE</div> */}
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            padding: "0px 20px"
                        }}>
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
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        margin: "0px 45px"
                    }}>
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
            default:
                return <>
                    <div onClick={() => { setAdminModalIsopen(false) }}>CLOSE</div>
                </>;
        }
    };
    return (
        <div style={{ margin: 0 }}>
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
                dockStyle={{
                    boxShadow: "0px 0px 10px darkcyan",
                    zIndex: 0
                }}
                position='right' isVisible={isAdminDockVisible}>
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
                                <div onClick={() => showMContentForAdminPurpose("VIEW_ORDER")} className='adminLoggedInMenuList'>View Orders</div>
                                <div onClick={() => showMContentForAdminPurpose("REPORTS")} className='adminLoggedInMenuList'>Reports</div>
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
                removeFromCart={(index) => { removeFromCart(index) }}
                showAdminDock={() => showAdminDock()} />
            <div>
                <div>
                    <FruitList fruits={fruits} addToCart={addToCart} config={config} />
                </div>
                {/* <div>
                    <Cart cart={cart} total={total} placeOrder={placeOrder}
                     phone={phone} setPhone={setPhone} />
                    <div>
                        <Receipt ref={receiptRef} cart={cart} total={total} orderNumber={orderNumber} />
                    </div>
                </div> */}
            </div>
        </div >
    )
}
export default POS
