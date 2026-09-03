import { useState } from "react";

import DeliveryMap from "../components/map/DeliveryMap";
import useDeliveryWebSocket from "../hooks/useDeliveryWebSocket";
import API from "../services/api";

function getErrorMessage(error) {
  const responseData = error?.response?.data;
  const detail = responseData?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || JSON.stringify(item)).join(", ");
  }

  return detail || responseData?.message || error?.message || "Unable to load this order.";
}

function normalizeDelivery(delivery) {
  return {
    ...delivery,
    eta: delivery.eta ?? delivery.predicted_eta,
  };
}

function getStatusLabel(status) {
  const normalizedStatus = String(status || "active").toLowerCase();

  if (normalizedStatus === "delivered") {
    return "Delivered";
  }

  if (normalizedStatus === "delayed") {
    return "Delayed";
  }

  return "On the way";
}

function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const trackOrder = async (event) => {
    event.preventDefault();
    const requestedOrderId = orderId.trim();

    if (!requestedOrderId) {
      setError("Enter an order ID to track.");
      setDelivery(null);
      return;
    }

    setLoading(true);
    setError("");
    setDelivery(null);

    try {
      const response = await API.get("/api/deliveries/");
      const matchingDelivery = response.data.find(
        (item) => item.order_id === requestedOrderId
      );

      if (!matchingDelivery) {
        throw new Error(`No delivery found for order ${requestedOrderId}.`);
      }

      setDelivery(normalizeDelivery(matchingDelivery));
      setLastUpdated(matchingDelivery.created_at || new Date().toISOString());
    } catch (requestError) {
      console.error("Track order error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useDeliveryWebSocket((event) => {
      try {
        const update = JSON.parse(event.data);

        if (!delivery?.order_id || update.order_id !== delivery.order_id) {
          return;
        }

        setDelivery((previous) => normalizeDelivery({ ...previous, ...update }));
        setLastUpdated(new Date().toISOString());
      } catch (socketError) {
        console.error("Track order update error:", socketError);
      }
  });

  const hasCoordinates =
    delivery &&
    Number.isFinite(Number(delivery.latitude)) &&
    Number.isFinite(Number(delivery.longitude));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Track Order</h1>
            <p className="text-sm text-gray-500 mt-1">Follow a delivery using its live status and location.</p>
          </div>
          <a href="/" className="text-blue-600 font-medium hover:text-blue-700">Dashboard</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <form onSubmit={trackOrder} className="flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="track-order-id">Order ID</label>
            <input
              id="track-order-id"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter order ID"
              className="flex-1 border rounded-lg px-4 py-3"
              required
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Loading..." : "Track Order"}
            </button>
          </form>

          {error && <div role="alert" className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>}
        </section>

        {delivery && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <section className="bg-white rounded-2xl border shadow-sm p-6 lg:col-span-1">
              <p className="text-sm text-gray-500">Order</p>
              <h2 className="text-2xl font-bold mt-1">{delivery.order_id}</h2>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">{getStatusLabel(delivery.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Predicted ETA</p>
                  <p className="font-semibold">{delivery.eta ?? "Not available"}{delivery.eta !== undefined && delivery.eta !== null ? " min" : ""}</p>
                </div>
                {String(delivery.status).toLowerCase() === "delivered" && (
                  <div>
                    <p className="text-sm text-gray-500">Actual delivery time</p>
                    <p className="font-semibold">{delivery.actual_delivery_time ?? "Not available"}{delivery.actual_delivery_time !== undefined && delivery.actual_delivery_time !== null ? " min" : ""}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Current location</p>
                  <p className="font-semibold">{hasCoordinates ? `${Number(delivery.latitude).toFixed(5)}, ${Number(delivery.longitude).toFixed(5)}` : "Not available"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="font-semibold">{lastUpdated ? new Date(lastUpdated).toLocaleString() : "Not available"}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border shadow-sm p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-5">Delivery location</h2>
              {hasCoordinates ? (
                <DeliveryMap deliveries={{ [delivery.order_id]: delivery }} />
              ) : (
                <div className="h-[500px] flex items-center justify-center border rounded-2xl text-gray-500">Location is not available for this order.</div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default TrackOrder;