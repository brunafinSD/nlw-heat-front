import axios from "axios";
// axios é o cliente de requisições http

export const api = axios.create({
  baseURL: 'http://localhost:4000',
})