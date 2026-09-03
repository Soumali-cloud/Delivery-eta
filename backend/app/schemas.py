from pydantic import BaseModel


class ETAPredictionRequest(BaseModel):

    order_id: str

    distance_km: float

    traffic_level: float

    weather_score: float

    preparation_time_min: float

    driver_available: bool

    historical_avg_time: float