from argon2 import PasswordHasher
import psycopg2
import database
ph = PasswordHasher 
def register(username, email, password, confirmed):

    if password == confirmed:
        #initial verification check, find a way to send a variable to js if passwords dont match
        print('passwords match')
        hashed = ph.hash(password) 
        #variables for the database connection
        host = database.DB_HOST
        name = database.USER_DB
        password = database.DB_PASSWORD
        port = database.PORT
        dbUser = database.DB_USER
        #setting the stage for the db connection NOTE TO SELF: switch to an imported function at some point for modularity
        def getDbConnection():
            return psycopg2.connect(
                    dbname = name,
                    user = dbUser,
                    host = host,
                    password = password,
                    port = port
                    )
        conn = getDbConnection()
        cur = conn.cursor()
        cur.execute('''SELECT user_id FROM users WHERE username = %s OR email = %s
                    ''', (username, email))
        exists = cur.fetchone()

        if exists:
            print('user already exists')
            cur.close()
            conn.close()
            return False
        else:
            cur.execute('''
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, %s) RETURNING user_id;
            ''', (username, email, hashed))

            user_id = cur.fetchone()[0]
            conn.commit()

            cur.close()
            conn.close()

            print(f'user registered with id {user_id}')
                    
    

    

