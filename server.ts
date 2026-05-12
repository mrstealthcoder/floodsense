import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DISTRICTS = {
  // Sylhet Division
  sylhet: { lat: 24.8949, lon: 91.8687, name: "Sylhet" },
  sunamganj: { lat: 25.0664, lon: 91.4045, name: "Sunamganj" },
  habiganj: { lat: 24.3840, lon: 91.4168, name: "Habiganj" },
  moulvibazar: { lat: 24.4820, lon: 91.7506, name: "Moulvibazar" },
  // Rangpur Division
  kurigram: { lat: 25.8072, lon: 89.6295, name: "Kurigram" },
  gaibandha: { lat: 25.3297, lon: 89.5430, name: "Gaibandha" },
  rangpur: { lat: 25.7439, lon: 89.2752, name: "Rangpur" },
  dinajpur: { lat: 25.6217, lon: 88.6354, name: "Dinajpur" },
  panchagarh: { lat: 26.3411, lon: 88.5542, name: "Panchagarh" },
  thakurgaon: { lat: 26.0336, lon: 88.4616, name: "Thakurgaon" },
  nilphamari: { lat: 25.9317, lon: 88.8544, name: "Nilphamari" },
  lalmonirhat: { lat: 25.9165, lon: 89.4471, name: "Lalmonirhat" },
  // Rajshahi Division
  bogura: { lat: 24.8481, lon: 89.3730, name: "Bogura" },
  rajshahi: { lat: 24.3745, lon: 88.6042, name: "Rajshahi" },
  pabna: { lat: 24.0062, lon: 89.2494, name: "Pabna" },
  sirajganj: { lat: 24.4534, lon: 89.7080, name: "Sirajganj" },
  naogaon: { lat: 24.7936, lon: 88.9405, name: "Naogaon" },
  natore: { lat: 24.4102, lon: 88.9749, name: "Natore" },
  joypurhat: { lat: 25.1017, lon: 89.0270, name: "Joypurhat" },
  chapainawabganj: { lat: 24.5965, lon: 88.2707, name: "Chapai Nawabganj" },
  // Mymensingh Division
  mymensingh: { lat: 24.7471, lon: 90.4203, name: "Mymensingh" },
  jamalpur: { lat: 24.9197, lon: 89.9481, name: "Jamalpur" },
  netrokona: { lat: 24.8704, lon: 90.7258, name: "Netrokona" },
  sherpur: { lat: 25.0134, lon: 90.0161, name: "Sherpur" },
  // Dhaka Division
  dhaka: { lat: 23.8103, lon: 90.4125, name: "Dhaka" },
  gazipur: { lat: 24.0023, lon: 90.4264, name: "Gazipur" },
  narayanganj: { lat: 23.6238, lon: 90.5000, name: "Narayanganj" },
  tangail: { lat: 24.2513, lon: 89.9167, name: "Tangail" },
  manikganj: { lat: 23.8617, lon: 89.9917, name: "Manikganj" },
  munshiganj: { lat: 23.5422, lon: 90.5305, name: "Munshiganj" },
  narsingdi: { lat: 23.9193, lon: 90.7176, name: "Narsingdi" },
  faridpur: { lat: 23.6071, lon: 89.8429, name: "Faridpur" },
  gopalganj: { lat: 23.0050, lon: 89.8267, name: "Gopalganj" },
  kishoreganj: { lat: 24.4320, lon: 90.7816, name: "Kishoreganj" },
  madaripur: { lat: 23.1648, lon: 90.1834, name: "Madaripur" },
  rajbari: { lat: 23.7574, lon: 89.6476, name: "Rajbari" },
  shariatpur: { lat: 23.2123, lon: 90.3524, name: "Shariatpur" },
  // Khulna Division
  khulna: { lat: 22.8456, lon: 89.5403, name: "Khulna" },
  jessore: { lat: 23.1664, lon: 89.2081, name: "Jessore" },
  satkhira: { lat: 22.7185, lon: 89.0705, name: "Satkhira" },
  bagerhat: { lat: 22.6516, lon: 89.7859, name: "Bagerhat" },
  kushtia: { lat: 23.9013, lon: 89.1205, name: "Kushtia" },
  chuadanga: { lat: 23.6401, lon: 88.8475, name: "Chuadanga" },
  jhenaidah: { lat: 23.5450, lon: 89.1726, name: "Jhenaidah" },
  magura: { lat: 23.4875, lon: 89.4199, name: "Magura" },
  meherpur: { lat: 23.7622, lon: 88.6318, name: "Meherpur" },
  narail: { lat: 23.1725, lon: 89.5126, name: "Narail" },
  // Barisal Division
  barisal: { lat: 22.7010, lon: 90.3535, name: "Barisal" },
  bhola: { lat: 22.6859, lon: 90.6440, name: "Bhola" },
  patuakhali: { lat: 22.3596, lon: 90.3349, name: "Patuakhali" },
  pirojpur: { lat: 22.5781, lon: 89.9696, name: "Pirojpur" },
  barguna: { lat: 22.1558, lon: 90.0121, name: "Barguna" },
  jhalokati: { lat: 22.6423, lon: 90.1983, name: "Jhalokati" },
  // Chittagong Division
  chittagong: { lat: 22.3569, lon: 91.7832, name: "Chittagong" },
  comilla: { lat: 23.4607, lon: 91.1809, name: "Comilla" },
  coxsbazar: { lat: 21.4272, lon: 92.0058, name: "Cox's Bazar" },
  noakhali: { lat: 22.8698, lon: 91.0991, name: "Noakhali" },
  feni: { lat: 23.0159, lon: 91.3976, name: "Feni" },
  brahmanbaria: { lat: 23.9571, lon: 91.1158, name: "Brahmanbaria" },
  chandpur: { lat: 23.2321, lon: 90.6631, name: "Chandpur" },
  lakshmipur: { lat: 22.9429, lon: 90.8417, name: "Lakshmipur" },
  rangamati: { lat: 22.7324, lon: 92.2985, name: "Rangamati" },
  khagrachhari: { lat: 23.1192, lon: 91.9841, name: "Khagrachhari" },
  bandarban: { lat: 22.1953, lon: 92.2184, name: "Bandarban" },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint: Get District Data for Analysis
  app.post("/api/district-data", async (req, res) => {
    const { districtKey } = req.body;
    const district = DISTRICTS[districtKey as keyof typeof DISTRICTS];

    if (!district) {
      return res.status(400).json({ error: "Invalid district selected" });
    }

    try {
      // 1. Fetch NASA EONET Flood Events
      // Using a larger window for EONET (v3)
      const eonetUrl = `https://eonet.gsfc.nasa.gov/api/v3/events?category=floods&status=all&limit=200`;
      const eonetResponse = await axios.get(eonetUrl, { timeout: 10000 });
      const eonetData = eonetResponse.data;

      // Filter events by proximity to district
      const nearbyEvents = (eonetData.events || []).filter((event: any) => {
        const geometries = event.geometry || [];
        return geometries.some((geo: any) => {
          const coords = geo.coordinates;
          if (!coords || coords.length < 2) return false;
          // EONET usually uses [lon, lat]
          const [lon, lat] = coords;
          const dist = Math.sqrt(Math.pow(lat - district.lat, 2) + Math.pow(lon - district.lon, 2));
          return dist < 3.0; // Increased radius to 3 degrees (~330km) for historical context
        });
      }).map((e: any) => ({
        title: e.title,
        date: e.geometry?.[0]?.date,
        link: e.link
      }));

      // 2. Fetch NASA POWER Rainfall Data (Daily for last 30 days)
      const now = new Date();
      const endDate = now.toISOString().split("T")[0].replace(/-/g, "");
      const startDateDate = new Date();
      startDateDate.setDate(now.getDate() - 30);
      const startDate = startDateDate.toISOString().split("T")[0].replace(/-/g, "");

      const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=SB&longitude=${district.lon}&latitude=${district.lat}&start=${startDate}&end=${endDate}&format=JSON`;
      const powerResponse = await axios.get(powerUrl, { timeout: 10000 });
      const powerData = powerResponse.data;

      const rainfallParams = powerData.properties?.parameter?.PRECTOTCORR || {};
      const rainfallValues = Object.values(rainfallParams) as number[];
      
      // Calculate derived metrics
      const totalRainfall = rainfallValues.reduce((a, b) => a + b, 0);
      const avgRainfall = rainfallValues.length > 0 ? totalRainfall / rainfallValues.length : 0;
      const maxRainfall = rainfallValues.length > 0 ? Math.max(...rainfallValues) : 0;
      const precipitation24h = rainfallValues.length > 0 ? rainfallValues[rainfallValues.length - 1] : 0;

      // Return data for Gemini analysis
      res.json({
        district,
        context: {
          nearbyEvents,
          nearbyEventsCount: nearbyEvents.length,
          totalRainfall,
          avgRainfall,
          maxRainfall,
          precipitation24h,
          rainfallHistory: rainfallValues.slice(-7) // Last 7 days trend
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Data fetching error:", error.message);
      res.status(500).json({ 
        error: "Failed to fetch district data from NASA sources",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

