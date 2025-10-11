const settings = require('../storage/settings_.js')
const { prefix, colors, theme, commands, permissions, emojis } = settings
const others = require('../functions/others.js')
//Functions
const get = require('../functions/get.js')
const fetch = require('node-fetch');

let csrfToken = "abc"

async function refreshToken(cookie) {
  const response = await fetch('https://auth.roblox.com/v2/logout', {
    method: "POST",
    headers: {
      "Cookie": cookie
    }
  });

  if (response.status === 403) {
    csrfToken = response.headers.get('x-csrf-token')
    console.log("New csrfToken token: " + csrfToken)
    return csrfToken;
  } else {
    return { error: "Can't get CSRF token!" }
  }
}

let userCache = []
let groupRolesCache = []

module.exports = {
  handler: {
    changeUserRank: async function(data) {
      const auth = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
        body: JSON.stringify({ roleId: data.roleId }),
      };
      let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
        return patchRes;
      }
      return patchRes;
    },
    getUserThumbnail: async function(userId) {
      let thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false&thumbnailType=HeadShot`);
      let thumbnail = await thumbnailResponse.json();
      thumbnail = !thumbnail.errors ? thumbnail.data[0].imageUrl : '';
      return thumbnail;
    },
    getUser: async function(usernameOrId) {
      // If it's already cached by string key, return
      if (userCache[usernameOrId.toLowerCase?.() || usernameOrId]) {
        console.log('User cache hit:', usernameOrId.toLowerCase?.() || usernameOrId);
        return userCache[usernameOrId.toLowerCase?.() || usernameOrId];
      }

      let user;
      if (/^\d+$/.test(usernameOrId)) {
        // Treat as Roblox ID
        let userResponse = await fetch(`https://users.roblox.com/v1/users/${usernameOrId}`);
        if (!userResponse.ok) {
          return { error: userResponse.status + ": " + userResponse.statusText };
        }
        user = await userResponse.json();
      } else {
        // Treat as Roblox username
        let userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
          method: 'POST',
          body: JSON.stringify({ usernames: [usernameOrId], excludeBannedUsers: false }),
          headers: { 
            'Content-Type': 'application/json',
            "Cookie": `${process.env.Cookie}`
          },
        });
        if (!userResponse.ok) {
          return { error: userResponse.status + ": " + userResponse.statusText };
        }
        user = (await userResponse.json()).data[0];
      }

      if (!user) return { error: "This roblox account doesn't exist!" }
      console.log('Designated user:', user);

      // Cache by lowercase username if it exists, otherwise by ID
      const cacheKey = user.name?.toLowerCase() || String(user.id);
      userCache[cacheKey] = user;

      return user;
    },
    getUserRole: async function(groupId, userId) {
      try {
        let userRolesResponse = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
        let userRoles = await userRolesResponse.json();
        let groupData = userRoles.data.find(d => d.group.id == groupId);
        if (groupData) {
          let role = groupData.role;
          return role;
        } else {
          return { error: "Player not in group." }
        }
      } catch (err) {
        return { error: err }
      }
    },
    acceptUser: async function(groupId, userId) {
      const auth = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let link = `https://groups.roblox.com/v1/groups/${groupId}/join-requests/users/${userId}`
      console.log(link)
      let patchRes = await fetch(link, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(link, auth);
        return patchRes;
      }
      return patchRes;
    },
    kickUser: async function(groupId, userId) {
      const auth = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
        return patchRes;
      }
      return patchRes;
    },
    //
    cToken: function() { return csrfToken },
    getGroup: async function(groupId) {
      try {
        let group = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
        group = await group.json();
        return group;

      } catch (err) {
        return { error: err }
      }
    },
    getGroupRoles: async function(groupId) {
      try {
        if (groupRolesCache[groupId]) {
          console.log('Group roles cache hit:', groupId)
          return groupRolesCache[groupId];
        }
        let groupRolesResponse = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        let groupRoles = await groupRolesResponse.json();

        groupRolesCache[groupId] = groupRoles
        return groupRoles;
      } catch (err) {
        return { error: err }
      }
    },
    refreshToken,
    //
  }
};