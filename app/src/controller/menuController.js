
/**
 * @file Archivo con funciones necesarias para la lógica de menu.jsx.
 * @module menuController
 */



/**
 * Pone el dispositivo a pantalla completa.
 * @function openFullscreen
 */
export function openFullscreen() {
    if (window.outerWidth < 1000) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }
}


/**
 * Comprueba que los datos de los text inputs son correctos antes de enviarlos al servidor de socket.io.
 * @function checkInputs
 * @param {socket} socket El socket del cliente que carga la página.
 * @param {function} setCorrectPlayerName Función que cambia el estado de correctPlayerName.
 * @param {function} setCorrectRoomCode Función que cambia el estado de correctRoomCode.
 */
export function checkInputs(socket, setCorrectPlayerName, setCorrectRoomCode) {
    const playerNameInput = document.getElementById("playerName")
    const roomCodeInput = document.getElementById("roomCode")

    var playerNameValue = playerNameInput.value.split(" ").join("_")
    var roomCodeValue = roomCodeInput.value.split(" ").join("_")

    //Comprobar si el codigo es un numero antes
    //Al cambiar los espacios en blanco por _, ya no se considera un numero y isNan devuelve true
    if (roomCodeValue == "" || isNaN(roomCodeValue)) {
        roomCodeInput.value = ""
        roomCodeValue = ""
        roomCodeInput.style.borderBottomColor = "red"
        setCorrectRoomCode(false)
        playerNameInput.style.borderBottomColor = "black"

    } else { //Si entra es porque el codigo es un numero
        socket.emit("checkRoomCode", roomCodeValue)
    }


    if (playerName.value.trim() == "") {
        playerNameInput.value = ""
        playerNameValue = ""
        playerNameInput.style.borderBottomColor = "red"
        setCorrectPlayerName(false)
    } else if (roomCodeValue != "") {
        socket.emit("checkPlayerName", playerNameValue, roomCodeValue)
    }
}



/**
 * Une a un jugador a una determinada sala o la crea si no existe y cambia de componente (pantalla).
 * @function joinCreateRoom
 * @param {socket} socket El socket del cliente que carga la página.
 * @param {function} setScreenGo Función que cambia el estado de screenGo.
 */
export function joinCreateRoom(socket, setScreenGo) {

    var playerName = document.getElementById("playerName").value.split(" ").join("_")
    const roomCode = document.getElementById("roomCode").value

    sessionStorage.setItem("playerName", playerName); //Guarda el nombre del jugador en una variable de sesion.
    sessionStorage.setItem("roomCode", roomCode); //Guarda el codigo de la sala en una variable de sesion.

    socket.emit("joinRoom", playerName, roomCode)

    setScreenGo(true)
}



/**
 * Pliega o despliega el menú de opciones.
 * @function deployOptions
 * @param {boolean} deployedOptions Estado del menú desplegable.
 */
export function deployOptions(deployedOptions) {

    //Dependiendo del valor del estado deployedOptions, despliega o no el menu
    const options = document.getElementById("deployOptions")
    options.style.visibility = deployedOptions ? "visible" : "hidden";

    const configImg = document.getElementById("configButtonImg")
    var rotateOrientation = 45

    //Dependiendo de si el menu esta desplegado o no, gira hacia un sentido
    if (!deployedOptions) rotateOrientation = -45
    configImg.style = `rotate: ${rotateOrientation}deg; transition-duration: 500ms; transition-property: rotate;`
}



/**
 * Cambia al tema oscuro o claro.
 * @function changeTheme
 * @param {boolean} nightTheme Estado del modo oscuro del juego.
 */
export function changeTheme(nightTheme) {
    document.body.style.backgroundColor = nightTheme ? "gray" : "#00b7ff"
    document.body.style.color = nightTheme ? "white" : "black"

    for (const textInput of document.getElementsByClassName("textInput")) {
        textInput.style.color = nightTheme ? "white" : "black"
    }
}


/**
 * Controla el login del menú.
 * @function login
 * @param {boolean} logged Estado que indica si el usuario ha iniciado sesión.
 * @param {function} setLogged Función que controla el estado logged.
 * @param {function} setLoginGo Función que controla el estado loginGo.
 */
export function login(logged, setLogged, setLoginGo) {
    if (logged) {
        setLogged(false)
        localStorage.removeItem("userName")
    } else {
        setLoginGo(true)
        openFullscreen()
    }
}