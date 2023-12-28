const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (data, context) => {
  const { _id } = data;
  const res = await db.collection("conversations").get();
  return res.data
    .filter((item) => item.relationship.includes(_id))
    .map((item) => {
      const lastMessages = item.messages.filter((item_two, index) => index === item.messages.length - 1);
      return {
        messages: lastMessages,
        relationship: item.relationship,
      };
    });
};
