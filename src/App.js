

// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import POS from './pages/pos';

const TARGET_LOCATION = {
  lat: 12.780955, // Replace with your target latitude
  lon: 79.152671 // Replace with your target longitude
};
const MAX_DISTANCE_KM = 80; // Set allowed radius (e.g., 10 km)

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

  useEffect(() => {
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

      // 🟡 Log calculated distance
      console.log("Distance from target (km):", distance);
setAllowed((Math.round(distance * 1000) / 1000) <= MAX_DISTANCE_KM)
      // setAllowed(distance <= MAX_DISTANCE_KM);
    },
    (error) => {
      console.error("Geolocation error:", error);
      setAllowed(false);
    },
    { timeout: 10000 }
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

  if (allowed === null) return <p>Checking location...</p>;
  if (!allowed) return <p>Access Denied: Not in allowed location.</p>;


  return (
    <>
      <POS />
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
