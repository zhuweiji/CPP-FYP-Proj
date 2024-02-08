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

start_prompt = """
    You are a helpful assistant and an expert in object-oriented programming, particularly with C++. 
    If the user asks for anything related to neither object-oriented programming nor C++, you must respond with: 
    "Sorry, I can only answer questions related to object-oriented programming or C++".
"""

messageHistory = []

async def generate_prompt(user_prompt:str, is_first_prompt:bool):
    log.info("user's prompt: " + user_prompt)
    log.info(str(is_first_prompt))
    global messageHistory
    
    # Only place start prompt if this is the first prompt
    if is_first_prompt:
        messageHistory = [
            {"role": "system", "content": start_prompt},
            {"role": "user", "content": user_prompt}
        ]
    else: 
        messageHistory.append({"role": "user", "content": user_prompt})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messageHistory,
        temperature=0,
    )

    # log.info(response)
    response_body = response.choices
    if not response_body:
        log.warning('response from OpenAI missing choices field')
        messageHistory.pop()
        return { 'message': 'Unknown error' }

    if response_body[0].finish_reason != 'stop':
        log.warning('Something went wrong')
        messageHistory.pop()
        return response_body[0]

    messageHistory.append({"role": "system", "content": response_body[0].message.content})
    return response_body[0].message.content


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