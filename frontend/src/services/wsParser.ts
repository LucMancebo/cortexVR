import { WSMessage } from "../types/ws";

export function parseMessage(raw: string): WSMessage | null {
  if (raw.startsWith("stat:")) {
    const [, ip, level] = raw.split(":");
    return {
      type: "stat",
      ip,
      level: Number(level)
    };
  }

  if (raw.startsWith("clients:")) {
    return {
      type: "clients",
      count: Number(raw.split(":")[1])
    };
  }

  return null;
}
