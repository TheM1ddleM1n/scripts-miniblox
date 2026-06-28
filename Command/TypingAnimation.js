/**
 * Global Title Animation Engine
 * * Broadcasts a string to all online players character-by-character.
 * Includes parsing logic to preserve initial formatting tags across updates
 * while strictly adhering to the server's rate limit of 6 titles per second.
 *
 * @param {string} fullText - The raw message input, including any leading formatting tags.
 */
function typeTitle(fullText) {
  // 1. Extract leading Miniblox formatting tags (e.g., \glow\\bold\) via Regular Expression
  const tagMatch = fullText.match(/^(\\[a-z\\]+)+/i);
  const tags = tagMatch ? tagMatch[0] : "";
  
  // 2. Isolate the target text payload by stripping out the parsed tags
  const cleanText = fullText.substring(tags.length);
  
  let currentLength = 0;

  // 3. Initialize a 4-tick throttle loop (20 ticks / 4 = 5 updates per second)
  // This rate safely maintains execution below the critical 6 titles/sec system quota.
  const timer = game.setInterval(() => {
    if (currentLength >= cleanText.length) {
      clearInterval(timer);
      return;
    }

    currentLength++;
    const displayedText = cleanText.substring(0, currentLength);

    // 4. Prepend the structural formatting tags to prevent client-side style dropping
    // Displays the title globally with a persist duration of 7000 milliseconds.
    game.title(tags + displayedText, 7000); 
  }, 4); 
}

/**
 * Custom Command Registration: /animtitle
 * * Access Control: Administrative privileges required.
 * Syntax: /animtitle @a <message_payload>
 */
game.commands.register("animtitle", { permission: "admin" }, (sender, args) => {
  // Enforce parameter requirements (target selector and minimum text string)
  if (!args || args.length < 2) {
    if (sender) sender.sendMessage("Usage: /animtitle @a <message>");
    return;
  }

  const target = args[0];
  const message = args.slice(1).join(" ");

  // Validate and execute against the global selector target
  if (target === "@a") {
    typeTitle(message);
  } else {
    if (sender) sender.sendMessage("This script only supports the @a target.");
  }
});
