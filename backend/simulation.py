import asyncio
import random
import json
import os
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

import websockets

from app.services.redis_service import save_eta


UPDATE_INTERVAL_SECONDS = 5
SIMULATED_MINUTES_PER_UPDATE = 2.5
BATCH_SIZE = 3
BACKEND_RETRY_DELAY_SECONDS = 5

SIMULATION_ROUTES = [
    (22.5718, 88.3608, 22.5772, 88.3659, 9, 25.0),
    (22.5756, 88.3584, 22.5694, 88.3618, 13, 34.0),
    (22.5697, 88.3668, 22.5735, 88.3549, 17, 43.0),
]


deliveries = [

    {
        "order_id": "ORD1001",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "destination_latitude": 22.5762,
        "destination_longitude": 88.3681,
        "eta": 31.4,
        "initial_eta": 31.4,
        "updates_completed": 0,
        "updates_to_deliver": 14,
        "status": "active",
        "delivered": False
    },

    {
        "order_id": "ORD1002",
        "latitude": 22.5744,
        "longitude": 88.3629,
        "destination_latitude": 22.5698,
        "destination_longitude": 88.3664,
        "eta": 28.2,
        "initial_eta": 28.2,
        "updates_completed": 0,
        "updates_to_deliver": 12,
        "status": "active",
        "delivered": False
    },

    {
        "order_id": "ORD1003",
        "latitude": 22.5708,
        "longitude": 88.3575,
        "destination_latitude": 22.5751,
        "destination_longitude": 88.3542,
        "eta": 24.7,
        "initial_eta": 24.7,
        "updates_completed": 0,
        "updates_to_deliver": 10,
        "status": "active",
        "delivered": False
    }

]


next_order_number = 1004


def get_api_url():

    configured_url = os.getenv(
        "BACKEND_URL",
        "http://backend:8000"
    )

    return configured_url.rstrip("/")


def get_websocket_url():

    configured_url = os.getenv("WEBSOCKET_URL")

    if configured_url:

        return configured_url

    parsed_url = urlsplit(get_api_url())
    websocket_scheme = "wss" if parsed_url.scheme == "https" else "ws"

    return (
        f"{websocket_scheme}://{parsed_url.netloc}"
        "/ws/deliveries"
    )


async def request_json(
    method,
    path,
    payload=None
):

    url = f"{get_api_url()}{path}"
    body = None
    headers = {}

    if payload is not None:

        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    def send_request():

        request = Request(
            url,
            data=body,
            headers=headers,
            method=method
        )

        with urlopen(request, timeout=10) as response:

            return json.loads(
                response.read().decode("utf-8")
            )

    while True:

        try:

            return await asyncio.to_thread(send_request)

        except Exception as error:

            print(
                f"Backend unavailable for {method} {path}: {error}. "
                f"Retrying in {BACKEND_RETRY_DELAY_SECONDS} seconds."
            )

            await asyncio.sleep(
                BACKEND_RETRY_DELAY_SECONDS
            )


async def connect_websocket(uri):

    while True:

        try:

            return await websockets.connect(uri)

        except Exception as error:

            print(
                f"WebSocket unavailable: {error}. "
                f"Retrying in {BACKEND_RETRY_DELAY_SECONDS} seconds."
            )

            await asyncio.sleep(
                BACKEND_RETRY_DELAY_SECONDS
            )


async def get_existing_deliveries():

    response = await request_json(
        "GET",
        "/api/deliveries/"
    )

    return {
        delivery["order_id"]: delivery
        for delivery in response
    }


def create_simulation_state(delivery, route):

    (
        start_latitude,
        start_longitude,
        destination_latitude,
        destination_longitude,
        updates_to_deliver,
        route_eta
    ) = route

    return {
        "order_id": delivery["order_id"],
        "latitude": delivery.get("latitude") or start_latitude,
        "longitude": delivery.get("longitude") or start_longitude,
        "destination_latitude": destination_latitude,
        "destination_longitude": destination_longitude,
        "eta": (
            delivery.get("predicted_eta")
            or delivery.get("historical_avg_time")
            or route_eta
        ),
        "initial_eta": (
            delivery.get("predicted_eta")
            or delivery.get("historical_avg_time")
            or route_eta
        ),
        "updates_completed": 0,
        "updates_to_deliver": updates_to_deliver,
        "status": delivery.get("status", "active"),
        "delivered": False
    }


def add_new_deliveries(existing_deliveries):

    known_order_ids = {
        delivery["order_id"]
        for delivery in deliveries
    }

    active_deliveries = [
        delivery
        for delivery in existing_deliveries.values()
        if delivery.get("status", "active").lower()
        != "delivered"
        and delivery["order_id"] not in known_order_ids
    ]

    for index, delivery in enumerate(active_deliveries):

        route = SIMULATION_ROUTES[
            (len(deliveries) + index)
            % len(SIMULATION_ROUTES)
        ]

        deliveries.append(
            create_simulation_state(
                delivery,
                route
            )
        )


def sync_delivered_deliveries(existing_deliveries):

    for delivery in deliveries:

        database_delivery = existing_deliveries.get(
            delivery["order_id"]
        )

        if not database_delivery:

            continue

        if database_delivery.get("status", "").lower() == "delivered":

            delivery["status"] = "delivered"
            delivery["delivered"] = True

            if database_delivery.get("actual_delivery_time") is not None:

                delivery["actual_delivery_time"] = (
                    database_delivery["actual_delivery_time"]
                )


