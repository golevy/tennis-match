const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const COLLECTION_NAME = "users";

exports.main = async (data, context) => {
  const activeTimestamp = data.activeTimestamp;
  const _id = data._id;
  const res = await db.collection(COLLECTION_NAME).doc(_id).get();
  const activeTimestamps = res.data.activeTimestamps.filter((item) => item != activeTimestamp);
  console.log(activeTimestamps);
  return await db.collection(COLLECTION_NAME).doc(_id).update({
    data: {
      activeTimestamps,
    },
  });
};
