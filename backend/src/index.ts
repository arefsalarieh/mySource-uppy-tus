import 'dotenv/config'
import express from "express";
import cors from "cors";
import { fileRoutes } from "./routes/fileRoutes";
import { authRoutes } from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/file' , fileRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
