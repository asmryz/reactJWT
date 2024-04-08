import axios from "axios"

const BASE_API_URL = `http://localhost:5000`
//const BASE_API_URL = `https://pharmacy-api-nine.vercel.app`

const APP_API_URL = `http://localhost:5173`


const instance = axios.create({
  //baseURL: BASE_API_URL,
})


let refresh = false;

axios.interceptors.response.use(resp => resp, async error => {
    console.log(`interceptors`, error)
    if (error.response.status === 403 && !refresh) {
        refresh = true;

        const response = await axios.post(`/api/refresh`, {}, {withCredentials: true});
        console.log(response.data);
        if (response.status === 200) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data['token']}`;

            return axios(error.config);
        }
    }
    refresh = false;
    return error;
});

//export const api = instance