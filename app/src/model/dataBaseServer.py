from flask import Flask, request
from flask_cors import CORS
import sqlite3
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import smtplib
import bcrypt
import datetime


app = Flask(__name__)
CORS(app)

con = sqlite3.connect("users.sqlite")
cur = con.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS User(name VARCHAR(10) PRIMARY KEY, password VARCHAR(255), email VARCHAR(255), validCode INT, playedGames INT DEFAULT 0, winnedGames INT DEFAULT 0, guessedDoodles INT DEFAULT 0, lastGame DATE DEFAULT '00/00/0000')")


#Leer la contraseña de aplciación para enviar correos de un archivo oculto
passPath = ".password.txt"
with open(passPath, "r") as file:
    password = file.read() # Contraseña de aplicacion


@app.route("/addUser", methods = ["POST"])
def addUser():
    """
    Añade un usuario a la base de datos.

    Parámetros:
        name (str): String con el nombre del usuario
        password (str): String con la contraseña del usuario
        email (str): String con el correo del usuario

    Retorno:
        (str): Devuelve "ERROR" si el usuario ya existe,
        "OK" si se almacena el nuevo usuario correctamente
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    name = request.form["name"]
    password = request.form["password"]
    email = request.form["email"]
    validCode = random.randint(10000, 99999)

    cur.execute(f"SELECT name from User  WHERE name='{name}'")
    if cur.fetchall() != []: return "ERROR" #El usuario ya existe y no se puede registrar

    #Genera la contraseña encriptada
    hashedPassword = str(bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())).split("'")[1]

    cur.execute(f"INSERT INTO User (name, password, email, validCode) VALUES('{name}', '{hashedPassword}', '{email}', '{validCode}')")
    con.commit()

    sendMail(name, email, "validation code", f"This is your validation code: {validCode}")

    return "OK"




#POST porque se manda informacion sensible como la contraseña
@app.route("/login", methods = ["POST"])
def login():
    """
    Comprueba las credenciales de acceso para el inicio de sesión.

    Parámetros:
        name (str): String con el nombre del usuario
        password (str): String con la contraseña del usuario

    Retorno:
        (str): Devuelve "NOUSER" si el nombre y contraseña no se corresponde con ningun usuario, 
        "NOVAL" si los datos son correctos pero el usuario no ha validado la cuenta,
        "OK" si se almacena el nuevo usuario correctamente
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.form["name"]
    password = request.form["password"]


    cur.execute(f"SELECT password FROM User WHERE name='{userName}'")
    result = cur.fetchall()

    #Si no existe usuario no devuelve ninguna contraseña
    if result == []: return "NOUSER"

    hashedPass = result[0][0]
    if not bcrypt.checkpw(password.encode('utf-8'), hashedPass.encode('utf-8')): return "NOUSER"

    cur.execute(f"SELECT validCode FROM User WHERE name='{userName}' and password='{hashedPass}'")
    result = cur.fetchall()[0][0]
    
    if result != 0: return "NOVAL"

    return "OK"



@app.route("/forgetPass", methods = ["PUT"])
def forgetPass():
    """
    Calcula una nueva contraseña para el usuario y la envía por correo.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        (str): Devuelve "ERROR" si no existe el usuario, 
        "OK" si se ha completado el proceso correctamente
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.args.get("userName")

    randomPassword = ""

    #Devuelve error si no existe el usuario
    cur.execute(f"SELECT name FROM User WHERE name='{userName}'")
    if cur.fetchall() == []: return "ERROR"


    #Genera 5 letras en mayusula
    for i in range(5): randomPassword += chr(random.randint(65,90))

    #Genera 5 numeros
    for i in range(5): randomPassword += chr(random.randint(48,57))

    #Crea una contraseña encriptada a partir de la nueva generada
    hashedPassword = str(bcrypt.hashpw(randomPassword.encode('utf-8'), bcrypt.gensalt())).split("'")[1]

    cur.execute(f"UPDATE User SET password='{hashedPassword}' WHERE name='{userName}'")
    con.commit()

    #Obtener correo para enviar la nueva contraseña (sin encriptar)
    cur.execute(f"SELECT email FROM User WHERE name='{userName}'")
    receiver = cur.fetchall()[0][0]

    subject = "Forgotten password"
    body = f"This is your new password: {randomPassword}. Change it as soon as posible."

    sendMail(userName, receiver, subject, body)

    return "OK"




@app.route("/validAccount", methods = ["PUT"])
def validAccount():
    """
    Completa el proceso de registro con el codigo de validacion que introduce el usuario.

    Parámetros:
        userName (str): String con el nombre del usuario
        validCode (str): String con el código de validación para completar el proceso de registro

    Retorno:
        (str): Devuelve "INCORRECT" si el código no es válido, 
        "OK" en caso contrario
    """

    userName = request.form["userName"]
    validCode = int(request.form["validCode"])

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()
    cur.execute(f"SELECT validCode FROM User WHERE name='{userName}'")
    result = cur.fetchall()[0][0]

    if result == validCode: 
        cur.execute(f"UPDATE User SET validCode=0 WHERE name='{userName}'")
        con.commit()
        return "OK"
    
    return "INCORRECT"




@app.route("/getStats", methods = ["GET"])
def getStats():
    """
    Devuelve las estadísticas de un usuario para que sean consultadas en su perfil.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        result (str): Devuelve todas las estadísticas del usuario
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.args.get("userName")

    cur.execute(f"SELECT playedGames, winnedGames, guessedDoodles, lastGame FROM User WHERE name='{userName}'")
    result = list(cur.fetchall()[0])

    return result



