const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const COLLECTION_NAME = "conversations";

const addRelationship = (content, sendTime, senderId, receiverId, type) => {
  db.collection(COLLECTION_NAME).add({
    data: {
      messages: [
        {
          content,
          sendTime,
          senderId,
          type,
        },
      ],
      relationship: [senderId, receiverId],
    },
  });
};

const pushConversation = (newConversation, senderId, receiverId) => {
  return db
    .collection(COLLECTION_NAME)
    .where({
      relationship: _.eq([senderId, receiverId]).or(_.eq([receiverId, senderId])),
    })
    .update({
      data: {
        messages: newConversation,
      },
    });
};

exports.main = async (data, context) => {
  console.log(data);
  const { senderId, receiverId, content, sendTime, type } = data;
  const res = await db
    .collection(COLLECTION_NAME)
    .where({
      relationship: _.eq([senderId, receiverId]).or(_.eq([receiverId, senderId])),
    })
    .get();
  if (res.data.length == 0) {
    // When two people have no relationship, add a relationship for them and add conversation a data
    addRelationship(content, sendTime, senderId, receiverId, type);
  } else {
    // When two people have relationship, add a data to conversation
    const newConversation = res.data[0].messages;
    newConversation.push({
      content,
      sendTime,
      senderId,
      type,
    });
    return await pushConversation(newConversation, senderId, receiverId);
  }
};
