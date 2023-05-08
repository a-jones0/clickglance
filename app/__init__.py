from flask import Flask
from config import Config
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy

# create the app
cg_app = Flask(__name__,static_url_path='', static_folder='static')
cg_app.config.from_object(Config)

# initialize the database
db = SQLAlchemy()
# initialize the app with the extension
db.init_app(cg_app)

mail = Mail(cg_app)

from app import views, models

if __name__ == "__main__":
    cg_app.run(debug=True)