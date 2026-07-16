import 'dotenv/config'
import express from "express";
import cors from "cors";
import { fileRoutes } from "./routes/fileRoutes";

const app = express();

app.use(cors());

app.use('/api/file' , fileRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
