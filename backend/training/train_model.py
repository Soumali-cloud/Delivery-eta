import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# --------------------------------------------------
# 1. Load dataset
# --------------------------------------------------

df = pd.read_csv("delivery_data.csv")

print("Dataset loaded successfully!")
print("Records:", len(df))


# --------------------------------------------------
# 2. Define input features
# --------------------------------------------------

features = [
    "distance_km",
    "traffic_level",
    "weather_score",
    "preparation_time_min",
    "driver_available",
    "historical_avg_time"
]

X = df[features]

y = df["actual_delivery_time"]


# --------------------------------------------------
# 3. Split dataset
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("Training records:", len(X_train))
print("Testing records:", len(X_test))


# --------------------------------------------------
# 4. Create ML model
# --------------------------------------------------

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)


# --------------------------------------------------
# 5. Train model
# --------------------------------------------------

print("\nTraining model...")

model.fit(X_train, y_train)

print("Model training completed!")


# --------------------------------------------------
# 6. Make predictions
# --------------------------------------------------

predictions = model.predict(X_test)


# --------------------------------------------------
# 7. Evaluate model
# --------------------------------------------------

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("\n-----------------------------")
print("MODEL PERFORMANCE")
print("-----------------------------")

print(f"MAE  : {mae:.2f} minutes")
print(f"RMSE : {rmse:.2f} minutes")
print(f"R²   : {r2:.4f}")


# --------------------------------------------------
# 8. Feature importance
# --------------------------------------------------

importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    by="importance",
    ascending=False
)

print("\nFEATURE IMPORTANCE")
print("-----------------------------")
print(importance)


# --------------------------------------------------
# 9. Save trained model
# --------------------------------------------------

model_path = "app/ml/model.pkl"

joblib.dump(
    model,
    model_path
)

print("\nModel saved successfully!")
print(f"Location: {model_path}")