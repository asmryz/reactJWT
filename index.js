import express from 'express'
import JWT from 'jsonwebtoken'
import { config } from 'dotenv'
import cors from 'cors'
const app = express();
const PORT = process.env.PORT || 5000;
config();

app.use(express.json())
app.use(cors());
const users = [
    {
        id: "1",
        username: "Smith",
        password: "111",
    },
    {
        id: "2",
        username: "Peter",
        password: "222",
    },
]

const auth = (req, res, next) => {
    const authHeaders = req.headers.authorization
    const accesToken = authHeaders && authHeaders.split(' ')[1];
    if (!accesToken) return res.sendStatus(401);

    JWT.verify(accesToken, process.env.SECRET_ACCESS_TOKEN, (err, payload) => {
        if (err) return res.sendStatus(403);

        req.user = payload;
        next();
    });
}

app.get('/list', auth, (req, res) => {
    res.json(users.find(u => u.username === req.user.username));
})

const generateAccessToken = (user) => {
    return JWT.sign(user, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: "10s",
    });
};

const generateRefreshToken = (user) => {
    return JWT.sign(user, process.env.SECRET_REFRESH_TOKEN);
};


let refreshTokens = [];

app.post('/refresh', (req, res) => {
    console.log(req.body)
    const refreshToken = req.body.token
    
    if (refreshToken == null) return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json("Refresh token is not valid!");
    
    JWT.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
        if (err) return res.status(403).json("Refresh token is expired!");
        refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
        delete user.iat;

        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)
        refreshTokens.push(newRefreshToken);

        res.json({ user, accessToken: newAccessToken, refreshToken: newRefreshToken })
    })

})

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === req.body.username);
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken);

    res.json({ user, accessToken, refreshToken })
})

app.listen(PORT, () => console.log(`Server is listening on http://localhost:${PORT}`));
