import api from "./axios";

export async function getAlerts(limit = 100, offset = 0, unreadOnly = false) {
  const response = await api.get("/alerts", {
    params: { limit, offset, unread_only: unreadOnly },
  });
  return response.data;
}

export async function getAlert(alertId) {
  const response = await api.get(`/alerts/${alertId}`);
  return response.data;
}

export async function getServerAlerts(serverId) {
  const response = await api.get(`/alerts/server/${serverId}`);
  return response.data;
}

export async function markAlertRead(alertId) {
  const response = await api.put(`/alerts/${alertId}/read`);
  return response.data;
}

export async function deleteAlert(alertId) {
  const response = await api.delete(`/alerts/${alertId}`);
  return response.data;
}
