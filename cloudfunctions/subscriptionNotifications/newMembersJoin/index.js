const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
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

exports.main = async (data, context) => {
  const { _id, _openid, location, startDate, participant_nickname } = data;
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: _openid,
      templateId: "8hHKzVeRC3kiiwz9pZUSghmLpdNjtSGRfqm6N5Macr8",
      miniprogram_state: "trial", // 订阅消息跳转小程序时的状态
      page: `/pages/index/index?gameId=${_id}`, // 订阅消息跳转的页面路径
      data: {
        thing1: {
          value: "have a friend join",
        },
        thing2: {
          value: "有朋友报名了你的球局",
        },
        thing3: {
          value: location.name,
        },
        name4: {
          value: participant_nickname,
        },
        date5: {
          value: formatTime(startDate),
        },
      },
    });
    return result;
  } catch (error) {
    console.error("发送订阅消息失败", error);
    throw error;
  }
};