@app.route("/changePassword", methods = ["POST"])
def changePassword():
    """
    Cambia la contraseña de un usuario y se lo notifica por correo.

    Parámetros:
        userName (str): String con el nombre del usuario
        oldPass (str): String con la contraseña actual que se va a modificar
        newPass (str): String con la contraseña nueva

    Retorno:
        (str): Devuelve "INCORRECT" si la contraseña actual pasada a la funcion no corresponde con la del usuario, 
        "OK" si se ha modificado la contraseña correctamente
    """
        
    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.form["userName"]
    oldPass = request.form["oldPass"]
    newPass = request.form["newPass"]

    #Comprobar que la contraseña antigua sea la que ya esta guardada
    cur.execute(f"SELECT password from User WHERE name='{userName}'")
    hashedPassword = cur.fetchall()[0][0]

    #Error si la contraseña introducida no es la misma que la de ese usuario en la base de datos
    if not bcrypt.checkpw(oldPass.encode('utf-8'), hashedPassword.encode('utf-8')): return "INCORRECT"


    hashedPassword = str(bcrypt.hashpw(newPass.encode('utf-8'), bcrypt.gensalt())).split("'")[1]


    cur.execute(f"UPDATE User SET password='{hashedPassword}' WHERE name='{userName}'")
    con.commit()

    cur.execute(f"SELECT email FROM User WHERE name='{userName}'")
    receiver = cur.fetchall()[0][0]

    subject = "Password changed"
    body = "Your password has been changed."
    sendMail(userName, receiver, subject, body)

    return "OK"



@app.route("/changeEmail", methods = ["PUT"])
def changeEmail():
    """
    Cambia el correo de un usuario y se lo notifica al nuevo correo.

    Parámetros:
        userName (str): String con el nombre del usuario
        newEmail (str): String con la dirección de correo nueva

    Retorno:
        (str): "OK" si se ha modificado el correo correctamente
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.form["userName"]
    newEmail = request.form["newEmail"]

    cur.execute(f"UPDATE User SET email='{newEmail}' WHERE name='{userName}'")
    con.commit()

    subject = "E-mail changed"
    body = "This is your new e-mail for Doodle a doodle."
    sendMail(userName, newEmail, subject, body)

    return "OK"



@app.route("/deleteAccount", methods = ["DELETE"])
def deleteAccount():
    """
    Borra la cuenta de un usuario y se lo notifica por correo.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        (str): "OK" si se ha eliminado la cuenta del usuario
    """
        
    userName = request.args.get("userName")

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    cur.execute(f"SELECT email FROM User WHERE name='{userName}'")
    receiver = cur.fetchall()[0][0]

    #Envia un correo notificando el borrado de la cuenta
    subject = "Deleted account"
    body = "Your Doodle a doodle account has been deleted."
    sendMail(userName, receiver, subject, body)

    cur.execute(f"DELETE FROM User WHERE name='{userName}'")
    con.commit()

    return "OK"



@app.route("/guessedDoodles", methods = ["PUT"])
def guessedDoodles():
    """
    Modifica el valor del campo "guessedDoodles" de un usuario.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        (str): "OK" si se ha modificado correctamente el campo
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.args.get("userName")

    cur.execute(f"SELECT guessedDoodles FROM User WHERE name='{userName}'")
    guessedDoodles = int(cur.fetchall()[0][0]) + 1

    cur.execute(f"UPDATE User SET guessedDoodles='{guessedDoodles}' WHERE name='{userName}'")
    con.commit()

    return "OK"




@app.route("/winnedGames", methods = ["PUT"])
def winnedGames():
    """
    Modifica el valor del campo "winnedGames" de un usuario.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        (str): "OK" si se ha modificado correctamente el campo
    """

    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.args.get("userName")

    cur.execute(f"SELECT winnedGames FROM User WHERE name='{userName}'")
    winnedGames = int(cur.fetchall()[0][0]) + 1

    cur.execute(f"UPDATE User SET winnedGames='{winnedGames}' WHERE name='{userName}'")
    con.commit()

    return "OK"



@app.route("/playedGamesLastGame", methods = ["PUT"])
def playedGamesLastGame():
    """
    Modifica el valor de los campos "playedGames" y "LastGame" de un usuario.

    Parámetros:
        userName (str): String con el nombre del usuario

    Retorno:
        (str): "OK" si se han modificado correctamente los campos
    """
    
    con = sqlite3.connect("users.sqlite")
    cur = con.cursor()

    userName = request.args.get("userName")

    cur.execute(f"SELECT playedGames FROM User WHERE name='{userName}'")
    playedGames = int(cur.fetchall()[0][0]) + 1

    dateNow = datetime.datetime.now()
    lastGame = f"{dateNow.day}/{dateNow.month}/{dateNow.year}"

    cur.execute(f"UPDATE User SET playedGames='{playedGames}', lastGame='{lastGame}' WHERE name='{userName}'")
    con.commit()

    return "OK"



def sendMail(userName, receiver, subject, body):
    """
    Envía un correo electrónico a un usuario.

    Parámetros:
        userName (str): String con el nombre del usuario
        receiver (str): String con la dirección del correo
        subject (str): String con el asunto del correo
        body (str): String con el cuerpo del correo
    """

    sender = None # Correo electronico del emisor

    html = f"""\
    <html>
        <body>
            <img src="cid:0">
            <h1>Hi {userName},</h1>
            <h2>{body}</h2>
        </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["From"] = sender
    message["To"] = receiver
    message["subject"] = subject

    message.attach(MIMEText(html, "html"))

    img = MIMEImage(open("app/public/logoEmail.png", 'rb').read())
    img.add_header("Content-ID", "<0>")
    message.attach(img)

    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(sender, password)
    server.send_message(message)
    server.quit()



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8003)