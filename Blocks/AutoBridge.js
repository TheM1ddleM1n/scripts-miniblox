// Configuration
let commandBridgeTimer = null;
const BRIDGE_ITEM = "oak_planks"; 

// Register the custom command
game.commands.register("bridge", { permission: "player" }, (sender, args) => {
    // If the loop is already running, turn it off (Toggle functionality)
    if (commandBridgeTimer) {
        clearInterval(commandBridgeTimer);
        commandBridgeTimer = null;
        sender.sendMessage("Auto-Bridge DEACTIVATED.");
        return;
    }

    // Safety check: Ensure the player has at least one block to start
    if (sender.countItem(BRIDGE_ITEM) <= 0) {
        sender.sendMessage(`You need ${BRIDGE_ITEM} in your inventory to start bridging!`);
        return;
    }

    sender.sendMessage("Auto-Bridge ACTIVATED! Walk over an edge to start building.");

    // Start high-speed server loop (20 times per second)
    commandBridgeTimer = game.setInterval(() => {
        // Keep tracking the player's live session data
        const p = game.getPlayer(sender.name);
        if (!p) {
            clearInterval(commandBridgeTimer);
            commandBridgeTimer = null;
            return;
        }

        const pos = p.pos;
        if (!pos) return;

        // Calculate block coordinates directly underneath the feet
        const bx = Math.floor(pos.x);
        const by = Math.floor(pos.y) - 1;
        const bz = Math.floor(pos.z);

        // Scan the block space below the player
        const currentBlock = game.world.getBlock(bx, by, bz);

        // Take over and place a block instantly if stepping out onto air
        if (currentBlock === "air" || currentBlock === null) {
            
            if (p.countItem(BRIDGE_ITEM) > 0) {
                // Remove material from inventory
                p.removeItem(BRIDGE_ITEM, 1);
                
                // Place block into the world
                game.world.setBlock(bx, by, bz, BRIDGE_ITEM);
                
                // Play placement sound effect
                game.world.playSound("use.wood", bx, by, bz);
            } else {
                // Out of blocks, shut down automatically
                p.sendMessage("Auto-Bridge deactivated: Out of blocks.");
                clearInterval(commandBridgeTimer);
                commandBridgeTimer = null;
            }
        }
    }, 1); // Runs every server tick
});

// Clean up loop on world save or script reload
game.on("worldSave", () => {
    if (commandBridgeTimer) {
        clearInterval(commandBridgeTimer);
        commandBridgeTimer = null;
    }
});
