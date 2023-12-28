const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const COLLECTION_NAME = "conversations";

const addMessageWithAdditionalInfo = async (senderId, receiverId, type, location, dayOfWeek, startTime, endTime, date, id) => {
  const newMessage = {
    senderId,
    receiverId,
    type,
    gameInfo: {
      location,
      dayOfWeek,
      startTime,
      endTime,
      date,
      id,
    },
    sendTime: Date.now(),
  };

  const res = await db
    .collection(COLLECTION_NAME)
    .where({
      relationship: _.eq([senderId, receiverId]).or(_.eq([receiverId, senderId])),
    })
    .get();

  const conversationsToUpdate = res.data;

  // Map through conversationsToUpdate and add the new message to messages
  const updates = conversationsToUpdate.map((conversation) => {
    const updatedMessages = [...conversation.messages, newMessage]; // Add the new message to messages array

    return {
      _id: conversation._id,
      messages: updatedMessages,
    };
  });

  // Update conversations in the collection
  for (const updateData of updates) {
    await db
      .collection(COLLECTION_NAME)
      .doc(updateData._id)
      .update({
        data: {
          messages: updateData.messages,
        },
      });
  }
};

exports.main = async (data, context) => {
  console.log(data);
  const { senderId, receiverId, type, location, dayOfWeek, startTime, endTime, date, id } = data;

  await addMessageWithAdditionalInfo(senderId, receiverId, type, location, dayOfWeek, startTime, endTime, date, id);
};
