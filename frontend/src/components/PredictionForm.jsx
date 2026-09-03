import { useState } from "react";
import { API_URL } from "../config";

function PredictionForm() {
  const [formData, setFormData] = useState({
    distance_km: 5,
    traffic_level: 0.5,
    weather_score: 0.2,
    preparation_time_min: 15,
    driver_available: true,
    historical_avg_time: 30,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await fetch(
        `${API_URL}/api/eta/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: `web-${Date.now()}`,
            distance_km: formData.distance_km,
            traffic_level: formData.traffic_level,
            weather_score: formData.weather_score,
            preparation_time_min: formData.preparation_time_min,
            driver_available: formData.driver_available,
            historical_avg_time: formData.historical_avg_time,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const detail = errorBody?.detail;
        const errorMessage = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || errorBody?.message || response.statusText;

        throw new Error(
          `Prediction request failed (${response.status}): ${errorMessage}`
        );
      }

      const data = await response.json();
      const predictedEta = typeof data === "number"
        ? data
        : data?.predicted_eta ??
          data?.eta ??
          data?.estimated_delivery_minutes ??
          data?.prediction;

      if (predictedEta === undefined || predictedEta === null) {
        throw new Error(
          "Prediction response did not contain an ETA value."
        );
      }

      setPrediction(
        typeof data === "object"
          ? { ...data, predicted_eta: predictedEta }
          : { predicted_eta: predictedEta }
      );
    } catch (err) {
      console.error("Prediction error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to get prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Delivery ETA Prediction
        </h2>

        <p className="text-gray-500 mt-1">
          Enter delivery conditions to estimate arrival time.
        </p>
      </div>


      {/* ===================================== */}
      {/* FORM */}
      {/* ===================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Distance */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Distance (km)
          </label>

          <input
            type="number"
            name="distance_km"
            value={formData.distance_km}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>


        {/* Traffic */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Traffic Level
          </label>

          <input
            type="number"
            name="traffic_level"
            value={formData.traffic_level}
            onChange={handleChange}
            min="0"
            max="1"
            step="0.1"
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <p className="text-xs text-gray-500 mt-1">
            Enter a value between 0 and 1.
          </p>
        </div>


        {/* Weather */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Weather Score
          </label>

          <input
            type="number"
            name="weather_score"
            value={formData.weather_score}
            onChange={handleChange}
            min="0"
            max="1"
            step="0.1"
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <p className="text-xs text-gray-500 mt-1">
            Enter a value between 0 and 1.
          </p>
        </div>


        {/* Restaurant preparation */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Restaurant Preparation Time (min)
          </label>

          <input
            type="number"
            name="preparation_time_min"
            value={formData.preparation_time_min}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>


        {/* Historical average */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Historical Average Delivery Time (min)
          </label>

          <input
            type="number"
            name="historical_avg_time"
            value={formData.historical_avg_time}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>


        {/* Driver availability */}

        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            name="driver_available"
            checked={formData.driver_available}
            onChange={handleChange}
            className="w-4 h-4"
          />

          <label className="text-sm font-medium">
            Driver Available
          </label>

        </div>


        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Predicting..."
            : "Predict Delivery ETA"}
        </button>

      </form>


      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error && (
        <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}


      {/* ===================================== */}
      {/* PREDICTION RESULT */}
      {/* ===================================== */}

      {prediction && (
        <div className="mt-8">

          <div className="rounded-2xl border p-6">

            <p className="text-sm text-gray-500">
              Estimated Delivery Time
            </p>

            <div className="mt-2 text-4xl font-bold">
              {prediction.predicted_eta ??
                prediction.eta ??
                "--"}{" "}
              <span className="text-xl">
                min
              </span>
            </div>


            {/* Confidence */}

            {prediction.confidence !== undefined && (
              <div className="mt-3 text-sm">
                Confidence:{" "}
                <strong>
                  {prediction.confidence}%
                </strong>
              </div>
            )}

          </div>


          {/* ================================= */}
          {/* AI ETA EXPLANATION */}
          {/* ================================= */}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">

            <h3 className="text-lg font-semibold mb-4">
              AI ETA Explanation
            </h3>


            {/* Distance */}

            <div className="flex justify-between py-2 border-b border-blue-100">

              <span>
                Distance
              </span>

              <span className="font-medium">
                {formData.distance_km} km
              </span>

            </div>


            {/* Traffic */}

            <div className="flex justify-between py-2 border-b border-blue-100">

              <span>
                Traffic Level
              </span>

              <span className="font-medium">
                {formData.traffic_level}
              </span>

            </div>


            {/* Weather */}

            <div className="flex justify-between py-2 border-b border-blue-100">

              <span>
                Weather Score
              </span>

              <span className="font-medium">
                {formData.weather_score}
              </span>

            </div>


            {/* Restaurant */}

            <div className="flex justify-between py-2 border-b border-blue-100">

              <span>
                Restaurant Preparation
              </span>

              <span className="font-medium">
                {formData.preparation_time_min} min
              </span>

            </div>


            {/* Driver */}

            <div className="flex justify-between py-2 border-b border-blue-100">

              <span>
                Driver Availability
              </span>

              <span className="font-medium">
                {formData.driver_available
                  ? "Available"
                  : "Unavailable"}
              </span>

            </div>


            {/* Historical */}

            <div className="flex justify-between py-2">

              <span>
                Historical Average
              </span>

              <span className="font-medium">
                {formData.historical_avg_time} min
              </span>

            </div>


            {/* Backend explanation */}

            {prediction.explanation && (
              <div className="mt-5 bg-white rounded-xl p-4">

                <h4 className="font-semibold mb-3">
                  Model Explanation
                </h4>

                <pre className="text-sm whitespace-pre-wrap">
                  {typeof prediction.explanation === "string"
                    ? prediction.explanation
                    : JSON.stringify(
                        prediction.explanation,
                        null,
                        2
                      )}
                </pre>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default PredictionForm;