import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

export async function fetchUserById(userId, token) {
  const response = await axios.get(`http://localhost:3000/users/${userId}`, {
    headers: {
      Authorization: `${token}`
    }
  });
  return response.data;
}