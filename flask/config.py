import os
from dotenv import load_dotenv

# Load environment variables
# You need to create a .env file in the root directory of your project and add the following lines:
# PGUSER=your_postgres_username
# PGPASSWORD=your_postgres_password
# PGHOST=your_postgres_host
# PGPORT=your_postgres_port
# PGDATABASE=your_postgres_database
# JWT_SECRET_KEY=your_jwt_secret_key
# SECRET_KEY=your_secret_key

load_dotenv()
SQLALCHEMY_DATABASE_URI = f'postgresql://{os.getenv("PGUSER")}:{os.getenv("PGPASSWORD")}@{os.getenv("PGHOST")}:{os.getenv("PGPORT")}/{os.getenv("PGDATABASE")}'
SQLALCHEMY_TRACK_MODIFICATIONS = False
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
SECRET_KEY = os.getenv('SECRETKEY')