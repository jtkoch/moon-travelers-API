const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const index = express()
index.use(bodyParser.json())
index.use(bodyParser.urlencoded({ extended: true }))
index.use(cors())

index.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Change later to only allow our server
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

const port = process.env.PORT || 3030

index.listen(port, () => {
    console.log(`\n=== Server listening on port ${port} ===\n`)
})

index.get('/', async (req, res) => {
    try {
        const messageOFTheDay = process.env.MOTD || 'Hello World!'
        res.status(200).json({ motd: messageOFTheDay })
    } catch(error) {
        console.error('\nERROR', error)
        res.status(500).json({
            error: 'Cannot retrieve the message'
        })
    }
})

index.post('/v1', (req, res) => {
    const data = req.body
    const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
            user: process.env.USER_NAME,
            pass: process.env.PASS
        }
    })

    const mailOptions = {
        from: data.email,
        to: process.env.USER_NAME,
        subject: 'Moon Travelers Contact Form',
        html:  `<p>Name: ${data.name}</p>
                <p>Email: ${data.email}</p>
                <p>Service Requested: ${data.service}</p>
                <p>Message: ${data.message}</p>
                `
    }

    smtpTransport.sendMail(mailOptions,
        (error, response) => {
            if(error) {
                res.send(error)
                console.log("error : " + JSON.stringify(error))
            }else {
                res.send('Success')
                console.log("response : " + JSON.stringify(response))
            }
            smtpTransport.close()
        })
})