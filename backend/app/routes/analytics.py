from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Delivery


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db)
):

    deliveries = (
        db.query(Delivery)
        .all()
    )


    total = len(deliveries)


    active = len([
        d for d in deliveries
        if d.status.lower()
        in ["active", "on the way"]
    ])


    completed_deliveries = [
        d for d in deliveries
        if d.status.lower()
        in ["delivered", "completed"]
    ]


    completed = len(
        completed_deliveries
    )


    delayed = len([
        d for d in deliveries
        if d.status.lower()
        == "delayed"
    ])


    on_time = len([
        d for d in deliveries
        if d.status.lower()
        in ["on_time", "on time"]
    ])


    if total > 0:

        on_time_percentage = (
            on_time / total
        ) * 100

        delayed_percentage = (
            delayed / total
        ) * 100

    else:

        on_time_percentage = 0

        delayed_percentage = 0


    # ----------------------------------------
    # Average ETA error
    # ----------------------------------------

    completed_with_eta = [
        delivery for delivery
        in completed_deliveries
        if (
            delivery.predicted_eta
            is not None
            and delivery.actual_delivery_time
            is not None
        )
    ]


    eta_errors = []

    for delivery in completed_with_eta:

        error = abs(
            delivery.predicted_eta
            - delivery.actual_delivery_time
        )

        eta_errors.append(error)


    if completed_with_eta:

        average_eta_error = (
            sum(eta_errors)
            / len(completed_with_eta)
        )

        average_actual_delivery_time = (
            sum(
                delivery.actual_delivery_time
                for delivery in completed_with_eta
            )
            / len(completed_with_eta)
        )

        average_predicted_eta = (
            sum(
                delivery.predicted_eta
                for delivery in completed_with_eta
            )
            / len(completed_with_eta)
        )

    else:

        average_eta_error = 0
        average_actual_delivery_time = 0
        average_predicted_eta = 0


    return {

        "total_deliveries":
            total,

        "active_deliveries":
            active,

        "completed_deliveries":
            completed,

        "on_time":
            round(
                on_time_percentage,
                2
            ),

        "delayed":
            round(
                delayed_percentage,
                2
            ),

        "average_eta_error":
            round(
                average_eta_error,
                2
            ),

        "total_completed":
            completed,

        "average_actual_delivery_time":
            round(
                average_actual_delivery_time,
                2
            ),

        "average_predicted_eta":
            round(
                average_predicted_eta,
                2
            )

    }
