import asyncio

from aiohttp import ClientSession


async def fetch(url, session, data):
    async with  session.post(url, json=data, headers={'Content-Type': 'application/json'})  as response:
        return await response.read()

async def main(r):
    tasks = []
    url = 'https://18.141.204.202.nip.io/cpp/compile_and_run'
    

    payload = {'all_code': '',
        'user_id': -1
    }

    # Fetch all responses within one Client session, keep connection alive for all requests.
    async with ClientSession() as session:
        for i in range(r):
            task = asyncio.ensure_future(fetch(url, session, payload))
            tasks.append(task)
            await asyncio.sleep(1)

        responses = await asyncio.gather(*tasks)
        # you now have all response bodies in this variable
        print(responses)
        

def print_responses(result):
    print(result)

asyncio.run(main(10))

