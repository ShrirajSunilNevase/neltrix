import { Router } from "express";
import { marketDataService } from "../services/marketData.service";
import { analyzeWithAI } from "../services/ai.service";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "neltrix-api" }));

router.get("/assets", async (_req, res) => res.json(await marketDataService.listAssets()));

router.get("/assets/:symbol", async (req, res) => {
  const asset = await marketDataService.getAsset(req.params.symbol);
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json(asset);
});

router.get("/market/:symbol", async (req, res) => {
  const quote = await marketDataService.getQuote(req.params.symbol);
  if (!quote) return res.status(404).json({ error: "Asset not found" });
  res.json(quote);
});

router.get("/market/:symbol/history", async (req, res) => {
  res.json(await marketDataService.getHistory(req.params.symbol));
});

router.post("/ai/analyze", async (req, res) => {
  const { prompt = "Summarize the current market context.", context = {} } = req.body ?? {};
  res.json(await analyzeWithAI(prompt, context));
});

router.post("/ai/chat", async (req, res) => {
  const { message = "", context = {} } = req.body ?? {};
  res.json(await analyzeWithAI(message, context));
});

export default router;
