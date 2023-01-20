from pydantic import BaseModel


class POST_BODY(BaseModel):
    user_id: str