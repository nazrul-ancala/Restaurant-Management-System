import { io } from "socket.io-client";
import { api } from "../config";

const SOCKET_URL = api.API_URL.replace(/\/api\/v1\/?$/, "");

export const socket = io(SOCKET_URL, { autoConnect: true });
