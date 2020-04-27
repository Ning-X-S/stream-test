// const { sendEmail } = require('./send')

const fs = require('fs');
const { getTimeStr } = require('./utils/util')
const { spawn } = require('child_process')
const path = require('path')
const request = require('./utils/request');
const params = process.argv.splice(2)
const config = require('./config')
const time_interval = config[params[0]] || 60

console.log(params)

startTest()

function startTest() {
  const nowTime = getTimeStr()
  const logName = path.join(__dirname, './log/out', nowTime.slice(0, 13) + '.log')
  const spawnObj = spawn('ping', ['m.lehe.com'])
  const writeStream = fs.createWriteStream(logName, { flags: 'a' })
  let errorMap = new Map()

  spawnObj.stdout.pipe(writeStream)

  spawnObj.stdout.on('data', async (chunk) => {
    let chunkString = chunk.toString().trim()
    let line = chunkString
    // 去掉起始的一行
    if (chunkString.indexOf('PING') > -1) {
      line = chunkString.split('\n')[1]
    }
    // 'Request timeout for icmp_seq'
    // 如果不正常
    if (line.indexOf(' time=') < 0) {
      // 按分钟
      let timeStr = getTimeStr().slice(0, 16)
      if (errorMap.has(timeStr)) {
        errorMap.get(timeStr).push({
          time: getTimeStr(),
          text: line
        })
      } else {
        errorMap.set(timeStr, [{
          time: getTimeStr(),
          text: line
        }])
      }
    } else {
      if (new Date().getSeconds() === 0) {
        for ([key, value] of errorMap) {
          let res = await request({
            url: config[`${process.env.NODE_ENV}-host`] + '/create_net',
            method: 'post',
            data: {
              machine_name: params[1] || '这个名称',
              time_interval: time_interval,
              fluctua_num: value.length,
              record_start_time: `${key}:00`,
              record_end_time: `${key}:59`
            },
          });
          if (res.error_code === 0) {
            console.log(key + `\nsuccess`)
            errorMap.delete(key)
          }
        }
      }
    }
    if (new Date().getHours() > Number(logName.slice(11, 13))) {
      writeStream.end('End')
      spawnObj.kill()
      startTest()
    }
  })
  spawnObj.stderr.on('data', data => {
    spawnError(data.toString().replace(/\n/g, ''))
  })
  spawnObj.on('exit', code => {
    console.log('exit code : ' + code)
  })
  spawnObj.on('close', function (code) {
    console.log('close code : ' + code)
  })
  spawnObj.on('error', function (code) {
    console.log('启动子进程失败')
  })

  function spawnError(errString, isStderr) {
    process.nextTick(() => {
      if (errString.indexOf('ping:') > -1) {
        const logName = path.join(__dirname, './log/error', nowTime.slice(0, 13) + '.log')
        const writeStream = fs.createWriteStream(logName, { flags: 'a' })
        writeStream.write(`${getTimeStr()}: ` + errString + '\n')
      }
    })
  }
}
