import os
from dotenv import load_dotenv

load_dotenv()
def config(app):
    app.config['SECRET_KEY'] = os.getenv('SECRETKEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{os.getenv("PGUSER")}:{os.getenv("PGPASSWORD")}@{os.getenv("PGHOST")}:{os.getenv("PGPORT")}/{os.getenv("PGDATABASE")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False