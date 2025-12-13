from sqlalchemy import Column, DateTime, Integer, func

from .db import Base


class TriggerEvent(Base):
    __tablename__ = "trigger_events"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

