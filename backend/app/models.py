from sqlalchemy import Column, Integer, String

from .db import Base


class ExpressionRecord(Base):
    __tablename__ = "expression_records"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(100), nullable=False)
    allen = Column(Integer, default=0)
    gtex = Column(Integer, default=0)
    hpa = Column(Integer, default=0)
    mane = Column(Integer, default=0)
    ncbi = Column(Integer, default=0)
