const joinGame = require('./joinGame/index')
const cancelGame = require('./cancelGame/index')
const fetchAllUserGames = require('./fetchAllUserGames/index')
const fetchHostedGames = require('./fetchHostedGames/index')

exports.main = async (event, context) => {
  const data = event.data
  switch (event.action) {
    case 'joinGame':
      return await joinGame.main(data, context)
    case 'cancelGame':
      return await cancelGame.main(data, context)
    case 'fetchAllUserGames':
      return await fetchAllUserGames.main(data, context)
    case 'fetchHostedGames':
      return await fetchHostedGames.main(data, context)
  }
}
