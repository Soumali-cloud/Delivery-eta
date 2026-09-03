export const API_URL = import.meta.env.VITE_API_URL;

const configuredWsUrl = import.meta.env.VITE_WS_URL;

if (!API_URL || !configuredWsUrl) {
    throw new Error(
        "VITE_API_URL and VITE_WS_URL must be configured."
    );
}

const websocketProtocol =
    window.location.protocol === "https:" ? "wss:" : "ws:";

export const WS_URL =
    configuredWsUrl.replace(/^(ws|wss|http|https):/, websocketProtocol);