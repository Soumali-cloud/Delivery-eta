import joblib
import numpy as np
import pandas as pd


MODEL_PATH = "app/ml/model.pkl"

model = joblib.load(MODEL_PATH)


def _build_input(
    distance_km,
    traffic_level,
    weather_score,
    preparation_time_min,
    driver_available,
    historical_avg_time
):

    return pd.DataFrame([{
        "distance_km": distance_km,
        "traffic_level": traffic_level,
        "weather_score": weather_score,
        "preparation_time_min": preparation_time_min,
        "driver_available": int(driver_available),
        "historical_avg_time": historical_avg_time
    }])


def predict_eta_details(
    distance_km,
    traffic_level,
    weather_score,
    preparation_time_min,
    driver_available,
    historical_avg_time
):

    data = _build_input(
        distance_km,
        traffic_level,
        weather_score,
        preparation_time_min,
        driver_available,
        historical_avg_time
    )

    prediction = float(model.predict(data)[0])
    tree_predictions = np.array([
        estimator.predict(data.to_numpy())[0]
        for estimator in model.estimators_
    ])
    prediction_spread = float(tree_predictions.std())
    confidence = max(
        0.0,
        min(
            1.0,
            1.0 - prediction_spread / max(abs(prediction), 1.0)
        )
    )

    return round(prediction, 2), round(confidence, 4)


def predict_eta(
    distance_km,
    traffic_level,
    weather_score,
    preparation_time_min,
    driver_available,
    historical_avg_time
):

    prediction, _ = predict_eta_details(
        distance_km,
        traffic_level,
        weather_score,
        preparation_time_min,
        driver_available,
        historical_avg_time
    )

    return prediction