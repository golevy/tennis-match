const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
const db = cloud.database();
const _ = db.command;
const HALF_HOUR_TIME_INTERVAL = 30 * 60 * 1000;
const formatTime = (startDate) => {
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes > 10 ? minutes : "0" + minutes;
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};

exports.main = async (event, context) => {
  const now = Date.now();
  const { data: willStartCounts } = await db
    .collection("games")
    .where({
      startDate: _.and(_.gte(now), _.lte(now + HALF_HOUR_TIME_INTERVAL)),
    })
    .get();
  console.log(willStartCounts);
  if (willStartCounts.length > 0) {
    willStartCounts.forEach((item) =>
      item.participants.forEach(async (itemtwo) => {
        try {
          const result = await cloud.openapi.subscribeMessage.send({
            touser: itemtwo._openid,
            templateId: "_UL0DwU6KerGVSWaJBi61Vu4KGsmZhejdLBV7Isso7o",
            miniprogram_state: "trial", // 订阅消息跳转小程序时的状态
            page: `/pages/index/index?gameId=${item._id}`, // 订阅消息跳转的页面路径
            data: {
              thing4: {
                value: "play tennis together",
              },
              thing2: {
                value: "网球活动即将开始",
              },
              thing6: {
                value: item.location.name.length > 20 ? item.location.name + "..." : item.location.name,
              },
              date3: {
                value: formatTime(item.startDate),
              },
              time16: {
                value: formatTime(item.endDate),
              },
            },
          });
          return result;
        } catch (error) {
          console.error("发送订阅消息失败", error);
          return error;
        }
      })
    );
  }
};
