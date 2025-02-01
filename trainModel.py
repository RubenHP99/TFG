import numpy as np #Tratamiento de arrays grandes
import os #Funciones relacionadas con el sistema operativo
from PIL import Image, ImageOps #Transformar array en imagen
import random
import splitfolders
from ultralytics import YOLO
import shutil

def createDataSet(max_items, train_rate, path="numpy_bitmaps"):

    #Borra el dataset anterior antes de crear uno nuevo
    if os.path.isdir("dataset"):
        shutil.rmtree("dataset")

    for file in os.listdir(path):

        className = file.split(".")[0] #quita .npy
        if not os.path.isdir("images/"+className):
            os.makedirs("images/"+className) #Crea directorios para cada doodle

        doodle = np.load(f"{path}/{file}")[0:max_items] #Carga el archivo y limita el numero de elementos a max_items

        index = 0
        for i in doodle:
            img = Image.fromarray(np.reshape(i, (28,28))) #Obtiene una imagen a partir de la matriz de valores
            img = ImageOps.invert(img) #Convierte la imagen en negativo
            img = img.resize((32,32)) #Para utilizar yolo las imagenes deben ser multiplos de 32
            img.save(f"images/{className}/{className+str(index)}.png")
            index += 1


    #Crea las carpetas de dataset, train y val y realiza el split de datos
    splitfolders.ratio("images", output="dataset", seed=random.randint(1000,2000), ratio=(train_rate, 1-train_rate), group_prefix=None, move=True)

    #Esta carpeta sobra, el dataset ya esta creado
    shutil.rmtree("images")



max_items = 1000
train_rate = 0.8
model_name = "yolov8x-cls"
epochs = 100

createDataSet(max_items=max_items, train_rate=train_rate)

model = YOLO(model_name)
model.train(data="dataset", epochs=epochs, imgsz=32)


