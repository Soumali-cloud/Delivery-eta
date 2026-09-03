import axios from "axios";
import { API_URL } from "../config";

const API = axios.create({
    baseURL: API_URL
});

export const predictETA = async (data) => {
    const response = await API.post(
        "/api/eta/predict",
        data
    );

    return response.data;
};

export default API;