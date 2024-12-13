import express from 'express';
import axios, { isAxiosError } from 'axios';
import cors from 'cors';
import {authroutes} from './src/routes/auth.routes.js';
import {enrollRoutes} from './src/routes/enroll.routes.js'; 

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
app.use('/api', enrollRoutes);

app.listen(port, () => {
    console.log(`Backend listening on ${port}`);
});
