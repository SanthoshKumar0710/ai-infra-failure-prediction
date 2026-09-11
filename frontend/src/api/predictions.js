import api from "./axios";

// ============================================================
// GET ALL PREDICTIONS
// ============================================================

export async function getPredictions(limit = 100, offset = 0) {
  const response = await api.get("/predictions", {
    params: {
      limit,
      offset,
    },
  });

  return response.data;
}

// ============================================================
// GET SINGLE PREDICTION
// ============================================================

export async function getPrediction(predictionId) {
  const response = await api.get(`/predictions/${predictionId}`);
  return response.data;
}

// ============================================================
// GET SERVER PREDICTIONS
// ============================================================

export async function getServerPredictions(serverId) {
  const response = await api.get(`/predictions/server/${serverId}`);
  return response.data;
}

// ============================================================
// CREATE PREDICTION
// ============================================================

export async function createPrediction(serverId, metricId) {
  const response = await api.post("/predictions", {
    server_id: serverId,
    metric_id: metricId,
  });

  return response.data;
}