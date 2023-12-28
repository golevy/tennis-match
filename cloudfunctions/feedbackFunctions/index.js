const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const COLLECTION_NAME = "feedback";

exports.main = async (event, context) => {
  const { userId, userName, feedbackType, feedbackContent } = event;

  try {
    return await db.collection(COLLECTION_NAME).add({
      data: {
        userId: userId,
        userName: userName,
        feedbackType: feedbackType,
        feedbackContent: feedbackContent,
        createAt: db.serverDate(),
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "An error occurred when uploading feedback.",
    };
  }
};
