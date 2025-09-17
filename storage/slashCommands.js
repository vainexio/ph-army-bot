/*
SUB_COMMAND - 1
SUB_COMMAND_GROUP - 2
STRING - 3
INTEGER - 4
BOOLEAN - 5
USER - 6
CHANNEL - 7
ROLE - 8
MENTIONABLE - 9
NUMBER - 10
ATTACHMENT - 11
*/

module.exports = {
  register: true,
  deleteSlashes: ['1413167010845556797'],
  slashes: [
    {
      "name": "connect",
      "type": 1,
      "description": "Connect your roblox account",
      "options": []
    },
    {
      "name": "disconnect",
      "type": 1,
      "description": "Disconnect your roblox account",
      "options": []
    },
    {
      "name": "update",
      "type": 1,
      "description": "Update user roles",
      "options": [
        {
          "name": "user",
          "type": 3,
          "description": "Discord or Roblox username",
          "required": false
        },
      ]
    },
    {
      "name": "viewxp",
      "type": 1,
      "description": "View user XP",
      "options": [
        {
          "name": "user",
          "type": 3,
          "description": "Discord or Roblox username",
          "required": true
        },
      ]
    },
    {
      name: 'setrank',
      type: 1,
      description: 'Update user rank',
      options: [
        { name: 'user', type: 3, description: 'Discord or Roblox username', required: true },
        { name: 'rank', type: 3, description: 'Rank', required: true },
      ]
    },
    /*

    {
      "name": "xp",
      "type": 1,
      "description": "Add or subtract XP from a user",
      "options": [
        {
          "name": "type",
          "type": 3,
          "description": "Choose whether to add or subtract XP",
          "required": true,
          "choices": [
            { "name": "Add", "value": "Add" },
            { "name": "Subtract", "value": "Subtract" }
          ]
        },
        {
          "name": "usernames",
          "type": 3,
          "description": "Discord or Roblox usernames. Separate each name by comma (player1, player2, @User1, @User2)",
          "required": true
        },
        {
          "name": "amount",
          "type": 4,
          "description": "Amount of XP to add or subtract",
          "required": true
        }
      ]
    },
    {
      name: 'accept',
      type: 1,
      description: 'Accept user to a group',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'group', type: 3, description: 'Group name', choices: groups, required: true },
      ]
    },
    {
      name: 'kick',
      type: 1,
      description: 'Accept user to a group',
      options: [
        { name: 'username', type: 3, description: 'Roblox username', required: true },
        { name: 'group', type: 3, description: 'Group name', choices: groups, required: true },
      ]
    },*/
  ],
};