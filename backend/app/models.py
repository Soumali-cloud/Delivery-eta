from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime
)

from sqlalchemy.sql import func

from app.database import Base


class Delivery(Base):

    __tablename__ = "deliveries"


    # ========================================
    # Primary Key
    # ========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # ========================================
    # Order Information
    # ========================================

    order_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )


    # ========================================
    # Delivery Input Features
    # ========================================

    distance_km = Column(
        Float,
        nullable=False
    )

    traffic_level = Column(
        Float,
        nullable=False
    )

    weather_score = Column(
        Float,
        nullable=False
    )

    preparation_time_min = Column(
        Float,
        nullable=False
    )

    driver_available = Column(
        Boolean,
        nullable=False
    )

    historical_avg_time = Column(
        Float,
        nullable=False
    )


    # ========================================
    # ML Prediction
    # ========================================

    predicted_eta = Column(
        Float,
        nullable=True
    )


    # ========================================
    # Actual Delivery Information
    # ========================================

    actual_delivery_time = Column(
        Float,
        nullable=True
    )


    # ========================================
    # Delivery Status
    # ========================================

    status = Column(
        String(30),
        default="active",
        nullable=False
    )


    # ========================================
    # Live GPS Location
    # ========================================

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )


    # ========================================
    # Timestamp
    # ========================================

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )