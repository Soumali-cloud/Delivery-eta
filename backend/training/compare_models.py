from pathlib import Path

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor


BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BACKEND_DIR / "delivery_data.csv"
RESULTS_PATH = BACKEND_DIR / "model_comparison.csv"

FEATURES = [
    "distance_km",
    "traffic_level",
    "weather_score",
    "preparation_time_min",
    "driver_available",
    "historical_avg_time",
]
TARGET = "actual_delivery_time"


def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
    )

    models = {
        "Random Forest": RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            n_jobs=-1,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            random_state=42,
        ),
        "XGBoost": XGBRegressor(
            n_estimators=200,
            max_depth=6,
            random_state=42,
            n_jobs=-1,
            objective="reg:squarederror",
        ),
    }

    results = []
    for model_name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)

        results.append(
            {
                "Model": model_name,
                "MAE": mean_absolute_error(y_test, predictions),
                "RMSE": mean_squared_error(y_test, predictions) ** 0.5,
                "R²": r2_score(y_test, predictions),
            }
        )

    comparison = pd.DataFrame(results)
    comparison.to_csv(RESULTS_PATH, index=False)

    display_comparison = comparison.copy()
    display_comparison["MAE"] = display_comparison["MAE"].map(
        lambda value: f"{value:.4f}"
    )
    display_comparison["RMSE"] = display_comparison["RMSE"].map(
        lambda value: f"{value:.4f}"
    )
    display_comparison["R²"] = display_comparison["R²"].map(
        lambda value: f"{value:.4f}"
    )

    print("\nMODEL COMPARISON")
    print("-----------------------------")
    print(display_comparison.to_string(index=False))
    print(f"\nResults saved to: {RESULTS_PATH}")

    best_model = comparison.loc[comparison["MAE"].idxmin(), "Model"]
    print(f"Lowest MAE: {best_model}")


if __name__ == "__main__":
    main()
