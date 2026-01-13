from flask import Flask, render_template, sessions, redirect, request, jsonify
import psycopg2
import sys
import os
sys.path.append('./')
import database, register
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')
#Database details 
host = database.DB_HOST
name = database.DB_NAME 
password = database.DB_PASSWORD 
port = database.DB_PORT
dbUser = database.DB_USER

def getDbConnection():
    return psycopg2.connect(
            dbname = name,
            user = dbUser,
            host = host,
            password = password,
            port = port
            )
@app.route('/')
#this is the home page where people can chose to login sign up and start reading the bible
def home():
    return render_template('index.html')
#this will be the page where the user can login with a simple email and password
@app.route('/login')
def login():
    pass
#This will be the register page, all thats needed is an email and password
@app.route('/register')
def register():
    return render_template('register.html')

#route for accepting post requests
@app.route('/submit', methods=['POST'])
def submit():
    username = request.form.get('username') 
    email = request.form.get('email')
    password = request.form.get('password')
    confirmed = request.form.get('confirmed') 
    print(username, email, password, confirmed)
    register = register.register(username, email, password, confirmed)

    return render_template('index.html')
#this will be where they read the bible
@app.route('/read')
def read():
    pass
#debugging
@app.route('/healthcheck')
def healthcheck():
    return 'ok'

#Pulling books into list
@app.route('/api/books')
def api_books():
    conn = getDbConnection()
    cur = conn.cursor()
    cur.execute('''
        SELECT id, name FROM "KJV_books"
        ORDER BY id;
        ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    books = [
            {'id': row[0], 'name': row[1]}
            for row in rows
            ]
    conn = getDbConnection()
    cur = conn.cursor()
    cur.execute('''
        SELECT id, book_id, chapter, verse, text FROM "KJV_verses"
        ORDER BY id;
        ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    verses = [
            {'id': row[0], 'book_id': row[1], 'chapter': row[2], 'verse': row[3], 'text': row[4]}
            for row in rows
            ]
    combined = {}
    for book in books:
        combined[book['id']] = {
                'id': book['id'],
                'name': book['name'],
                'chapters': {}
                }
    for v in verses:
        book_id = v['book_id']
        chapter = v['chapter']
        if chapter not in combined[book_id]['chapters']:
            combined[book_id]['chapters'][chapter] = []
        
            
        combined[book_id]['chapters'][chapter].append({
                'number': v['verse'],
                'text': v['text']
                })

    for book in combined.values():
        for chap in book['chapters'].values():
            chap.sort(key=lambda x: x['number'])

    result = sorted(combined.values(), key=lambda b: b['id'])
    return jsonify(result)
if __name__ == '__main__':
    app.run(debug=True)
