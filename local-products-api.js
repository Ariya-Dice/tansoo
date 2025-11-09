import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== CONFIG ====
const DB_PATH = path.join(__dirname, "db/products.json");
const IMAGES_DIR = path.join(__dirname, "db/product-images");
const PORT = 4020;

// ==== CLOUDINARY CONFIG ====
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
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️ Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file");
  console.warn("⚠️ Image uploads will fail without Cloudinary configuration");
}

// ==== INITIAL SETUP ====
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, "[]", "utf8");
}
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ==== APP ====
const app = express();
app.use(cors());
app.use(express.json()); // ✅ مهم برای خواندن req.body
app.use("/product-images", express.static(IMAGES_DIR));

// ==== HELPERS ====
function readProducts() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("❌ Error reading DB:", err);
    return [];
  }
}

function writeProducts(products) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), "utf8");
    console.log("✅ Products saved to DB:", products.length, "items");
  } catch (err) {
    console.error("❌ Error writing DB:", err);
  }
}

// ==== MULTER CONFIG ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".png";
    cb(null, "prod-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// ==== ROUTES ====

// GET all products
app.get("/products", (req, res) => {
  console.log("📋 GET /products - Fetching products");
  const products = readProducts();
  res.json(products);
});

// POST new product
app.post("/products", (req, res) => {
  console.log("➕ POST /products - Adding product:", req.body.name);
  const products = readProducts();
  const newProduct = req.body;
  newProduct.id =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

// PUT (update) product
app.put("/products/:id", (req, res) => {
  console.log("✏️ PUT /products/" + req.params.id + " - Updating product");
  const products = readProducts();
  const productId = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === productId);

  if (index === -1)
    return res.status(404).json({ error: "Product not found" });

  products[index] = { ...products[index], ...req.body, id: productId };
  writeProducts(products);
  res.json(products[index]);
});

// DELETE product
app.delete("/products/:id", (req, res) => {
  console.log("🗑️ DELETE /products/" + req.params.id + " - Deleting product");
  let products = readProducts();
  const productId = parseInt(req.params.id, 10);
  const countBefore = products.length;
  products = products.filter((p) => p.id !== productId);

  if (products.length === countBefore)
    return res.status(404).json({ error: "Product not found" });

  writeProducts(products);
  res.json({ success: true });
});

// ==== IMAGE UPLOAD ====
app.post("/upload-image", upload.single("image"), async (req, res) => {
  console.log("🖼️ POST /upload-image - Uploading image");
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // بررسی تنظیمات Cloudinary
    if (!isCloudinaryConfigured) {
      // اگر Cloudinary تنظیم نشده باشد، URL محلی را برمی‌گردانیم
      const filename = path.basename(req.file.path);
      console.log("⚠️ Cloudinary not configured, using local file:", filename);
      res.json({
        filename: filename,
        url: filename, // نام فایل محلی
      });
      return;
    }

    // آپلود به Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products", // پوشه در Cloudinary
    });

    // بعد از آپلود، فایل محلی را پاک می‌کنیم
    fs.unlinkSync(req.file.path);

    console.log("✅ Image uploaded to Cloudinary:", result.secure_url);
    res.json({
      filename: result.original_filename,
      url: result.secure_url, // لینک تصویر روی Cloudinary
    });
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    // در صورت خطا، فایل محلی را پاک می‌کنیم
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: "Upload failed",
      message: isCloudinaryConfigured 
        ? "Cloudinary upload failed. Check your configuration." 
        : "Cloudinary is not configured. Please set up your .env file."
    });
  }
});

// ==== SERVER START ====
app.listen(PORT, () => {
  console.log(`✅ Local products API running at: http://localhost:${PORT}`);
  console.log(`📁 DB Path: ${DB_PATH}`);
  console.log(`🖼️ Images Path: ${IMAGES_DIR}`);
});