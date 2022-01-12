import { log, logCat } from "./flavoredLogger";
import RichPresence, { RP } from "discord-rich-presence";
import config from "../assets/config.json";

/**
 * Produces a Discord RP client and notifies upon connections and errors.
 * @returns The newly-created Discord RP client, to be used elsewhere.
 */
export function createDiscordClient(): RP {
  logCat(
    "DiscordIPC",
    "Attempting to start using ID: " + config.discord_client_id
  );

  var discordClient: RP = RichPresence(config.discord_client_id);

  discordClient.on("connected", () => {
    logCat("DiscordIPC", "Client connected.");
  });

  discordClient.on("error", (err: string) => {
    logCat("DiscordIPC", "Client error: " + err);
  });

  return discordClient;
}
