import asyncio
import logging
import os

from openai import OpenAI

from compiler_server_service.services.secret_keys import my_api_key

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

# openai.api_key = os.environ['OPENAI']
MODEL = "gpt-3.5-turbo"
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", my_api_key))

default_prompt = """
    Pretend you're an expert in object-oriented programming, particularly with C++. 
"""


async def generate_prompt(user_prompt:str):
    log.info("user's prompt: " + user_prompt)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant and an expert in object-oriented programming, particularly with C++."},
            {"role": "user", "content": user_prompt},
            # {"role": "assistant", "content": "Who's there?"},
            # {"role": "user", "content": "Orange."},
        ],
        temperature=0,
    )

    # log.info(response)
    response_body = response.choices
    if not response_body:
        log.warning('response from openai missing basic choices field - the object containing the text response from the model')
        return { 'message': 'Unknown error' }

    if response_body[0].finish_reason != 'stop':
        log.warning('Something went wrong')
        return response_body[0]

    return response_body[0].message.content

    

    if not isinstance(response_body, list) or len(response_body) < 1:
        log.warning('choices list from openai data is empty')

    first_response_obj = response_body[0]
    return first_response_obj
    # response_text = first_response_obj.get('text', "")

    # return response_text

# code_evaluation_prompt_base = lambda code, prompt, metric='functionality': f"""
# In the following section, a prompt is given, for which some C++ code has been written.
# Here is the prompt:
# -----------------------------------
# {prompt}
# -------------------------------------
# Please evaluate the following code for {metric}, highlighting good points and bad points, but you cannot evaluate the code based on comments of documentation or lack thereof.
# Try not to be too harsh, but the code is good, try to give some actionable feedback as well.

# Please also generate a score out of ten in the format: score: value/10. This should be the first line of the output.

# Here is the code:
# ------------------------------
# {code}
# """

      
# async def evaluate_code(code: str, prompt:str):
#     def openai_code_evaluate():
#         log.info('evaluating code..')
#         return openai.Completion.create(
#             model="text-davinci-003",
#             prompt=code_evaluation_prompt_base(code,prompt),
#             temperature=0.6,
#             max_tokens=200,
#         )

#     # pattern for wrapping a blocking task
#     coro = asyncio.to_thread(openai_code_evaluate)
#     task = asyncio.create_task(coro)
#     response = await task
    
#     log.info(response)
#     response_body = response.get('choices', None)
#     if not response_body:
#         log.warning('response from openai missing basic choices field - the object containing the text response from the model')

#     if not isinstance(response_body, list) or len(response_body) < 1:
#         log.warning('choices list from openai data is empty')

#     first_response_obj = response_body[0]
#     response_text = first_response_obj.get('text', "")

#     return response_text