import { useState } from "react";

import API from "../services/api";

const initialFormData = {
  order_id: "",
  distance_km: "",
  traffic_level: "",
  weather_score: "",
  preparation_time_min: "",
  driver_available: true,
  historical_avg_time: "",
  latitude: "",
  longitude: "",
};

function getBackendError(error) {
  const responseData = error?.response?.data;
  const detail = responseData?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || JSON.stringify(item))
      .join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  return error?.message || "Unable to create delivery.";
}

function AddDelivery() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    const numericFields = [
      "distance_km",
      "traffic_level",
      "weather_score",
      "preparation_time_min",
      "historical_avg_time",
    ];
    const numericValues = Object.fromEntries(
      numericFields.map((field) => [field, Number(formData[field])])
    );

    if (
      !formData.order_id.trim() ||
      numericFields.some((field) => !Number.isFinite(numericValues[field]))
    ) {
      setError("Enter an order ID and valid values for every required field.");
      return;
    }

    if (
      numericValues.distance_km < 0 ||
      numericValues.traffic_level < 0 ||
      numericValues.traffic_level > 1 ||
      numericValues.weather_score < 0 ||
      numericValues.weather_score > 1 ||
      numericValues.preparation_time_min < 0 ||
      numericValues.historical_avg_time < 0
    ) {
      setError("Use non-negative values; traffic and weather must be between 0 and 1.");
      return;
    }

    const payload = {
      order_id: formData.order_id.trim(),
      ...numericValues,
      driver_available: formData.driver_available,
    };

    ["latitude", "longitude"].forEach((field) => {
      if (formData[field] !== "") {
        payload[field] = Number(formData[field]);
      }
    });

    setLoading(true);

    try {
      const response = await API.post("/api/deliveries/", payload);
      const responseData = response.data || {};
      const predictedEta =
        responseData.predicted_eta ?? responseData.eta ?? responseData.prediction;

      setSuccess({
        orderId: responseData.order_id || payload.order_id,
        predictedEta,
      });
      setFormData(initialFormData);
    } catch (requestError) {
      console.error("Delivery creation error:", requestError);
      setError(getBackendError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const numberInputClass = "w-full border rounded-lg px-4 py-2";

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Add Delivery</h2>
        <p className="text-gray-500 mt-1">
          Create a delivery record with its ETA prediction inputs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" htmlFor="order_id">
              Order ID
            </label>
            <input
              id="order_id"
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              maxLength="50"
              className={numberInputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="distance_km">
              Distance (km)
            </label>
            <input id="distance_km" name="distance_km" type="number" value={formData.distance_km} onChange={handleChange} min="0" step="0.1" className={numberInputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="traffic_level">
              Traffic Level (0-1)
            </label>
            <input id="traffic_level" name="traffic_level" type="number" value={formData.traffic_level} onChange={handleChange} min="0" max="1" step="0.1" className={numberInputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="weather_score">
              Weather Score (0-1)
            </label>
            <input id="weather_score" name="weather_score" type="number" value={formData.weather_score} onChange={handleChange} min="0" max="1" step="0.1" className={numberInputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="preparation_time_min">
              Preparation Time (min)
            </label>
            <input id="preparation_time_min" name="preparation_time_min" type="number" value={formData.preparation_time_min} onChange={handleChange} min="0" step="1" className={numberInputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="historical_avg_time">
              Historical Average Time (min)
            </label>
            <input id="historical_avg_time" name="historical_avg_time" type="number" value={formData.historical_avg_time} onChange={handleChange} min="0" step="1" className={numberInputClass} required />
          </div>

          <div className="flex items-center gap-3 md:pt-8">
            <input id="driver_available" name="driver_available" type="checkbox" checked={formData.driver_available} onChange={handleChange} className="w-4 h-4" />
            <label className="text-sm font-medium" htmlFor="driver_available">
              Driver Available
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="latitude">
              Latitude (optional)
            </label>
            <input id="latitude" name="latitude" type="number" value={formData.latitude} onChange={handleChange} step="any" className={numberInputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="longitude">
              Longitude (optional)
            </label>
            <input id="longitude" name="longitude" type="number" value={formData.longitude} onChange={handleChange} step="any" className={numberInputClass} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Creating..." : "Create Delivery"}
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mt-5 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
          Delivery created successfully. Order ID: <strong>{success.orderId}</strong>
          {success.predictedEta !== undefined && success.predictedEta !== null && (
            <span> Predicted ETA: <strong>{success.predictedEta} min</strong>.</span>
          )}
        </div>
      )}
    </section>
  );
}

export default AddDelivery;