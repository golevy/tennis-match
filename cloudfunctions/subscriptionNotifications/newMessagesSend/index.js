const cloud = require("wx-server-sdk");
const TEMPLATE_ID = "Z5Rcb4pLINMrQRso6KS0zjgtkyXnQzXYbjHvBTZhGlw";

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (data, context) => {
  const { toReceiver, senderName, sendContent, sendTime, messageType } = data;

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: toReceiver,
      page: `/pages/index/index?tab=message`,
      data: {
        thing1: {
          value: senderName,
        },
        thing2: {
          value: sendContent,
        },
        time3: {
          value: sendTime,
        },
        phrase4: {
          value: messageType,
        },
      },
      templateId: TEMPLATE_ID,
      miniprogram_state: "formal",
    });
    return result;
  } catch (err) {
    return err;
  }
};
