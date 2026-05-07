import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 30
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", async (req: AuthRequest, res, next) => {
  try {
    const notificationId = String(req.params.id);
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

export default router;
