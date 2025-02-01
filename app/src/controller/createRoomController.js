

/**
 * @file Archivo con funciones necesarias para la lógica de createRoom.jsx.
 * @module createRoomController
 */



/**
 * Comprueba que los datos de configuración son correctos.
 * @function checkInputs
 * @returns {boolean} True si todos los campos son correctos.
 */
export function checkInputs() {
    var correctFields = true

    for (let textInput of document.getElementsByClassName("textInput")) {
        if (textInput.style.borderBottomColor != "green") correctFields = false
    }

    return correctFields
}



/**
 * Comprueba que el dato de un text input sea válido y su valor esté dentro de un rango.
 * @function validInput
 * @param {string} inputId Identificador del text input que se va a validar.
 * @returns {boolean} Devuelve el resultado de la funcion checkInputs().
 */
export function validInput(inputId) {
    const textInput = document.getElementById(inputId);
    var value = textInput.value.toUpperCase().split(" ").join("")

    //Diccionario con el rango de valores que tiene cada input
    const inputsDic = { "playersInput": { minRange: 2, maxRange: 6 }, "timeInput": { minRange: 10, maxRange: 30 }, "roundsInput": { minRange: 1, maxRange: 5 } }
    var color = "red";

    if(value == "" || isNaN(value)){
        textInput.value = ""
        value = ""
    }

    if (value >= inputsDic[inputId].minRange && value <= inputsDic[inputId].maxRange) color = "green";

    textInput.style.borderBottomColor = color

    return checkInputs()
}



/**
 * Termina de configurar el modo de juego seleccionado.
 * @function prepareGame 
 * @param {socket} socket El socket del cliente que carga la página.
 * @param {function} setGameLoadingGo Función que cambia el estado de gameLoadingGo.
 * @param {int} gameMode Número del modo de juego.
 */
export function prepareGame(socket, setGameLoadingGo, gameMode) {

    const roomCode = sessionStorage.getItem("roomCode")
    const playersValue = document.getElementById("playersInput").value
    var timeValue = 0
    var roundsValue = 0
    var doodleAmount = playersValue - 1

    if (gameMode == 1) {
        timeValue = document.getElementById("timeInput").value
        roundsValue = document.getElementById("roundsInput").value
        doodleAmount = roundsValue
    }


    const url = sessionStorage.getItem("url")
    const http = new XMLHttpRequest();

    const formData = new FormData();
    formData.append("numberDoodles", doodleAmount);

    //Obtener un conjunto de doodles sin repetir
    http.open("POST", url + "/getDoodlesList")
    http.send(formData);
    http.onreadystatechange = (e) => {
        if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
            const doodles = JSON.parse(http.response) //Formatea el resultado de la peticion web para obtener una lista.
            socket.emit("addOptions", roomCode, playersValue, timeValue, roundsValue, gameMode, doodles)
        }
    }

    setGameLoadingGo(true)
}