import express from 'express';
import axios, { isAxiosError } from 'axios';
import mysql from 'mysql2';

const app = express();
const port = 3000;

// app.use(cors());

const db  = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
    port: 5222,
});

app.get('/loginSubmit', async (req, res) => {
    const details = {
        UserID: 1,
        UserFullName: 'Sreyan Dey',
        UserEmail: 'sd@email.com',
        UserPassword: 'testpass',
        UserType: 'Attendee',
        CreatedAt: null,
        UpdatedAt: null
    }; //The login details enter in the frontend is a object

    // console.log(details.userName);

    const qData = await db.promise().query("SELECT * FROM `user` WHERE UserFullName = ?", [details.UserFullName]);
    let userID;
    qData[0].forEach(element => {
        userID = element.UserID
    });
    console.log(userID);

    let isAuthenticated = false;
    if (JSON.stringify(details) === JSON.stringify(qData[0][userID - 1])) {
        isAuthenticated = true;
    };

    isAuthenticated ? console.log('Login successful') : console.log('Login credentials wrong');
});



app.listen(port, () => {
    console.log(`Backend listening on ${port}`);
});