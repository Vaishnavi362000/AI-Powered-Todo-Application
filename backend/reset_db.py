import os
from models import Base, engine



# Create new database with updated schema
Base.metadata.create_all(engine)

print("Database has been reset successfully!") 