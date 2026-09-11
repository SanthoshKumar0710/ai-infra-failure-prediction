import api from "./axios";

export async function getMetrics(limit = 100, offset = 0) {
  const response = await api.get("/metrics", {
    params: { limit, offset },
  });
  return response.data;
}

export async function getMetric(metricId) {
  const response = await api.get(`/metrics/${metricId}`);
  return response.data;
}

export async function getServerMetrics(serverId) {
  const response = await api.get(`/metrics/server/${serverId}`);
  return response.data;
}

export async function createMetric(metricData) {
  const response = await api.post("/metrics", metricData);
  return response.data;
}
