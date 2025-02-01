
/**
 * @file Archivo con funciones necesarias para la lógica de los modos de juego.
 * @module gameController
 */


var color = "black"

/**
 * Pinta en el canvas segun las posición del ratón o el dedo.
 * @function draw
 * @param {int} clientX Posición X del ratón.
 * @param {int} clientY Posición Y del ratón.
 * @param {int} stroke Grosor del trazo.
 * @param {socket} socket Socket del cliente.
 */
export function draw(clientX, clientY, socket) {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    ctx.strokeStyle = color
    ctx.lineWidth = document.getElementById("strokeSlider").value
    ctx.lineCap = "round"
    ctx.lineTo(clientX - canvas.offsetLeft - 5, clientY - canvas.offsetTop - 5) //Restar offset para compensar la posicion del canvas
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(clientX - canvas.offsetLeft - 5, clientY - canvas.offsetTop - 5) //-5 para que pinte bien en la punta del cursor


    const image = canvas.toDataURL()
    //Socket != null porque en el modo de juego por tiempo no se manda este evento
    if(socket != null) socket.emit("sendImage", sessionStorage.getItem("roomCode"), sessionStorage.getItem("playerName"), image)
}



/**
 * Borra todo lo dibujado en el canvas.
 * @function clearCanvas
 */
export function clearCanvas() {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



/**
 * Cambia a la opción de dibujar.
 * @function paint
 */
export function paint() {
    color = "black"
    document.getElementById("paintButton").style = "box-shadow: inset 0.6vw 0.3vw 0.3vw black"
    document.getElementById("eraseButton").style = "box-shadow: 0.6vw 0.3vw 0.3vw black"

    const canvas = document.getElementById("canvas")
    canvas.style.cursor = "url('/pencil.cur'), auto"
}



/**
 * Cambia a la opción de borrar.
 * @function erase
 */
export function erase() {
    color = "white"
    document.getElementById("paintButton").style = "box-shadow: 0.6vw 0.3vw 0.3vw black"
    document.getElementById("eraseButton").style = "box-shadow: inset 0.6vw 0.3vw 0.3vw black"

    const canvas = document.getElementById("canvas")
    canvas.style.cursor = "url('/eraser.cur'), auto"
}


/**
 * Envía una imagen en base 64 y recibe el nombre del dibujo.
 * @function validImage
 * @param {socket} socket Socket del cliente.
 * @param {string} goal Doodle que hay que adivinar.
 * @param {string} playersCount Cantidad de jugadores restantes y totales de la ronda (X/X).
 * @param {function} setLostRound Función que cambia el valor del estado lostRound.
 * @param {function} setWin Función que cambia el valor del estado win.
 */
export function validImage(socket, goal, playersCount, setLostRound, setWin) {

    const url = sessionStorage.getItem("url")
    const http = new XMLHttpRequest()

    const canvas = document.getElementById("canvas")
    const image = canvas.toDataURL().split(",")[1];

    const formData = new FormData();
    formData.append("imageEncoded", image);

    http.open("POST", url + "/validImage");
    http.send(formData);
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const result = http.responseText;

            //Si la palabra objetivo coincide con la validada
            if (goal == result.split(":")[0]) {

                if(localStorage.getItem("userName") != null){
                    const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
                    http.open("PUT", dataBaseUrl + "/guessedDoodles?userName=" + localStorage.getItem("userName"));
                    http.send();
                }

                socket.emit("correctDoodle", sessionStorage.getItem("roomCode"), sessionStorage.getItem("playerName"))

                //Si entra aqui es porque ha ganado la partida y no pasa a la sala de fin de ronda
                if (playersCount == "2/2") { //Solo quedan 2 y este jugador ha adivinado el doodle
                    socket.emit("endGame", sessionStorage.getItem("roomCode"), sessionStorage.getItem("playerName"))
                    setWin(true)

                }else {
                    //Cambia de estado para irse a la pantalla para ver a los demas jugadores
                    setLostRound(false)
                }

            }else{
                //Entra si no coincide la palabra con el objetivo
                const resultLabel = document.getElementById("result")
                if(resultLabel) resultLabel.innerHTML = result;
            }
        }
    }
}


/**
 * Cambia las dimensiones de los canvas de los demás jugadores en función de la cantidad de ellos que siguen jugando.
 * @function rescaleCanvas
 * @param {int} activePlayers Número de jugadores que siguen jugando en esa ronda.
 */
export function rescaleCanvas(activePlayers) {

    //Ajuste para redimensionar los canvas en funcion del numero de jugadores
    var ajust = 0.3
    if (activePlayers > 3) ajust = 1.8

    const size = window.innerHeight / (1.6 + ajust)

    for (let item of document.getElementsByClassName("playerCanvas")) {
        item.height = size
    }

    for (let item of document.getElementsByTagName("label")) {
        item.style.fontSize = `${size / 6}px`
    }

    if (activePlayers < 4) {
        const allCanvas = document.getElementById("allCanvas")
        allCanvas.style.marginTop = "5vh"

        for (let item of document.getElementsByClassName("playerScreen")) {
            item.style.marginLeft = "2vw"
            item.style.marginRight = "2vw"
        }
    }
}