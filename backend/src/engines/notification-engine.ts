import { AppConfig } from "./config-engine";
import { prisma } from "../lib/prisma";

export async function emitConfiguredNotification(
  userId: string,
  config: AppConfig,
  event: "record.created" | "record.updated" | "csv.imported"
) {
  const rule = config.notifications.find((item) => item.event === event);
  if (!rule) return;

  await prisma.notification.create({
    data: {
      userId,
      type: event,
      message: rule.message
    }
  });
}
