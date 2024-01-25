import asyncio
import logging
import os

import aiohttp
import openai

logging.basicConfig(format='%(name)s-%(levelname)s|%(lineno)d:  %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

openai.api_key = os.environ['OPENAI']


default_prompt = """Create a description of a basic application for me to create code for in C++.
The description what the application can be used for and should include some classes to write.
Please format the description nicely in text so that it is easy to read.
"""


async def generate_prompt(prompt:str = default_prompt):
    def openai_create():
        return openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.3,
        max_tokens=300
    )
  
    # pattern for wrapping a blocking task
    coro = asyncio.to_thread(openai_create)
    task = asyncio.create_task(coro)
    response = await task

    response_body = response.get('choices', None)
    if not response_body:
        log.warning('response from openai missing basic choices field - the object containing the text response from the model')

    if not isinstance(response_body, list) or len(response_body) < 1:
        log.warning('choices list from openai data is empty')

    first_response_obj = response_body[0]
    response_text = first_response_obj.get('text', "")

    return response_text

code_evaluation_prompt_base = lambda code, prompt, metric='functionality': f"""
In the following section, a prompt is given, for which some C++ code has been written.
Here is the prompt:
-----------------------------------
{prompt}
-------------------------------------
Please evaluate the following code for {metric}, highlighting good points and bad points, but you cannot evaluate the code based on comments of documentation or lack thereof.
Try not to be too harsh, but the code is good, try to give some actionable feedback as well.

Please also generate a score out of ten in the format: score: value/10. This should be the first line of the output.

Here is the code:
------------------------------
{code}
"""

      
async def evaluate_code(code: str, prompt:str):
    def openai_code_evaluate():
        log.info('evaluating code..')
        return openai.Completion.create(
            model="text-davinci-003",
            prompt=code_evaluation_prompt_base(code,prompt),
            temperature=0.6,
            max_tokens=200,
        )

    # pattern for wrapping a blocking task
    coro = asyncio.to_thread(openai_code_evaluate)
    task = asyncio.create_task(coro)
    response = await task
    
    log.info(response)
    response_body = response.get('choices', None)
    if not response_body:
        log.warning('response from openai missing basic choices field - the object containing the text response from the model')

    if not isinstance(response_body, list) or len(response_body) < 1:
        log.warning('choices list from openai data is empty')

    first_response_obj = response_body[0]
    response_text = first_response_obj.get('text', "")

    return response_text