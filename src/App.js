

// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import POS from './pages/pos';
import axios from 'axios';
import { supabase } from './supabaseClient';
import IntroSlider from './components/IntroSlider';

const TARGET_LOCATION = {
  lat: 12.484608, // Replace with your target latitude
  lon: 79.888384 // Replace with your target longitude
};

// const TARGET_LOCATION = {
//   lat: 12.780955, // Replace with your target latitude
//   lon: 79.152671 // Replace with your target longitude
// };
// 10.780975, 79.152673
const MAX_DISTANCE_KM = 0.1; // Set allowed radius (e.g., 10 km)


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [allowed, setAllowed] = useState(null);
  const [yourCalculatedDistance, setYourCalculatedDistance] = useState(null);
  const [isAllowed, setIsAllowed] = useState(null);
  const [showErrorPage, setShowErrorPage] = useState(false);
  const [config, setConfig] = useState({});
  const [isActive, setIsActive] = useState(null);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  useEffect(() => {
    const checkSubscription = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      // const currentDate = new Date().toISOString().split("T")[0];
      setToday(currentDate);

      // Query Supabase
      const { data, error } = await supabase
        .from("config")
        .select("value")
        .eq("key", "subscription_date");

      if (error) {
        console.error("Supabase error:", error.message);
        setIsActive(false);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        console.warn("No subscription_date found in config table");
        setIsActive(false);
        setLoading(false);
        return;
      }

      try {
        // Assume first row is the active one
        const { start, end } = JSON.parse(data[0].value);

        // alert(currentDate +"----"+ start +"----"+ end + "++++")
        // alert( currentDate <= end)
        if ((currentDate >= start) && (currentDate <= end)) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } catch (err) {
        console.error("Invalid JSON in value column:", err);
        setIsActive(false);
      }

      setLoading(false);
    };

    const checkInitialSetup = async () => {
      // Query Supabase

      const { data, error } = await supabase
        .from("config")
        .select("value")
        .eq("key", "initialSetup");

      if (error) {
        console.error("Supabase error:", error.message);
        setIsActive(false);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        console.warn("No subscription_date found in config table");
        setIsActive(false);
        setLoading(false);
        return;
      }

      try {
        // Assume first row is the active one
        const initialSetupValue = data[0].value === "true";
        // alert(initialSetupValue);

        setIsInitialSetup(initialSetupValue)
      } catch (err) {
        console.error("Invalid JSON in value column:", err);
        setIsActive(false);
      }

      setLoading(false);
    }

    checkSubscription();
    checkInitialSetup();
  }, []);

  // if (loading) return <p>Loading subscription status...</p>;



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

  const loadConfig = async () => {



    const { data, error } = await supabase
      .from('config')
      .select('key, value');

    console.log("APPDDDDDDDDDDDDDDDDD", data)
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
    const ipLists = configObject?.ip_address
    const ipList = JSON.parse(ipLists);

    const checkIP = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const currentIP = data.ip;

        const match = ipList.includes(currentIP);
        setIsAllowed(match);
      } catch (err) {
        console.error("Failed to fetch IP", err);
        setIsAllowed(false);
      }
    };

    checkIP();
    // setShowErrorPage(stringToBoolean(configObject?.showErrorPage))
    // setConfig(configObject);


  }

  useEffect(() => {
    loadConfig()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 🟡 Log the current position
        console.log("User location:", latitude, longitude);

        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          TARGET_LOCATION.lat,
          TARGET_LOCATION.lon
        );


        setYourCalculatedDistance(distance)
        // 🟡 Log calculated distance
        console.log("Distance from target (km):", (Math.round(distance * 1000) / 1000));
        setAllowed((Math.round(distance * 1000) / 1000) <= MAX_DISTANCE_KM)
        // setAllowed(distance <= MAX_DISTANCE_KM);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setAllowed(false);
      },
      {
        enableHighAccuracy: true, // 🔹 Add this
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);
  //   useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       // alert(JSON.stringify(position.coords))
  //       const { latitude, longitude } = position.coords;
  //       const distance = getDistanceFromLatLonInKm(
  //         latitude,
  //         longitude,
  //         TARGET_LOCATION.lat,
  //         TARGET_LOCATION.lon
  //       );
  //       setAllowed(distance <= MAX_DISTANCE_KM);
  //     },
  //     () => setAllowed(false), // User denied location or error
  //     { timeout: 10000 }
  //   );
  // }, []);

  // if (allowed === null) return <p>Checking location...</p>;
  // if (!allowed) return <p>Access Denied: Not in allowed location. Far from {yourCalculatedDistance}</p>;

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '600px',
    height: '400px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    // border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'sans-serif',
    position: 'relative',
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #ccc',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '12px',
  };

  const textStyle = {
    fontSize: '16px',
    color: '#333',
  };

  return (
    <>
      {
        isActive == null ? <>
          {/* Injecting keyframes into the document */}
          <style>
            {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
          </style>

          <div style={containerStyle}>
            <div style={spinnerStyle}></div>
            <span style={textStyle}>Loading...</span>
          </div>

        </> : isInitialSetup ? (
          <>
            <IntroSlider onComplete={async () => {
              //   // Your custom logic here
              // alert("TTT")
              setIsInitialSetup(false)
              const { data, error } = await supabase.from("config")
                .update({ 'value': 'false' })
                .eq("id", 8)
              if (error) {
                console.error('Update error:', error);
              } else {
                console.log('Updated data:', data);
              }
            }} /> </>
        ) :
          isActive ? (
            <>
              {/* <p style={{ color: "green" }}>✅ Subscription is active. App is running.</p> */}
              {isAllowed === null ? <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                zIndex: 9999
              }}></div> :
                (isAllowed ? showErrorPage ? (
                  <div
                    style={{
                      display: "flex", flexDirection: "column",
                      justifyContent: "center", alignItems: "center",
                      height: "50vh",
                      marginTop: "100px"
                    }}
                  >
                    {/* <img style={{ width: "25%" }}
                        src={require("../assets/icons/Server-amico.png")} /> */}
                    <div style={{
                      fontFamily: "calibri",
                      color: "purple", textAlign: "center", fontSize: "25px", fontWeight: "bold"
                    }}>
                      System under maintenance... Please wait for a moment... <br /><br />
                      <span style={{ fontSize: "18px" }}> &copy; Freshuit, 2025</span>
                    </div>
                  </div>
                ) :
                  <POS />
                  : <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'black',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '24px',
                    zIndex: 9999,
                    textAlign: 'center',
                    padding: '20px',
                  }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none" stroke="#FFA500" strokeWidth="2"
                      viewBox="0 0 24 24" width="80" height="80"
                      style={{ marginBottom: '20px' }}
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A2 2 0 005 20h14a2 2 0 001.71-3.14l-7.4-12.8a2 2 0 00-3.02 0z" />
                    </svg>
                    <p>Access Denied</p>
                    {/* <p>Your IP: { || 'Unknown'}</p> */}
                  </div>)}
            </>
          ) : (
            <div style={{
              height: '100vh',
              width: '100vw',
              backgroundColor: '#fff0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <div style={{
                transform: 'translateY(-150px)', // marginTop: -50px effect
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                padding: '2rem',
                backgroundColor: '#ffffff',
                border: '2px solid #ffcccc',
                borderRadius: '8px',
                color: '#cc0000',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}>
                {/* ❌ */}
                <h2 style={{ margin: 0, fontSize: '2rem' }}> 📴 Subscription is Inactive</h2>
                <p style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>Access denied</p>

                <p style={{ marginTop: '0.85rem', fontSize: '0.8rem' }}>&copy; Freshuit, 2025</p>
              </div>
            </div>
            // <p style={{ color: "red" }}>❌ Subscription is inactive. Access denied.</p>
          )}



    </>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
