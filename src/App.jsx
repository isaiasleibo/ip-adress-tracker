import React, { useEffect } from 'react';
import './css/App.css';
import { IconArrow } from './img/icon-arrow';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

// Custom Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const customIcon = L.icon({
  iconUrl: require("./img/icon-location.png"),
  iconSize: [60, 60],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const [ip, setIp] = React.useState("");
  const [ipReturned, setIpReturned] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [mapLocation, setMapLocation] = React.useState([0, 0]);
  const [timezone, setTimezone] = React.useState("");
  const [isp, setIsp] = React.useState("");

  useEffect(() => {
    let doFetch = true;

    // IP Request
    const getLocation = (ip, doFetch) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (doFetch) {
            fetch(`https://ipwho.is/${ip}`)
              .then(response => response.json())
              .then(data => {
                doFetch = false;
                if (data.region !== undefined) {
                  setIpReturned(data.ip);
                  setLocation(`${data.region}, ${data.city}, ${data.postal}`)
                  setTimezone(`UTC ${data.timezone.utc}`);
                  setIsp(data.connection.isp);
                  setMapLocation([data.latitude, data.longitude]);
                } else {
                  setIpReturned("Not found");
                  setLocation("Not found");
                  setTimezone("Not found");
                  setIsp("Not found");
                }

                resolve();
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
          }
        }, 100);
      });
    };

    getLocation(ip, doFetch);

    return () => {
      doFetch = false;
    };
  }, [ip]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target[0].value;
    setIp(input);
  };

  function Map() {

    return (
      <MapContainer id="map" center={[mapLocation[0] + 0.0007, mapLocation[1]]} zoom={17}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapLocation} icon={customIcon} />
      </MapContainer>
    )
  }

  const ipInfo = React.useRef();
  const setIpInfoPosition = () => {
    if (ipInfo.current) {
      const ipInfoHeight = ipInfo.current.offsetHeight;
      const ipInfoPosition = ipInfoHeight / 2;

      if (window.innerWidth <= 1140) {
        ipInfo.current.style.top = `150px`;
        ipInfo.current.style.bottom = 'auto';
      } else {
        ipInfo.current.style.bottom = `-${ipInfoPosition}px`;
        ipInfo.current.style.top = 'auto';
      }
    }
  };

  useEffect(() => {
    setInterval(() => {
      setIpInfoPosition();
    }, 10)
  })

  return (
    <>
      <div id="ipInputContainer">
        <h1>IP Address Tracker</h1>
        <form id="inputContainer" onSubmit={handleSubmit}>
          <div id="input">
            <input type="text" placeholder='Search for any IP address or domain' />
            <button type="submit" id='sendInput'>
              <IconArrow />
            </button>
          </div>
        </form>

        <div id="ipInfo" ref={ipInfo}>
          <div id="ipAdressContainer">
            <p>IP ADDRESS</p>
            <h2 id='ip'>{ipReturned}</h2>
          </div>
          <div id='locationContainer'>
            <p>LOCATION</p>
            <h2 id='location'>{location}</h2>
            <div className="border"></div>
          </div>
          <div id="timezoneContainer">
            <p>TIMEZONE</p>
            <h2 id="timezone">{timezone}</h2>
            <div className="border"></div>
          </div>
          <div id="ispContainer">
            <p>ISP</p>
            <h2 id='isp'>{isp}</h2>
            <div className="border"></div>
          </div>
        </div>
      </div>

      <Map />
    </>
  );
}

export default App;