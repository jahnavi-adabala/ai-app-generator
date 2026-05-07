import csv from "csv-parser";
import { Router } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { Readable } from "stream";
import {
  parseAppConfig,
  slugify,
  validateRecord,
  AppConfig
} from "../engines/config-engine";
import { emitConfiguredNotification } from "../engines/notification-engine";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const apps = await prisma.app.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { records: true } } }
    });
    res.json(apps);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const config = parseAppConfig(req.body.config);
    const baseSlug = slugify(config.name);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const app = await prisma.app.create({
      data: {
        name: config.name,
        slug,
        config,
        userId: req.user!.id
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        type: "app.created",
        message: `${config.name} was generated successfully.`
      }
    });

    res.status(201).json(app);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const appId = String(req.params.id);
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: req.user!.id },
      include: { records: { orderBy: { createdAt: "desc" } } }
    });
    if (!app) return res.status(404).json({ message: "App not found" });
    res.json(app);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/records", async (req: AuthRequest, res, next) => {
  try {
    const appId = String(req.params.id);
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: req.user!.id }
    });
    if (!app) return res.status(404).json({ message: "App not found" });

    const config = parseAppConfig(app.config) as AppConfig;
    const data = validateRecord(config, req.body.data || {});

    const record = await prisma.record.create({
      data: { appId: app.id, data: data as Prisma.InputJsonValue }
    });
    await emitConfiguredNotification(req.user!.id, config, "record.created");

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/records/:recordId", async (req: AuthRequest, res, next) => {
  try {
    const appId = String(req.params.id);
    const recordId = String(req.params.recordId);
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: req.user!.id }
    });
    if (!app) return res.status(404).json({ message: "App not found" });

    const config = parseAppConfig(app.config) as AppConfig;
    const data = validateRecord(config, req.body.data || {});
    const record = await prisma.record.update({
      where: { id: recordId },
      data: { data: data as Prisma.InputJsonValue }
    });
    await emitConfiguredNotification(req.user!.id, config, "record.updated");

    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/import-csv", upload.single("file"), async (req: AuthRequest, res, next) => {
  try {
    const appId = String(req.params.id);
    const app = await prisma.app.findFirst({
      where: { id: appId, userId: req.user!.id }
    });
    if (!app) return res.status(404).json({ message: "App not found" });
    if (!req.file) return res.status(400).json({ message: "CSV file is required" });

    const config = parseAppConfig(app.config) as AppConfig;
    const rows: Record<string, unknown>[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(req.file!.buffer)
        .pipe(csv())
        .on("data", (row) => rows.push(validateRecord(config, row)))
        .on("end", resolve)
        .on("error", reject);
    });

    await prisma.record.createMany({
      data: rows.map((row) => ({ appId: app.id, data: row as Prisma.InputJsonValue }))
    });
    await emitConfiguredNotification(req.user!.id, config, "csv.imported");

    res.status(201).json({ imported: rows.length });
  } catch (error) {
    next(error);
  }
});

export default router;
