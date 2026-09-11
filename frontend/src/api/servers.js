import api from "./axios";

export async function getServers(limit = 100, offset = 0) {
  const response = await api.get("/servers", {
    params: { limit, offset },
  });
  return response.data;
}

export async function getServer(serverId) {
  const response = await api.get(`/servers/${serverId}`);
  return response.data;
}

export async function createServer(serverData) {
  const response = await api.post("/servers", serverData);
  return response.data;
}

export async function updateServer(serverId, serverData) {
  const response = await api.put(`/servers/${serverId}`, serverData);
  return response.data;
}

export async function deleteServer(serverId) {
  const response = await api.delete(`/servers/${serverId}`);
  return response.data;
}
