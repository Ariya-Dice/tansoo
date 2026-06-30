import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStorageMode,
  verifyDatabaseConnection,
  bulkAdjustPrices,
} from "./lib/productsRepository.js";
import { isProductsWriteAuthorized, sendUnauthorized } from "./lib/apiAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const IMAGES_DIR = path.join(__dirname, "db/product-images");
const DIST_DIR = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 4020;
const HOST = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured");
} else {
  console.warn("⚠️ Cloudinary not configured — images saved in db/product-images");
}

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const app = express();
app.disable("x-powered-by");

if (isProduction) {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/product-images", express.static(IMAGES_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".png";
    cb(null, "prod-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

async function handleImageUpload(req, res) {
  try {
    if (req.body?.file) {
      const base64Data = String(req.body.file).replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = req.body.filename || `prod-${Date.now()}.png`;
      const filepath = path.join(IMAGES_DIR, filename);
      fs.writeFileSync(filepath, buffer);

      if (isCloudinaryConfigured) {
        const result = await cloudinary.uploader.upload(filepath, { folder: "products" });
        fs.unlinkSync(filepath);
        return res.json({ filename: result.original_filename, url: result.secure_url });
      }
      return res.json({ filename, url: filename });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      fs.unlinkSync(req.file.path);
      return res.json({ filename: result.original_filename, url: result.secure_url });
    }

    const filename = path.basename(req.file.path);
    res.json({ filename, url: filename });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    const status = await verifyDatabaseConnection();
    res.json({
      ok: true,
      mode: getStorageMode(),
      productCount: status.productCount ?? null,
    });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await getAllProducts();
    res.setHeader("X-Storage-Mode", getStorageMode());
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);
  try {
    const newProduct = await createProduct(req.body);
    res.setHeader("X-Storage-Mode", getStorageMode());
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products", async (req, res) => {
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);
  try {
    const id = parseInt(req.query.id, 10);
    if (!id) return res.status(400).json({ error: "Product ID is required" });
    const updated = await updateProduct(id, req.body);
    res.setHeader("X-Storage-Mode", getStorageMode());
    res.json(updated);
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.delete("/api/products", async (req, res) => {
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);
  try {
    const id = parseInt(req.query.id, 10);
    if (!id) return res.status(400).json({ error: "Product ID is required" });
    await deleteProduct(id);
    res.json({ success: true });
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.post("/api/products/bulk-price", async (req, res) => {
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);
  try {
    const { percent, goodsType } = req.body ?? {};
    const result = await bulkAdjustPrices(percent, { goodsType });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upload-image", (req, res, next) => {
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);
  if (req.is("multipart/form-data")) {
    return upload.single("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      handleImageUpload(req, res);
    });
  }
  next();
}, handleImageUpload);

if (isProduction) {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("❌ پوشه dist/ یافت نشد. ابتدا اجرا کنید: npm run build");
    process.exit(1);
  }
  app.use(express.static(DIST_DIR, { index: false, maxAge: "7d" }));
  app.get(/^(?!\/api|\/product-images).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, HOST, async () => {
  const url = `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`;
  console.log(`✅ Server: ${url}${isProduction ? " (production)" : ""}`);
  console.log(`   API: ${url}/api/products`);
  try {
    const status = await verifyDatabaseConnection();
    console.log(`📦 Database: ${getStorageMode()} (${status.productCount ?? 0} products)`);
  } catch (err) {
    console.error(`❌ Database: ${err.message}`);
  }
});
