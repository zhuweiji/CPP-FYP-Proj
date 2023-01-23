from dataclasses import dataclass
from typing import Optional

from pydantic import BaseModel


class POST_BODY(BaseModel):
    """Default body of a post request for most endpoints of the application"""
    user_id: Optional[str]
    


@dataclass
class BasicResponse:
    errors: str = ""
    message: str = ""
    
    def __repr__(self) -> str:
        return 'Response ' + ', '.join("%s: %s" % item for item in vars(self).items())