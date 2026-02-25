import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/api/report", upload.single("image"), async (req, res) => {
  const report = new Report({
    name: req.body.name,
    image: req.file.filename
  });

  await report.save();
  res.json({ message: "Submitted" });
});

app.get("/api/reports", async (req, res) => {
  const reports = await Report.find({ status: "approved" });
  res.json(reports);
});

app.get("/api/admin/pending", async (req, res) => {
  const reports = await Report.find({ status: "pending" });
  res.json(reports);
});

app.post("/api/admin/approve/:id", async (req, res) => {
  await Report.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Approved" });
});

app.listen(process.env.PORT, () => {
  console.log("Server running");
});
