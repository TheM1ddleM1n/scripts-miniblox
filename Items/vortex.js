game.on("projectileHit", (e) => {
  if (e.projectile && e.projectile.type === "snowball") {
    const center = e.pos;
    if (!center) return;

    // Sound and visual cues at the singularity point
    game.world.playSound("portal.travel", center.x, center.y, center.z);
    game.broadcast("🌌 A Pocket Black Hole has opened!");

    let currentTick = 0;

    const vortexLoop = game.setInterval(() => {
      if (currentTick >= 20) { // Increased to 20 ticks (1 full second) to ensure complete pull
        clearInterval(vortexLoop);
        return;
      }

      // Throttled particle visuals to prevent quota crash
      if (currentTick % 5 === 0) {
        game.world.spawnParticles("portal", center.x, center.y + 1, center.z, 4, 0.5);
        game.world.spawnParticles("enchantmenttable", center.x, center.y + 0.5, center.z, 2, 0.2);
      }

      // Track the shooter or look up the specific player to pull them
      // Since we want this to act on the player directly, we fetch the active user
      // Replace "Name" with the player context if using a last-shooter tracker, 
      // or check the player directly:
      const player = game.getPlayer(" "); // Replace with name

      if (player) {
        const livePos = player.pos;

        if (livePos) {
          const dx = center.x - livePos.x;
          const dy = (center.y + 0.5) - livePos.y;
          const dz = center.z - livePos.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance <= 10 && distance > 0.5) {
            const pullFactor = 0.5; 
            const nextX = livePos.x + (dx / distance) * pullFactor;
            const nextY = livePos.y + (dy / distance) * pullFactor;
            const nextZ = livePos.z + (dz / distance) * pullFactor;

            player.teleport(nextX, nextY, nextZ);
          }
        }
      }

      currentTick++;
    }, 1);
  }
});

game.commands.register("vortex", { permission: "admin" }, (sender, args) => {
  const p = game.getPlayer(sender.name);
  if (p) {
    p.give("snowball", 16);
    p.sendMessage("🌌 Vortex Grenades equipped!");
  }
});
