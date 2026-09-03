from app.services.redis_service import (
    save_eta,
    get_eta
)


order_id = "ORD1001"

save_eta(
    order_id,
    31.4
)

result = get_eta(
    order_id
)

print("Redis result:")
print(result)