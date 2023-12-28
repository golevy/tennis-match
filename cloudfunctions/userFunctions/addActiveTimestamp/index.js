const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const _ = db.command;

const getdate = (timestamp) => {
  const date = new Date(timestamp);
  return date.getDate();
};

exports.main = async (data, context) => {
  const activeTimestamp = data.activeTimestamp;
  const _id = data._id;
  const res = await db.collection("users").doc(_id).get();

  if (res.data.activeTimestamps.length != 0) {
    const activeTimestamps = res.data.activeTimestamps.filter((item) => getdate(item) !== getdate(activeTimestamp));
    if (activeTimestamps.length == 0) {
      return;
    } else {
      return await db
        .collection("users")
        .doc(_id)
        .update({
          data: {
            activeTimestamps: [...activeTimestamps, activeTimestamp],
          },
        });
    }
  } else {
    const activeTimestamps = [];
    activeTimestamps.push(activeTimestamp);
    return await db.collection("users").doc(_id).update({
      data: {
        activeTimestamps,
      },
    });
  }
};
