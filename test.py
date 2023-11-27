
from flask import session,Flask

app = Flask(__name__)
app.secret_key = "123"

session["id"] = "asdf"
print(session["id"])
print(session)


session.pop('id', None)
print(session["id"])
print(session)
