import asyncio
from channels.layers import get_channel_layer

async def test():
    layer = get_channel_layer()
    channel = await layer.new_channel("redis_test")
    group = "redis_timeout_test"

    try:
        await layer.group_add(group, channel)
        print("PASS: group_add")

        await layer.group_send(
            group,
            {"type": "test.message", "message": "hello"}
        )
        print("PASS: group_send")

        message = await layer.receive(channel)
        print("PASS: receive:", message)

        await layer.group_discard(group, channel)
        print("PASS: group_discard")
    finally:
        await layer.close()

asyncio.run(test())
