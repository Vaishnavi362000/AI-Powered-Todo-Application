from models import Session
from sqlalchemy import text  # Import the text function

def test_database_connection():
    session = Session()
    try:
        # Use the text function to declare the SQL expression
        result = session.execute(text("SELECT 1"))
        print("Database connection successful!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    test_database_connection()