import { useEffect, useState } from "react";

import "./App.css";
import { api } from "./api/api";

function App() {
	const [user, setUser] = useState({});
	const [data, setData] = useState({});

	const handleLogin = () => {
		api.post(`/api/login`, {
			username: "Smith",
			password: "111",
		}).then((response) => {
			console.log(response.data);
			const { user, accessToken, refreshToken } = response.data;
			setUser({ ...user, accessToken, refreshToken });
			api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
		});
	};

	const handleList = async () => {
		const user = (await api.get(`/api/list`)).data;
		setData(user);
	};

	// useEffect(() => {
	// }, []);

	return (
		<>
			<div>
				<button onClick={handleLogin}>Login</button>
			</div>
			<div>
				<button onClick={async () => console.log((await api.get(`/api/list`)).data)}>List</button>
			</div>
			{Object.keys(data).length !== 0 && <pre>{JSON.stringify(data, null, 4)}</pre>}
		</>
	);
}

export default App;
