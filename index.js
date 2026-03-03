const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");

// ─── Render Web Service: open port immediately so deploy succeeds ─────────────
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => res.end("ok")).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT} — Render is happy ✓`);
});

// ─── Config ───────────────────────────────────────────────────────────────────
const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_ROLE_NAME = process.env.TARGET_ROLE_NAME || "Member";

console.log(`TOKEN loaded: ${TOKEN ? "✓ (length: " + TOKEN.length + ")" : "✗ MISSING"}`);
console.log(`TARGET_ROLE_NAME: "${TARGET_ROLE_NAME}"`);

if (!TOKEN) {
  console.error("ERROR: DISCORD_TOKEN is not set. Add it to your Render env vars.");
  process.exit(1);
}

// ─── Discord Client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on("debug", (msg) => console.log(`[debug] ${msg}`));
client.on("warn", (msg) => console.warn(`[warn] ${msg}`));
client.on("error", (err) => console.error(`[error] ${err.message}`));

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
  console.log(`\n[${guild.name}] Fetching members...`);

  const members = await guild.members.fetch();

  const role = guild.roles.cache.find(
    (r) => r.name.toLowerCase() === TARGET_ROLE_NAME.toLowerCase()
  );

  if (!role) {
    console.warn(`[${guild.name}] Role "${TARGET_ROLE_NAME}" not found. Skipping.`);
    return;
  }

  const targets = members.filter((m) => m.roles.cache.has(role.id) && !m.user.bot);
  console.log(`[${guild.name}] Found ${targets.size} member(s) with role "${role.name}". Renaming...`);

  let success = 0;
  let failed = 0;

  for (const [, member] of targets) {
    const nick = randomNickname();
    try {
      await member.setNickname(nick, "Nickname randomizer on deploy");
      console.log(`  ✓ ${member.user.tag} → ${nick}`);
      success++;
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`  ✗ ${member.user.tag} — ${err.message}`);
      failed++;
    }
  }

  console.log(`[${guild.name}] Done! ${success} renamed, ${failed} failed.\n`);
}

// ─── Bot Events ───────────────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log(`\n✅ Bot online as ${client.user.tag}`);
  console.log(`🎯 Target role: "${TARGET_ROLE_NAME}"`);

  for (const [, guild] of client.guilds.cache) {
    await randomizeNicknamesInGuild(guild);
  }

  console.log("✅ All done. Bot is staying online.");
});

// ─── Login ────────────────────────────────────────────────────────────────────
console.log("Attempting Discord login...");
client.login(TOKEN).then(() => {
  console.log("Login call succeeded.");
}).catch((err) => {
  console.error(`Login FAILED: ${err.message}`);
  process.exit(1);
});
