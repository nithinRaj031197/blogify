import axios from "axios";

export const customAxios = axios.create({ baseURL: "http://localhost:5000/api" });
