import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json()); // parse the incoming request as data
app.use(cors()); //
app.use(helmet()); // security middleware that sets HTTP headers
app.use(morgan('dev'));

app.get('/', (req, res) => {
  return res.send("Hello World");
})

app.get('/test', (req, res) => {
  return res.send("Hello World from tes");
})

app.listen(PORT, () => {
  console.log("Listening to PORT:", PORT);
})