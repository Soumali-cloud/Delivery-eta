from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Delivery


router = APIRouter(
    prefix="/api/deliveries",
    tags=["Deliveries"]
)


@router.post("/")
def create_delivery(
    delivery: dict,
    db: Session = Depends(get_db)
):

    new_delivery = Delivery(
        order_id=delivery["order_id"],
        distance_km=delivery["distance_km"],
        traffic_level=delivery["traffic_level"],
        weather_score=delivery["weather_score"],
        preparation_time_min=delivery["preparation_time_min"],
        driver_available=delivery["driver_available"],
        historical_avg_time=delivery["historical_avg_time"],
        predicted_eta=delivery.get("predicted_eta"),
        actual_delivery_time=delivery.get("actual_delivery_time"),
        status=delivery.get("status", "active"),
        latitude=delivery.get("latitude"),
        longitude=delivery.get("longitude")
    )

    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)

    return {
        "message": "Delivery created successfully",
        "order_id": new_delivery.order_id,
        "id": new_delivery.id
    }


@router.get("/")
def get_deliveries(
    db: Session = Depends(get_db)
):

    deliveries = db.query(Delivery).all()

    return deliveries