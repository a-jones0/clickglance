# Foresight: A Calendar/To-Do App

from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p> Hello, World </p>"

if __name__ == "__main__":
    print("Inside the if statement")