from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

import json

from app.database import get_db
from app.models import Delivery


router = APIRouter()


connected_clients = []


@router.websocket("/ws/deliveries")
async def delivery_websocket(
    websocket: WebSocket
):

    await websocket.accept()

    connected_clients.append(websocket)

    print("WebSocket client connected")

    try:

        while True:

            message = await websocket.receive_text()

            try:

                data = json.loads(message)

                # --------------------------------
                # Update PostgreSQL
                # --------------------------------

                db = next(get_db())

                try:

                    order_id = data.get(
                        "order_id"
                    )

                    delivery = (
                        db.query(Delivery)
                        .filter(
                            Delivery.order_id ==
                            order_id
                        )
                        .first()
                    )

                    if delivery:

                        if "latitude" in data:

                            delivery.latitude = (
                                data["latitude"]
                            )

                        if "longitude" in data:

                            delivery.longitude = (
                                data["longitude"]
                            )

                        if "eta" in data:

                            delivery.predicted_eta = (
                                data["eta"]
                            )

                        if "actual_delivery_time" in data:

                            try:

                                actual_delivery_time = float(
                                    data["actual_delivery_time"]
                                )

                            except (
                                TypeError,
                                ValueError
                            ):

                                actual_delivery_time = None

                            if (
                                actual_delivery_time
                                is not None
                                and actual_delivery_time > 0
                            ):

                                delivery.actual_delivery_time = (
                                    actual_delivery_time
                                )

                        if "status" in data:

                            delivery.status = (
                                data["status"]
                            )

                        db.commit()

                        print(
                            f"Database updated: "
                            f"{order_id}"
                        )

                    else:

                        print(
                            f"Order not found: "
                            f"{order_id}"
                        )

                finally:

                    db.close()


                # --------------------------------
                # Broadcast to React
                # --------------------------------

                await broadcast_delivery_update(
                    data,
                    sender=websocket
                )


            except json.JSONDecodeError:

                print(
                    "Received invalid JSON:",
                    message
                )

    except WebSocketDisconnect:

        if websocket in connected_clients:

            connected_clients.remove(
                websocket
            )

        print(
            "WebSocket client disconnected"
        )


async def broadcast_delivery_update(
    data,
    sender=None
):

    disconnected = []

    for websocket in connected_clients:

        if websocket == sender:

            continue

        try:

            await websocket.send_json(
                data
            )

        except Exception:

            disconnected.append(
                websocket
            )


    for websocket in disconnected:

        if websocket in connected_clients:

            connected_clients.remove(
                websocket
            )
