import express from 'express';
import axios, { isAxiosError } from 'axios';
import {db} from './src/config/database';
import cors from 'cors';
import {authroutes} from './src/routes/auth.routes'; 

const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
}));


app.use('/auth', authroutes);

app.listen(port, () => {
    console.log(`Backend listening on ${port}`);
});
