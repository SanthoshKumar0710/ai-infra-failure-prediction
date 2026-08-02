"""Generic repository abstraction.

Defining the interface as an ABC lets the service layer depend on the
abstraction rather than a concrete SQLAlchemy implementation, satisfying
the Dependency Inversion Principle and making services trivially
testable with an in-memory fake repository.
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

ModelType = TypeVar("ModelType")


class AbstractRepository(ABC, Generic[ModelType]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID) -> ModelType | None: ...

    @abstractmethod
    async def add(self, entity: ModelType) -> ModelType: ...

    @abstractmethod
    async def update(self, entity: ModelType) -> ModelType: ...

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID) -> None: ...
