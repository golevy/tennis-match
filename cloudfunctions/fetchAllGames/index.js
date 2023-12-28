const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const COLLECTION_NAME = 'games'

exports.main = async (event, context) => {
  // Get number of games
  let count = await db.collection(COLLECTION_NAME).count()
  count = count.total

  let allGames = []
  for (let i = 0; i < count; i += 100) {
    let games = await db.collection(COLLECTION_NAME).skip(i).get()
    allGames = allGames.concat(games.data)
  }

  return allGames
}
