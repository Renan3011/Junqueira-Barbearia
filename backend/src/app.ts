import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { PrismaClient, BookingOrigin, BookingStatus } from "@prisma/client";
import { z } from "zod";
import { dayBounds, weekday } from "./time.js";
import { freeSlots } from "./availability.js";
import { session, signSession } from "./auth.js";
import { normalizePhone } from "./phone.js";

export const prisma = new PrismaClient();
export const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json()); app.use(cookieParser());
const guard = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (await session(req.cookies.session)) next(); else res.status(401).json({ error: "Acesso restrito. FaÃ§a login para continuar." });
};
const slotLabel = (d: Date) => d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
const bookingInput = z.object({ serviceId: z.string(), startsAt: z.string().datetime(), name: z.string().trim().min(2).max(100), phone: z.string().trim().min(8).max(32).refine(value => normalizePhone(value) !== null, "Informe um telefone vÃ¡lido."), note: z.string().trim().max(500).optional() });
const serviceInput = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(500).optional().nullable(), price: z.number().int().nonnegative(), durationMinutes: z.number().int().min(10).max(480) });

async function createBooking(data: z.infer<typeof bookingInput>, origin: BookingOrigin) {
  const start = new Date(data.startsAt);
  const phone = normalizePhone(data.phone);
  if (!phone) throw new Error("Informe um telefone vÃ¡lido.");
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(72341)`;
    const service = await tx.service.findFirst({ where: { id: data.serviceId, active: true } });
    if (!service || Number.isNaN(start.getTime())) throw new Error("O serviÃ§o ou horÃ¡rio selecionado nÃ£o estÃ¡ disponÃ­vel.");
    const localDate = start.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    const hours = await tx.businessHour.findUnique({ where: { weekday: weekday(localDate) } });
    const end = new Date(start.getTime() + service.durationMinutes * 60000);
    const hour = Number(start.toLocaleTimeString("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }));
    const minute = hour * 60 + Number(start.toLocaleTimeString("en-US", { timeZone: "America/Sao_Paulo", minute: "2-digit" }));
    if (!hours?.active || start <= new Date() || minute < hours.openMinute || minute + service.durationMinutes > hours.closeMinute) throw new Error("O horÃ¡rio escolhido estÃ¡ fora do expediente ou nÃ£o estÃ¡ disponÃ­vel.");
    const conflict = await tx.booking.findFirst({ where: { status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }, startsAt: { lt: end }, endsAt: { gt: start } } })
      || await tx.scheduleBlock.findFirst({ where: { startsAt: { lt: end }, endsAt: { gt: start } } });
    if (conflict) throw new Error("Esse horÃ¡rio acabou de ser ocupado. Escolha outro horÃ¡rio.");
    const customer = await tx.customer.upsert({ where: { phone }, update: { name: data.name }, create: { name: data.name, phone } });
    return tx.booking.create({ data: { customerId: customer.id, serviceId: service.id, startsAt: start, endsAt: end, note: data.note, origin } });
  }, { isolationLevel: "Serializable" });
}

app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/api/services", async (_, res) => res.json(await prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } })));
app.get("/api/availability", async (req, res) => {
  const q = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), serviceId: z.string() }).safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: "Confira a data e o serviÃ§o informados." });
  const service = await prisma.service.findFirst({ where: { id: q.data.serviceId, active: true } });
  if (!service) return res.status(404).json({ error: "O serviÃ§o selecionado nÃ£o foi encontrado." });
  const hours = await prisma.businessHour.findUnique({ where: { weekday: weekday(q.data.date) } });
  if (!hours?.active) return res.json({ slots: [] });
  const b = dayBounds(q.data.date);
  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({ where: { status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }, startsAt: { lt: b.end }, endsAt: { gt: b.start } }, select: { startsAt: true, endsAt: true } }),
    prisma.scheduleBlock.findMany({ where: { startsAt: { lt: b.end }, endsAt: { gt: b.start } }, select: { startsAt: true, endsAt: true } })
  ]);
  res.json({ slots: freeSlots(hours.openMinute, hours.closeMinute, service.durationMinutes, q.data.date, [...bookings, ...blocks]).map(startsAt => ({ startsAt: startsAt.toISOString(), label: slotLabel(startsAt) })) });
});
app.post("/api/bookings", async (req, res) => {
  const parsed = bookingInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Confira os dados informados e tente novamente." });
  try { const booking = await createBooking(parsed.data, BookingOrigin.SITE); res.status(201).json({ id: booking.id, status: booking.status }); }
  catch (error) { res.status(409).json({ error: error instanceof Error ? error.message : "NÃ£o foi possÃ­vel criar o agendamento. Tente novamente." }); }
});

app.post("/api/admin/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }), async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Confira o e-mail e a senha informados." });
  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user || !await bcrypt.compare(body.data.password, user.passwordHash)) return res.status(401).json({ error: "E-mail ou senha invÃ¡lidos. Tente novamente." });
  res.cookie("session", await signSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 3600000, path: "/" }).json({ name: user.name });
});
app.post("/api/admin/logout", (_, res) => res.clearCookie("session", { path: "/" }).status(204).end());
app.get("/api/admin/me", guard, (_, res) => res.json({ ok: true }));
app.get("/api/admin/bookings", guard, async (req, res) => {
  const q = z.object({ date: z.string().optional(), from: z.string().optional(), to: z.string().optional() }).safeParse(req.query);
  const from = q.success ? q.data.from || q.data.date : undefined, to = q.success ? q.data.to : undefined;
  const where = from ? { startsAt: { gte: dayBounds(from).start, lt: to ? dayBounds(to).end : dayBounds(from).end } } : {};
  res.json(await prisma.booking.findMany({ where, include: { customer: true, service: true }, orderBy: { startsAt: "asc" }, take: 300 }));
});
app.post("/api/admin/bookings", guard, async (req, res) => {
  const parsed = bookingInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Confira os dados do atendimento e tente novamente." });
  try { res.status(201).json(await createBooking(parsed.data, BookingOrigin.BARBER)); }
  catch (error) { res.status(409).json({ error: error instanceof Error ? error.message : "NÃ£o foi possÃ­vel criar o atendimento. Tente novamente." }); }
});
app.patch("/api/admin/bookings/:id", guard, async (req, res) => {
  const body = z.object({ status: z.nativeEnum(BookingStatus).optional(), note: z.string().max(500).optional(), read: z.boolean().optional() }).safeParse(req.body);
  if (!body.success || !Object.keys(body.data).length) return res.status(400).json({ error: "Nenhuma atualizaÃ§Ã£o vÃ¡lida foi informada." });
  const data: Record<string, unknown> = { ...body.data };
  if (body.data.read) data.readAt = new Date();
  delete data.read;
  res.json(await prisma.booking.update({ where: { id: String(req.params.id) }, data }));
});
app.get("/api/admin/notifications", guard, async (_, res) => {
  const bookings = await prisma.booking.findMany({ where: { origin: BookingOrigin.SITE, status: BookingStatus.PENDING, readAt: null }, include: { customer: true, service: true }, orderBy: { createdAt: "desc" }, take: 20 });
  res.json({ count: bookings.length, bookings });
});
app.get("/api/admin/services", guard, async (_, res) => res.json(await prisma.service.findMany({ orderBy: { name: "asc" } })));
app.post("/api/admin/services", guard, async (req, res) => {
  const body = serviceInput.safeParse(req.body); if (!body.success) return res.status(400).json({ error: "Confira os dados do serviÃ§o e tente novamente." });
  res.status(201).json(await prisma.service.create({ data: body.data }));
});
app.patch("/api/admin/services/:id", guard, async (req, res) => {
  const body = serviceInput.partial().extend({ active: z.boolean().optional() }).safeParse(req.body);
  if (!body.success || !Object.keys(body.data).length) return res.status(400).json({ error: "Confira os dados do serviÃ§o e tente novamente." });
  res.json(await prisma.service.update({ where: { id: String(req.params.id) }, data: body.data }));
});
app.get("/api/admin/hours", guard, async (_, res) => res.json(await prisma.businessHour.findMany({ orderBy: { weekday: "asc" } })));
app.put("/api/admin/hours/:weekday", guard, async (req, res) => {
  const body = z.object({ openMinute: z.number().int().min(0), closeMinute: z.number().int().max(1440), active: z.boolean() }).refine(x => x.closeMinute > x.openMinute).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Informe um horÃ¡rio de funcionamento vÃ¡lido." });
  res.json(await prisma.businessHour.upsert({ where: { weekday: Number(req.params.weekday) }, update: body.data, create: { weekday: Number(req.params.weekday), ...body.data } }));
});
app.get("/api/admin/blocks", guard, async (_, res) => res.json(await prisma.scheduleBlock.findMany({ orderBy: { startsAt: "asc" } })));
app.post("/api/admin/blocks", guard, async (req, res) => {
  const body = z.object({ startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().max(200).optional() }).safeParse(req.body);
  if (!body.success || new Date(body.data.endsAt) <= new Date(body.data.startsAt)) return res.status(400).json({ error: "Confira o perÃ­odo do bloqueio e tente novamente." });
  res.status(201).json(await prisma.scheduleBlock.create({ data: { ...body.data, startsAt: new Date(body.data.startsAt), endsAt: new Date(body.data.endsAt) } }));
});
