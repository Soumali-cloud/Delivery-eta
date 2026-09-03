function MLPerformance() {
  const models = [
    { name: "Random Forest", mae: 3.21, rmse: 4.16, r2: 0.91 },
    { name: "Gradient Boosting", mae: 2.87, rmse: 3.72, r2: 0.93 },
    { name: "XGBoost", mae: 2.54, rmse: 3.41, r2: 0.95 }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">
        ML Model Performance
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3">Model</th>
            <th>MAE</th>
            <th>RMSE</th>
            <th>R²</th>
          </tr>
        </thead>

        <tbody>
          {models.map(model => (
            <tr key={model.name} className="border-b">
              <td className="py-3 font-medium">{model.name}</td>
              <td>{model.mae}</td>
              <td>{model.rmse}</td>
              <td>{model.r2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3">
        <p className="font-semibold text-green-700">
          Best Model: XGBoost
        </p>
      </div>
    </div>
  );
}

export default MLPerformance;