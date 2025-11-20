let colors = {
  red: "#FF7373",
  blue: "#85A3FF",
  green: "#00b615",
  yellow: "#fff4a1",
  orange: "#ff6300",
  purple: "#b200ff",
  pink: "#ff00d6",
  cyan: "#00feff",
  black: "#000000",
  white: "#ffffff",
  lime: "#7ebb82",
  none: "#2B2D31",
}

module.exports = {
  prefix: ";", // Prefix
  config: {
    channels: {
      logs: '1413165222914687128',
      templates: '1411234162882515017',
      selections: '1392701616393687111',
      trainings: '1392701528753836124',
    },
    awards: [
      {
        awardName: "<:Armed_Forces_Conduct_Medal:1440328971408506880> Armed Forces Conduct Medal",
        requiredMerits: 500,
      },
      {
        awardName: "<:Military_Commendation_Medal:1440329045463269416> Military Commendation Medal",
        requiredMerits: 1000,
      },
      {
        awardName: "<:Military_Civic_Action_Medal:1440329134248296448> Military Civic Action Medal",
        requiredMerits: 1500,
      },
      {
        awardName: "<:Sagisag_Ulirang_Kawal:1440329181983412385> Sagisag ng Ulirang Kawal",
        requiredMerits: 2000,
      },
    ],
    groups: [
      { "groupId": 33359913, "mainRole": "1423143103128141914", 
       "roles": [
        {
          "name": "Foreign Service Officer, Class 2",
          "prefix": "[FSO2]",
          "rank": 3,
          "roles": [
            "1426400041882484868",
            "1426405254194401321"
          ]
        },
         {
           "name": "Foreign Service Officer, Class 1",
           "prefix": "[FSO1]",
           "rank": 4,
           "roles": [
             "1426400041882484868",
             "1426405372947599360"
           ]
         },
         {
            "name": "Career Minister",
            "prefix": "[CM]",
            "rank": 5,
            "roles": [
              "1426400041882484868",
              "1426405403226538176"
            ]
          },
         {
           "name": "Chief of Mission, Class 2",
           "prefix": "[CoM2]",
           "rank": 6,
           "roles": [
             "1426400041882484868",
             "1426405445010067516"
           ]
         },
         {
            "name": "Chief of Mission, Class 1",
            "prefix": "[CoM1]",
            "rank": 7,
            "roles": [
              "1426400041882484868",
              "1426405453834752214"
            ]
          },
         {
           "name": "Assistant Secretary of Foreign Affairs",
           "prefix": "[ASEC]",
           "rank": 8,
           "roles": [
             "1426400041882484868",
             "1426405514270736466"
           ]
         },
         {
            "name": "Undersecretary for Multilateral Affairs and Bilateral Relations",
            "prefix": "[USEC]",
            "rank": 9,
            "roles": [
              "1426400041882484868",
              "1426405548500189345"
            ]
          },
         {
           "name": "Undersecretary for Administration",
           "prefix": "[USEC]",
           "rank": 253,
           "roles": [
             "1426400041882484868",
             "1426405574559404142"
           ]
         },
      ] }, // DFA
      {
        "groupId": 34624144,
        "mainRole": "1261689745394896896",
        "roles": [
          {
            "name": "[PVT] Private",
            "prefix": "[PVT]",
            "rank": 1,
            "requiredXp": 1,
            "roles": [
              "1413155983500247132",
              "1414591262576607302",
              "1421169005946998794",
              "1261689753904873585"
            ]
          },
          {
            "name": "[PFC] Private First Class",
            "prefix": "[PFC]",
            "rank": 2,
            "requiredXp": 1,
            "roles": [
              "1413155983500247132",
              "1414591217697554522",
              "1261689753120804895",
              "1261689753904873585"
            ]
          },
          {
            "name": "[CPL] Corporal",
            "prefix": "[CPL]",
            "rank": 3,
            "requiredXp": 1,
            "roles": [
              "1413155983500247132",
              "1414591173732859924",
              "1261689753120804895",
              "1261689753904873585"
            ]
          },
          {
            "name": "[SGT] Sergeant",
            "prefix": "[SGT]",
            "rank": 5,
            "requiredXp": 1,
            "roles": [
              "1413156030874914967",
              "1414591116971348000",
              "1261689753120804895",
              "1261689753904873585"
            ]
          },
          {
            "name": "[SSGT] Staff Sergeant",
            "prefix": "[SSGT]",
            "rank": 6,
            "requiredXp": 1,
            "roles": [
              "1413156030874914967",
              "1414591055084388436",
              "1261689753120804895",
              "1261689753904873585"
            ]
          },
          {
            "name": "[TSGT] Technical Sergeant",
            "prefix": "[TSGT]",
            "rank": 7,
            "requiredXp": 1,
            "roles": [
              "1413482945120960533",
              "1414590991150616728",
              "1261689753904873585"
            ]
          },
          {
            "name": "[MSG] Master Sergeant",
            "prefix": "[MSG]",
            "rank": 8,
            "requiredXp": 1,
            "roles": [
              "1413482945120960533",
              "1414590929477570610"
            ]
          },
          {
            "name": "[SMSG] Senior Master Sergeant",
            "prefix": "[SMSG]",
            "rank": 9,
            "requiredXp": 1,
            "roles": [
              "1413482945120960533",
              "1414590864302407800"
            ]
          },
          {
            "name": "[CMSG] Chief Master Sergeant",
            "prefix": "[CMSG]",
            "rank": 10,
            "requiredXp": 1,
            "roles": [
              "1413482945120960533",
              "1414590785411743836"
            ]
          },
          {
            "name": "[2LT] Second Lieutenant",
            "prefix": "[2LT]",
            "rank": 12,
            "roles": [
              "1413156071538692227",
              "1413481854564302898",
              "1414590719770886195"
            ]
          },
          {
            "name": "[1LT] First Lieutenant",
            "prefix": "[1LT]",
            "rank": 13,
            "roles": [
              "1413156071538692227",
              "1413481854564302898",
              "1414590659788275723"
            ]
          },
          {
            "name": "[CPT] Captain",
            "prefix": "[CPT]",
            "rank": 14,
            "roles": [
              "1413156071538692227",
              "1413481854564302898",
              "1414590600690274406"
            ]
          },
          {
            "name": "[MAJ] Major",
            "prefix": "[MAJ]",
            "rank": 15,
            "roles": [
              "1413156071538692227",
              "1413482015646552156",
              "1414590498928332930"
            ]
          },
          {
            "name": "[LTCOL] Lieutenant Colonel",
            "prefix": "[LTCOL]",
            "rank": 16,
            "roles": [
              "1413156071538692227",
              "1413482015646552156",
              "1414590443076714578"
            ]
          },
          {
            "name": "[COL] Colonel",
            "prefix": "[COL]",
            "rank": 17,
            "roles": [
              "1413156071538692227",
              "1413482015646552156",
              "1414590386445226077"
            ]
          },
          {
            "name": "[BGEN] Brigadier General",
            "prefix": "[BGEN]",
            "rank": 19,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1414590295840002052"
            ]
          },
          {
            "name": "[MGEN] Major General",
            "prefix": "[MGEN]",
            "rank": 20,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1414589767705694301"
            ]
          },
          {
            "name": "[SMPA] Sergeant Major of the Philippine Army",
            "prefix": "[SMPA]",
            "rank": 22,
            "roles": [
              "1415376688828776509",
              "1413482945120960533",
            ]
          },
          {
            "name": "[VCPA] Vice Commander of the Philippine Army",
            "prefix": "[VCPA]",
            "rank": 23,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1414589767705694301",
              "1415376393893707990",
              "1415376688828776509",
            ]
          },
          {
            "name": "[CGPA] Commander of the Philippine Army",
            "prefix": "[CGPA]",
            "rank": 24,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1413484948223950990",
              "1415376173591957596",
              "1415376688828776509",
            ]
          },
          {
            "name": "District Engineer",
            "prefix": "[DE]",
            "rank": 25,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1261689694454812774",
              "1415376688828776509",
            ]
          },
          {
            "name": "Chief of Staff of the AFP",
            "prefix": "[CSAFP]",
            "rank": 26,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1261689693800632422",
              "1415376688828776509",
            ]
          },
          {
            "name": "Secretary of Foreign Affairs",
            "prefix": "[SFA]",
            "rank": 250,
            "roles": [
              "1415376688828776509",
              "1416678478044074014",
            ]
          },
          {
            "name": "Secretary of National Defense",
            "prefix": "[SND]",
            "rank": 254,
            "roles": [
              "1415376688828776509",
              "1420371898776289341",
            ]
          },
          {
            "name": "Philippine Army Holder",
            "prefix": "[H]",
            "rank": 255,
            "roles": [
              "1413156071538692227",
              "1413154692414046338",
              "1261689693800632422",
            ]
          }
        ]
      },
      { "groupId": 620652552, "mainRole": "1266333954009600060", "roles": [] }, // AMP
      { "groupId": 544329418, "mainRole": "1274256995704115221", "roles": [] }, // SOCOM
      { "groupId": 1030204528, "mainRole": "1420406497313165455", "roles": [] }, // SRR
      { "groupId": 308980598, "mainRole": "1420406646370336830", "roles": [] }, // LRR
      { "groupId": 295395240, "mainRole": "1420406552120262686", "roles": [] }, // SFRA
      { "groupId": 8584027, "mainRole": "1416811650995978322", "roles": [] }, // JRSG
      { "groupId": 815276884, "mainRole": "1266333986410463263", "roles": [] }, // TRADOC
      { "groupId": 34844808, "mainRole": "1417828863169396756", "roles": [] }, // OCS
      { "groupId": 14198648, "mainRole": "1422981951815548998", "roles": [] }, // 1ID
    ],
    bot: {
      status: {
        status: "online",
        activities: [
          {
            name: "the Army",
            type: "Watching".toUpperCase(),
          },
        ],
      },
    },
  },
  permissions: [
    {
      id: "1",
      level: 4,
    },
    {
      id: "1415376688828776509", // HQ
      level: 4,
    },
    {
      id: "497918770187075595", // VAI
      level: 5,
    },
    {
      id: "1426940803808493762", // Rank Perms
      level: 4,
    },
  ],
  colors: colors,
  theme: colors.none,
  emojis: {
    check: '<a:check:969936488739512340>',
    x: '<a:Xmark:969401924736651284>',
    loading: '<a:loading:968743431528669210>',
    warning: '<:S_warning:1108743925012902049>',
    on: '<:on:1107664866484953178>',
    off: '<:off:1107664839372964010>',
    green: '<:online_:1004014930959286342>',
    red: '<:dnd_:1004017480613773422>',
  },
  commands: [
    //
    {
      Command: "help",
      Template: " [command]",
      Alias: [],
      Category: "Misc",
      Desc: "Description",
      ex: [],
      level: 4,
    },
    //
  ],
};
