from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY

from .db import Base


class BrainRegion(Base):
    __tablename__ = "brain_regions"

    id = Column(String(64), primary_key=True)
    name_en = Column(String(200), nullable=False)
    name_ko = Column(String(200), nullable=True)
    parent_id = Column(String(64), ForeignKey("brain_regions.id"), nullable=True)
    mesh_name = Column(String(200), nullable=True, index=True)
    color = Column(String(16), nullable=True)
    description = Column(Text, nullable=True)
    functions = Column(ARRAY(String), nullable=True)
    disorders = Column(ARRAY(String), nullable=True)
