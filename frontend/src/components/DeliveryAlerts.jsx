function DeliveryAlerts({ deliveries }) {
  const alerts = Object.values(deliveries)
    .filter(delivery => delivery.status === "delayed")
    .map(delivery => ({
      id: delivery.order_id,
      message: `${delivery.order_id} is delayed`
    }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">
        Live Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-gray-500">
          No active alerts
        </p>
      ) : (
        alerts.map(alert => (
          <div
            key={alert.id}
            className="mb-2 rounded-lg bg-red-50 p-3 text-red-700"
          >
            ⚠ {alert.message}
          </div>
        ))
      )}
    </div>
  );
}

export default DeliveryAlerts;