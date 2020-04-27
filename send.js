
"use strict";

const nodemailer = require("nodemailer")
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const TEMPLATE = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'templates', 'index.ejs'), 'utf8'))
const EMAIL_CONFIG = require('./config')

module.exports = {
  sendEmail
}


function sendEmail (data) {
  const template = generateReport(data)

  if (process.env.NODE_ENV === 'production') {
    EMAIL_CONFIG.receviers.map((addr) => {
      handleSendEmail(addr, template)
    })
  } else {
    handleSendEmail('540421017@qq.com', template)
  }
}

function generateReport (data) {

  return TEMPLATE({
    start:data[0].time,
    end:data[data.length-1].time,
    count:data.length,
    list:data
  })
}

function handleSendEmail (receiver, html) {
  const transporter = nodemailer.createTransport({
    service: 'smtp.exmail.qq.com',
    service: 'QQex',
    secureConnection: true,
    port: 465,
    auth: {
      user: EMAIL_CONFIG.username,
      pass: EMAIL_CONFIG.password
    }
  })

  let mailOptions = {
    from: EMAIL_CONFIG.username,
    to: receiver,
    subject: '这是title',
    html: html
  };
  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    makeLog(`发送邮件到----${receiver}`);
  });
}

function makeLog (msg) {
  let date = new Date()
  let info = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} ---------- ${msg}`
  try {
    let sendTxt = fs.readFileSync('./log/send-log.log', 'utf-8')
    fs.writeFile('./log/send-log.log', `${sendTxt}\n${info}`,  function(err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
      }
    })
  } catch (err) {
    console.log(err)
  }
}