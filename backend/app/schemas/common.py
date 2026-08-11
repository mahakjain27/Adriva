from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every schema — the frontend's TypeScript types are all
    camelCase (companyId, logoPath, createdAt, ...); Python/SQLAlchemy
    convention is snake_case. This generates the camelCase alias
    automatically from each snake_case field name so schemas can be written
    in normal Python style while the JSON wire format matches the frontend
    exactly. `populate_by_name` lets the backend's own code still construct
    instances with the Python names."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)
