from typing import Optional

from pydantic import BaseModel


class POST_BODY(BaseModel):
    user_id: Optional[str]