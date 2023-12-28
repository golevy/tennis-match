// Collections call
const db = wx.cloud.database();

function cloudCall(promiseCall, tag = "Database call", preProcess = null) {
  return new Promise((resolve, reject) => {
    promiseCall
      .then((res) => {
        const result = res.data;
        if (preProcess) {
          preProcess(result);
        }
        resolve(result);
      })
      .catch((err) => {
        reject(`${tag} failure: ${err}`);
      });
  });
}

function cloudFunctionCall(functionName, action, data = null, preProcess = null) {
  return new Promise((resolve, reject) => {
    wx.cloud
      .callFunction({
        name: functionName,
        data: {
          action,
          data,
        },
      })
      .then((res) => {
        console.log(action, res);
        const result = res.result;
        if (preProcess) {
          preProcess(result);
        }
        resolve(result);
      })
      .catch((err) => {
        console.error(action, err);
        reject(`${action} failure: ${err}`);
      });
  });
}

function getAppConfig() {
  return new Promise((resolve, reject) => {
    cloudCall(db.collection("appconfig").get()).then((configs) => {
      resolve(configs[0]);
    });
  });
}

function parseFormattedDate(dateString) {
  const parts = dateString.split(" "); // Split the string into date and time parts
  const datePart = parts[0];
  const timePart = parts[1];
  const [month, day] = datePart.split("/");
  const [hour, minute] = timePart.split(":");
  const now = new Date();
  const year = now.getFullYear();
  const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  return parsedDate.getTime(); // Return the timestamp
}

function formatDate(timestamp) {
  var date = new Date(timestamp);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  var d = date.getDate();
  d = d < 10 ? "0" + d : d;
  var h = date.getHours();
  h = h < 10 ? "0" + h : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? "0" + minute : minute;
  second = second < 10 ? "0" + second : second;
  return m + "/" + d + " " + h + ":" + minute;
}

function formatDateTwo(timestamp) {
  var date = new Date(timestamp);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  var d = date.getDate();
  d = d < 10 ? "0" + d : d;
  var h = date.getHours();
  h = h < 10 ? "0" + h : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? "0" + minute : minute;
  second = second < 10 ? "0" + second : second;
  return y + "-" + m + "-" + d;
}

function formatDateThree(timestamp) {
  var date = new Date(timestamp);
  var h = date.getHours();
  h = h < 10 ? "0" + h : h;
  var minute = date.getMinutes();
  minute = minute < 10 ? "0" + minute : minute;
  return h + ":" + minute;
}

function calcDistance(la1, lo1, la2, lo2) {
  var La1 = (la1 * Math.PI) / 180.0;
  var La2 = (la2 * Math.PI) / 180.0;
  var La3 = La1 - La2;
  var Lb3 = (lo1 * Math.PI) / 180.0 - (lo2 * Math.PI) / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  return s.toFixed(2);
}

function dateDiff(date1, date2) {
  return Math.round((date1 - date2) / (1000 * 60 * 60 * 24));
}

function getDayOfWeek(timestamp) {
  const daysOfWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  const date = new Date(timestamp);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

function getDateString(timestamp) {
  const now = new Date();
  const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const currentWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);

  const targetDate = new Date(timestamp);
  const isFuture = targetDate > now && targetDate >= currentWeekStart && targetDate <= currentWeekEnd;

  if (isFuture) {
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekdays[targetDate.getDay()];
  } else {
    const options = {
      month: "2-digit",
      day: "2-digit",
    };
    return targetDate.toLocaleDateString("en-US", options).replace(/\//g, "/");
  }
}

module.exports = {
  cloudCall,
  cloudFunctionCall,
  getAppConfig,
  formatDate,
  formatDateTwo,
  formatDateThree,
  parseFormattedDate,
  calcDistance,
  dateDiff,
  getDayOfWeek,
  getDateString,
};
