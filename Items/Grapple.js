// Track the name of the last player who fired a bow
let lastShooterName = null;

// --- ADJUSTED FOR A SLOWER, SMOOTHER GLIDE ---
const PULL_STEPS = 12;     // Increased from 5 to 12 for a longer, gentler pull duration
const TICK_INTERVAL = 1;   // Still updates every tick to maintain smoothness
// ---------------------------------------------

// 1. Capture the shooter when they fire
game.on("entityShootBow", (e) => {
  if (e.player) {
    lastShooterName = e.player.name;
  }
});

// 2. Process the grapple when the arrow lands
game.on("projectileHit", (e) => {
  if (e.projectile && e.projectile.type === "arrow") {
    
    if (lastShooterName) {
      const player = game.getPlayer(lastShooterName);

      if (player) {
        const targetPos = e.pos;
        if (targetPos) {
          
          // Broadcast a fun message to the whole planet!
          game.broadcast(`🪝 ${player.name} launched a grappling hook!`);
          
          // Play audio and visual cues at the impact point
          game.world.playSound("random.bowhit", targetPos.x, targetPos.y, targetPos.z);
          game.world.spawnParticles("happyVillager", targetPos.x, targetPos.y + 1, targetPos.z, 12, 0.5);

          let currentStep = 0;

          const pullTimer = game.setInterval(() => {
            // Re-verify player is still online during the pull sequence
            const p = game.getPlayer(player.name);
            if (!p || currentStep >= PULL_STEPS) {
              clearInterval(pullTimer);
              return;
            }

            const currentPos = p.pos; // { x, y, z }
            
            // Calculate the remaining distance to the target (safely 1 block up)
            const dx = targetPos.x - currentPos.x;
            const dy = (targetPos.y + 1) - currentPos.y;
            const dz = targetPos.z - currentPos.z;

            // Determine how many steps are left in this pull sequence
            const stepsLeft = PULL_STEPS - currentStep;

            // Calculate the incremental smooth step toward the target
            const nextX = currentPos.x + (dx / stepsLeft);
            const nextY = currentPos.y + (dy / stepsLeft);
            const nextZ = currentPos.z + (dz / stepsLeft);

            // Move the player incrementally closer
            p.teleport(nextX, nextY, nextZ);

            // Leave a trailing particle path behind the flying player
            game.world.spawnParticles("crit", currentPos.x, currentPos.y + 0.5, currentPos.z, 2, 0.1);

            currentStep++;
          }, TICK_INTERVAL);

        }
      }
      
      // Reset tracker so it doesn't accidentally trigger twice
      lastShooterName = null;
    }
  }
});

// Admin item distributor command
game.commands.register("grapplebow", { permission: "player" }, (sender, args) => {
  const p = game.getPlayer(sender.name);
  if (p) {
    p.give("bow", 1);
    p.give("arrow", 64);
    p.sendMessage("🏹 Grappling Bow equipped!");
  }
});
