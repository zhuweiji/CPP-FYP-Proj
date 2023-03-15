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



      
async def evaluate_code(code: str):
    async with aiohttp.ClientSession() as session:
      response = await asyncio.get_event_loop().run_in_executor(None,
        openai.Completion.create(
            model="code-davinci-002",
            prompt="// C++11\n// please evaluate the following code for cleanliness\n\nclass ConsoleOutput {\npublic:\n    void write(const std::string& message) {\n        std::cout << message << std::endl;\n    }\n}; \n\nclass Logger {\npublic:\n    void log(const std::string& message) {\n        ConsoleOutput output;\n        output.write(message);\n    }\n};",
            temperature=0.1,
            max_tokens=120,
          )
      )
      return response