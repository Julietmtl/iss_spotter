const request = require('request');

const url = "https://api.ipify.org?format=json";

const fetchMyIP = function(callback) {
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
    }
    
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    const ip = JSON.parse(body).ip;
    callback(null, ip);
    return ip;
  });
};


const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Coordinates. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    const { latitude, longitude } = JSON.parse(body);
    // const latitude = data.latitude;
    // const longitude = data.longitude;
    // const coords = {
    //   latitude: latitude,
    //   longitude: longitude
    //}
    callback(null, { latitude, longitude });
  });
};


const fetchISSFlyOverTimes = function(coords, callback) {
  let msg;
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching pass times. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    const passes = JSON.parse(body).response;
    for(let pass of passes) {
      let duration = pass.duration;
      let risetime = new Date(pass.risetime * 1000);
      let msg = `Next pass at ${risetime.toLocaleString()} (Eastern Time) for ${duration} seconds!`
      callback(null, msg);
    }
  });
};

//Next pass at Fri Jun 01 2021 13:01:35 GMT-0700 (Pacific Daylight Time) for 465 seconds!

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }
    
      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};



module.exports = { nextISSTimesForMyLocation };
