game.on("playerJoin", (e) => {
  if (e.player) {
    e.player.sendMessage("\\yellow\\Welcome, " + e.player.name + "!");
  }
});