async def persist_delivery(delivery):

    payload = {
        "order_id": delivery["order_id"],
        "distance_km": 1.0,
        "traffic_level": 0.5,
        "weather_score": 0.2,
        "preparation_time_min": 15.0,
        "driver_available": True,
        "historical_avg_time": delivery["initial_eta"],
        "predicted_eta": delivery["eta"],
        "status": delivery["status"],
        "latitude": delivery["latitude"],
        "longitude": delivery["longitude"]
    }

    await request_json(
        "POST",
        "/api/deliveries/",
        payload
    )


async def persist_delivery_batch(batch):

    persisted_batch = []

    for delivery in batch:

        try:

            await persist_delivery(delivery)
            persisted_batch.append(delivery)

        except Exception as error:

            print(
                f"Could not create {delivery['order_id']}: {error}"
            )

    return persisted_batch


def create_delivery_batch():

    global next_order_number

    batch = []

    for index in range(BATCH_SIZE):

        (
            latitude,
            longitude,
            destination_latitude,
            destination_longitude,
            updates_to_deliver,
            initial_eta
        ) = SIMULATION_ROUTES[index]

        batch.append({
            "order_id": f"ORD{next_order_number}",
            "latitude": latitude,
            "longitude": longitude,
            "destination_latitude": destination_latitude,
            "destination_longitude": destination_longitude,
            "eta": initial_eta,
            "initial_eta": initial_eta,
            "updates_completed": 0,
            "updates_to_deliver": updates_to_deliver,
            "status": "on the way",
            "delivered": False
        })

        next_order_number += 1

    return batch


def update_delivery_progress(delivery):

    if delivery["delivered"]:

        return False

    delivery["updates_completed"] += 1

    progress = (
        min(
            delivery["updates_completed"],
            delivery["updates_to_deliver"]
        )
        / delivery["updates_to_deliver"]
    )

    delivery["latitude"] = (
        delivery["latitude"]
        + (
            delivery["destination_latitude"]
            - delivery["latitude"]
        )
        * progress
    )
    delivery["longitude"] = (
        delivery["longitude"]
        + (
            delivery["destination_longitude"]
            - delivery["longitude"]
        )
        * progress
    )

    remaining_eta = (
        delivery["initial_eta"]
        * max(0, 1 - progress)
    )

    traffic_variance = random.uniform(
        -1.0,
        1.5
    )

    delivery["eta"] = round(
        max(
            1,
            remaining_eta + traffic_variance
        ),
        2
    )

    if delivery["updates_completed"] < delivery["updates_to_deliver"]:

        delivery["status"] = "on the way"

    else:

        delivery["status"] = "delivered"
        delivery["delivered"] = True

        actual_delivery_time = (
            delivery["updates_completed"]
            * SIMULATED_MINUTES_PER_UPDATE
        )

        traffic_adjustment = random.uniform(
            -1.0,
            2.0
        )

        delivery["actual_delivery_time"] = round(
            max(
                1,
                actual_delivery_time + traffic_adjustment
            ),
            2
        )

    return True


def create_update(delivery):

    update = {

        "order_id":
            delivery["order_id"],

        "latitude":
            round(
                delivery["latitude"],
                5
            ),

        "longitude":
            round(
                delivery["longitude"],
                5
            ),

        "eta":
            delivery["eta"],

        "status":
            delivery["status"]
    }

    if delivery["status"] == "delivered":

        update["actual_delivery_time"] = (
            delivery["actual_delivery_time"]
        )

    return update


async def simulate():

    uri = get_websocket_url()

    existing_deliveries = await get_existing_deliveries()

    global deliveries
    global next_order_number

    existing_order_numbers = [
        int(order_id[3:])
        for order_id in existing_deliveries
        if order_id.startswith("ORD")
        and order_id[3:].isdigit()
    ]

    if existing_order_numbers:

        next_order_number = max(
            next_order_number,
            max(existing_order_numbers) + 1
        )

    deliveries = [
        delivery
        for delivery in deliveries
        if delivery["order_id"] in existing_deliveries
        and existing_deliveries[delivery["order_id"]].get("status")
        != "delivered"
    ]

    if not deliveries:

        deliveries = await persist_delivery_batch(
            create_delivery_batch()
        )

    async with await connect_websocket(uri) as websocket:

        print("Simulator connected to WebSocket!")

        while True:

            existing_deliveries = await get_existing_deliveries()
            sync_delivered_deliveries(existing_deliveries)
            add_new_deliveries(existing_deliveries)

            changed_deliveries = 0

            for delivery in deliveries:

                changed = update_delivery_progress(
                    delivery
                )

                if not changed:

                    continue

                changed_deliveries += 1

                # Save ETA to Redis

                save_eta(
                    delivery["order_id"],
                    delivery["eta"]
                )


                # Create live update

                update = create_update(
                    delivery
                )


                # Send update to FastAPI

                await websocket.send(
                    json.dumps(update)
                )


                print(
                    delivery["order_id"],
                    "->",
                    delivery["latitude"],
                    delivery["longitude"],
                    "ETA:",
                    delivery["eta"],
                    "min",
                    "Status:",
                    delivery["status"]
                )


            if changed_deliveries == 0:

                deliveries[:] = await persist_delivery_batch(
                    create_delivery_batch()
                )

                if deliveries:

                    print(
                        "All deliveries completed. "
                        "Started a new delivery batch."
                    )

                else:

                    print(
                        "No new deliveries were created."
                    )

            print("-" * 50)

            await asyncio.sleep(
                UPDATE_INTERVAL_SECONDS
            )


asyncio.run(simulate())
