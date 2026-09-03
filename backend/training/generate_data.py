import pandas as pd
import numpy as np

np.random.seed(42)

rows = 10000

distance = np.random.uniform(0.5, 20, rows)
traffic = np.random.uniform(0, 1, rows)
weather = np.random.uniform(0, 1, rows)
preparation = np.random.uniform(5, 40, rows)
driver_available = np.random.randint(0, 2, rows)
historical = np.random.uniform(15, 60, rows)

eta = (
    distance * 3
    + traffic * 15
    + weather * 8
    + preparation
    + historical * 0.2
    + (1 - driver_available) * 10
)

noise = np.random.normal(0, 4, rows)

actual_time = eta + noise

df = pd.DataFrame({
    "distance_km": distance,
    "traffic_level": traffic,
    "weather_score": weather,
    "preparation_time_min": preparation,
    "driver_available": driver_available,
    "historical_avg_time": historical,
    "actual_delivery_time": actual_time
})

df.to_csv("delivery_data.csv", index=False)

print("Dataset created successfully!")
print(f"Total records: {len(df)}")
print()
print(df.head())
