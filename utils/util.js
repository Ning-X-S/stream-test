module.exports = {
  getTimeStr: function () {
    const currentTime = new Date()
    return `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`
  },
  splitStr: function(str, key) {
    return str.split(key)[1]
  }
}