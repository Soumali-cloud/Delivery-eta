from fastapi import APIRouter

from app.schemas import ETAPredictionRequest
from app.ml.predictor import predict_eta_details

from app.services.redis_service import (
    get_eta,
    save_eta
)


router = APIRouter(
    prefix="/api/eta",
    tags=["ETA Prediction"]
)


def _explanation(request):

    return {
        "distance": request.distance_km,
        "traffic": request.traffic_level,
        "weather": request.weather_score,
        "preparation": request.preparation_time_min,
        "driver availability": request.driver_available,
        "historical time": request.historical_avg_time
    }


@router.post("/predict")
def predict(request: ETAPredictionRequest):

    # ----------------------------------------
    # 1. Check Redis cache
    # ----------------------------------------

    order_id = getattr(
        request,
        "order_id",
        None
    )

    if order_id:

        cached_result = get_eta(order_id)

        if cached_result:

            _, confidence = predict_eta_details(
                distance_km=request.distance_km,
                traffic_level=request.traffic_level,
                weather_score=request.weather_score,
                preparation_time_min=
                    request.preparation_time_min,
                driver_available=
                    request.driver_available,
                historical_avg_time=
                    request.historical_avg_time
            )

            return {

                "predicted_eta": cached_result["eta"],

                "confidence": confidence,

                "explanation": _explanation(request),

                "estimated_delivery_minutes":
                    cached_result["eta"],

                "unit": "minutes",

                "source": "redis_cache",

                "message":
                    f"Estimated delivery: "
                    f"{cached_result['eta']} minutes"
            }


    # ----------------------------------------
    # 2. Run ML prediction
    # ----------------------------------------

    eta, confidence = predict_eta_details(

        distance_km=request.distance_km,

        traffic_level=request.traffic_level,

        weather_score=request.weather_score,

        preparation_time_min=
            request.preparation_time_min,

        driver_available=
            request.driver_available,

        historical_avg_time=
            request.historical_avg_time
    )


    # ----------------------------------------
    # 3. Save prediction to Redis
    # ----------------------------------------

    if order_id:

        save_eta(
            order_id,
            eta
        )


    # ----------------------------------------
    # 4. Return result
    # ----------------------------------------

    return {

        "predicted_eta": eta,

        "confidence": confidence,

        "explanation": _explanation(request),

        "estimated_delivery_minutes": eta,

        "unit": "minutes",

        "source": "ml_model",

        "message":
            f"Estimated delivery: {eta} minutes"
    }