import json
import os

import redis
from dotenv import load_dotenv


load_dotenv()


REDIS_URL = os.getenv(
    "REDIS_URL"
)


redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)


def save_eta(order_id, eta):

    redis_client.set(
        f"eta:{order_id}",
        json.dumps({
            "order_id": order_id,
            "eta": eta
        }),
        ex=300
    )


def get_eta(order_id):

    data = redis_client.get(
        f"eta:{order_id}"
    )

    if data is None:
        return None

    return json.loads(data)


def delete_eta(order_id):

    redis_client.delete(
        f"eta:{order_id}"
    )