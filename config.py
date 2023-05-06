import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY')
    TEMPLATES_AUTO_RELOAD = os.environ.get('TEMPLATES_AUTO_RELOAD') 
    # configure the MySQL database
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = os.environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
    SESSION_PERMANENT = os.environ.get('SESSION_PERMANENT') 