from flask import Flask, request
from PIL import Image
from ultralytics import YOLO
import io, base64
from flask_cors import CORS
import random


app = Flask(__name__)
CORS(app)
model = YOLO("trainedModel.pt")

#Valida una imagen cualquiera al ejecutar el lanzar el servidor para que despues no tarde en validar
model(Image.open("./app/public/config.png"))

@app.route("/")
def getDoodles():
    """
    Devuelve una lista con los todos los nombres de los dibujos que puede adivinar la red neuronal.
    """
    return model.names


#Devuelve un conjunto de nombres de doodles sin repetir.
@app.route("/getDoodlesList", methods = ["POST"])
def getDoodlesList():
    """
    Devuelve un conjunto de nombres de dibujos sin repetir.

        Parámetros:
            numberDoodles (int): Tamaño de la lista a crear

        Retorno: 
            doodlesSet (set): Conjunto de dibujos sin repetir
    """

    numberDoodles = int(request.form["numberDoodles"])
    doodlesSet = set()

    while len(doodlesSet) < numberDoodles:
        doodlesSet.add(model.names[random.randint(0, len(model.names)-1)])

    return list(doodlesSet)


#Devuelve el nombre y el porcentaje de precision de la imagen que se pasa por parametro.
@app.route("/validImage", methods = ["POST"])
def validImage():
    """
    Devuelve el nombre y el porcentaje de precisión de la imagen que se pasa por parámetro.

        Parámetros:
            imgEncoded (str base64): Imagen codificada en base64

        Retorno:
            (str): String con la información de la imagen validada y su porcentaje de precisión
    """

    imgEncoded = request.form["imageEncoded"]

    image = base64.b64decode(imgEncoded)
    image = Image.open(io.BytesIO(image))

    image = image.resize((32,32))
    results = model(image)

    best_index = results[0].probs.top1
    best_accuracy = int(results[0].probs.top1conf.item()*100)
    best_name = results[0].names[best_index]

    # Si se envia el lienzo vacío detecta "bread" con un 10%
    if best_name == "bread" and best_accuracy == 10: return "Empty"

    return best_name+": "+str(best_accuracy)+"%"
    


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)