import axios from "axios";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

function App() {
    const [user, setUser] = useState({});

    const refreshToken = async () => {
        try {
            const res = await axios.post("/api/refresh", {
                token: user.refreshToken,
            });
            const { accessToken, refreshToken } = res.data;
            setUser({ ...user, accessToken, refreshToken });
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${accessToken}`;
            setUser({
                ...user,
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
            });
            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(
        async (config) => {
            let currentDate = new Date();
            const decodedToken = jwtDecode(user.accessToken);
            if (decodedToken.exp! * 1000 < currentDate.getTime()) {
                const data = await refreshToken();
                setUser({
                    ...user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                });
                axiosJWT.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${data.accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    const handleList = async () => {
        try {
            const response = (await axiosJWT.get("/api/list")).data;
            //setUser(response);
            console.log(response);
        } catch (error) {
            //console.log(error);
        }
    };

    const handleLogin = async () => {
        try {
            const res = await axios.post("/api/login", {
                username: "Smith",
                password: "111",
            });
            const { user, accessToken, refreshToken } = res.data;
            setUser({ ...user, accessToken, refreshToken });
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${accessToken}`;
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div>
                <button onClick={handleLogin}>Login</button>
            </div>
            <div>
                <button onClick={handleList}>List</button>
            </div>
            {
				<div style={{textAlign: "left", width: '400px', overflowWrap: 'break-word', fontFamily: 'monospace' }}>
                    {JSON.stringify(user, null, 4)}
				</div>
            }
        </>
    );
}

export default App;
