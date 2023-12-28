const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (data, context) => {
  const { senderId, receiverId } = data;
  const res = await db
    .collection("conversations")
    .where({
      relationship: _.eq([senderId, receiverId]).or(_.eq([receiverId, senderId])),
    })
    .get();
  return res.data;
};
