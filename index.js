const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// ─── Config ───────────────────────────────────────────────────────────────────
// Set these in your Render environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_ROLE_NAME = process.env.TARGET_ROLE_NAME || "Member"; // Role whose members get renamed

// ─── Gen Z Coded Nicknames ────────────────────────────────────────────────────
const nicknames = [
  "softboi444", "glittercrash", "saturnmood", "prismkid", "voidbabe",
  "chaoscore", "neonwitch", "gaygremlin", "cottagecore404", "blorbogay",
  "pinknoize", "cryptidvibes", "lavenderrot", "demondust", "fairyflop",
  "queercloud", "mushroomboi", "glitchwitch", "starboygay", "mossgremlin",
  "bubblegaymer", "shimmerflop", "weirdkid444", "gayghostie", "plushiegay",
  "auragremlin", "zerogravity", "softcryptid", "glitterrot", "rainbowgremlin",
  "duskyboi", "queersnail", "stardust404", "gloomcore7", "pixiepanic",
  "gayangel404", "pastelrot", "sillylittle", "witchybrat", "cloudboi",
  "pinkgremlin", "gaylittleguy", "driftingqueer", "moonsick", "sparklefreak",
  "tiredgay", "glowworm444", "queerbug", "noodleboi", "hauntedgay",
  "lofikid", "rainbowvoid", "softpanic", "gloompunk", "fairyrot",
  "weirdqueer", "gaycryptid", "shimmerboy", "lollipopgay", "voidkid404",
  "goblincore", "batboi", "softgrunge7", "etherealbrat", "gloomyvibes",
  "slaydust", "spacecore", "nocturnalkid", "rottenangel", "chaoskid404",
];

function randomNickname() {
  return nicknames[Math.floor(Math.random() * nicknames.length)];
}

// ─── Core Logic ───────────────────────────────────────────────────────────────
async function randomizeNicknamesInGuild(guild) {
  console.log(`[${guild.name}] Fetching members...`);

  // Fetch all members
  const members = await guild.members.fetch();

  // Find target role
  const role = guild.roles.cache.find(
    (r) => r.name.toLowerCase() === TARGET_ROLE_NAME.toLowerCase()
  );

  if (!role) {
    console.warn(`[${guild.name}] Role "${TARGET_ROLE_NAME}" not found. Skipping.`);
    return;
  }

  // Filter members with that role (skip bots)
  const targets = members.filter(
    (m) => m.roles.cache.has(role.id) && !m.user.bot
  );

  console.log(`[${guild.name}] Found ${targets.size} member(s) with role "${role.name}". Renaming...`);

  let success = 0;
  let failed = 0;

  for (const [, member] of targets) {
    const nick = randomNickname();
    try {
      await member.setNickname(nick, "Nickname randomizer on deploy");
      console.log(`  ✓ ${member.user.tag} → ${nick}`);
      success++;
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`  ✗ ${member.user.tag} — ${err.message}`);
      failed++;
    }
  }

  console.log(`[${guild.name}] Done. ${success} renamed, ${failed} failed (likely missing permissions or owner).`);
}

// ─── Bot Events ───────────────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Target role: "${TARGET_ROLE_NAME}"`);

  // Run for every guild the bot is in
  for (const [, guild] of client.guilds.cache) {
    await randomizeNicknamesInGuild(guild);
  }

  console.log("All guilds processed. Bot will stay online.");
});

// Optional: slash command to re-trigger manually
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "randomize") return;

  if (!interaction.memberPermissions.has("ManageNicknames")) {
    return interaction.reply({ content: "You need Manage Nicknames permission.", ephemeral: true });
  }

  await interaction.reply("Randomizing nicknames... check console for progress.");
  await randomizeNicknamesInGuild(interaction.guild);
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (!TOKEN) {
  console.error("ERROR: DISCORD_TOKEN environment variable is not set.");
  process.exit(1);
}

client.login(TOKEN);
    
