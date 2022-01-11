import { log } from "./flavoredLogger";
import RichPresence, { RP } from "discord-rich-presence";
import config from "./assets/config.json";

export function startIpcClient(): RP {
  log(
    "Attempting to start a Discord IPC client using client ID: " +
      config.discord_client_id
  );
  var discordClient: RP = RichPresence(config.discord_client_id);

  discordClient.on("connected", () => {
    log("Discord IPC client connected.");
  });

  discordClient.on("error", (err: string) => {
    log("Discord IPC client error: " + err);
  });

  return discordClient;
}
