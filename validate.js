const axios = require("axios");
require('dotenv').config();
const jwt = require("jsonwebtoken");
var qs = require('qs');
let access_token;
let badges = {
    "3D Printing": "IJ0D12dJR6eJnSQeBW5tyw",
    "Soldering": "IJ0D12dJR6eJnSQeBW5tyw",
    "Dremel Laser": "-JgrvHznRp-1E_WATqXXEg",
    "Laguna Laser": "-CFuUWbrRpOc4F29LJMU0g",
    "Embroidery": "oFcT5o3tT0GHLZyOad80Cg",
    "3D Scanning": "1CVb6aSARWGMyzFjfY6E5g",
    "Cutting Plotter": "RDJwIxoiS_SYWWMGBRq-gw",
    "Soldering": "Pp89odtPQ_-zw5KTunnPUw",
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

const retrieveAccessToken = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", process.env.BADGR_EMAIL);
    urlencoded.append("password", process.env.BADGR_PASSWORD);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://api.badgr.io/o/token", requestOptions)
        .then(response => response.json())
        .then(result => getListOfBadges(badges["3D Printing"], result.access_token))
        .catch(error => console.log('error', error));
        
        //getListOfBadges(badges["3D Printing"], response.data.access_token)
}

const testAPI = async () => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("https://api.publicapis.org/entries", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error)); 
}



const getListOfBadges = async (entityId, token) => {
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`https://api.badgr.io/v2/badgeclasses/${entityId}/assertions`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}


let token = retrieveAccessToken()