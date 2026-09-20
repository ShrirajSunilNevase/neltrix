import { assets, history } from "../utils/demoData";

export class MarketDataService {
  async listAssets() {
    return assets;
  }

  async getAsset(symbol: string) {
    return assets.find(a => a.symbol.toLowerCase() === symbol.toLowerCase()) ?? null;
  }

  async getQuote(symbol: string) {
    const asset = await this.getAsset(symbol);
    if (!asset) return null;
    return { ...asset, status: "demo", lastUpdated: new Date().toISOString() };
  }

  async getHistory(symbol: string) {
    return history(symbol);
  }
}
export const marketDataService = new MarketDataService();
