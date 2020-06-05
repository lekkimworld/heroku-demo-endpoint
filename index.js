require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();

const fetchTemperature = async () => {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${process.env.CITY}&appid=${process.env.APPID}`);
    const data = await res.json();
    return data.main.temp - 273.15;
}

const formatTemperature = temp => {
    return `Temperature in ${process.env.CITY} is ${Math.floor(temp)} degrees Celcius`;
}

const isAccept = (req, contentType) => {
    return req.headers.accept && req.headers.accept.indexOf(contentType) === 0;
}

const sendResponse = async (req, res) => {
    const temp = await fetchTemperature();
    const text = formatTemperature(temp);
    let responseString = text;
    responseString += " (";
    if (res.locals.user) responseString += "authorized, "
    responseString += `${new Date().toISOString()})`;

    if (isAccept(req, "application/json")) {
        res.type("json").send({
            temp,
            "text": responseString
        })
    } else if (isAccept(req, "text/plain")) {
        res.type("text/plain").send(responseString);
    } else {
        res.type("html").send(`<html><body><h1>${responseString})</h1></body></html>`);
    }
}

const acceptedAuth = Buffer.from(`${process.env.USERNAME}:${process.env.PASSWORD}`).toString('base64');
app.get("/auth", async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Basic ${acceptedAuth}`) {
        return res.status(401).send("Unauthorized");
    }
    res.locals.user = {
        "username": process.env.USERNAME
    }

    // respond
    sendResponse(req, res);
})

app.get("/", async (req, res) => {
    // load temp
    const temp = await fetchTemperature();

    // respond
    sendResponse(req, res);
})

app.listen(process.env.PORT || 8080);
