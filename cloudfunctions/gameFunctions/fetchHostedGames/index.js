const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();

exports.main = async (data, context) => {
  const userId = data.id;
  const _ = db.command;

  return (
    await db
      .collection("games")
      .where({
        _openid: userId
      })
      .orderBy("_createTime", "desc")
      .get()
  ).data;
};
