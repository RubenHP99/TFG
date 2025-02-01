import { useEffect, useState } from 'react'
import * as func from "../controller/menuController.js"
import { CreateRoom } from "./createRoom.jsx"
import { Loading } from './loading.jsx'
import { Login } from './login.jsx'
import { Profile } from './profile.jsx'
import Swal from 'sweetalert2'


/**
 * @file Menu principal de la aplicación.
 * @module menu
 */

/**
 * Componente que carga los elementos html del menu principal.
 * @function Menu
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function Menu({ socket }) {
    const [deployedOptions, setDeployedOptions] = useState(false)
    const [nightTheme, setNightTheme] = useState(sessionStorage.getItem("nightTheme") === "true")
    const [correctPlayerName, setCorrectPlayerName] = useState(false)
    const [correctRoomCode, setCorrectRoomCode] = useState(false)
    const [freeRoom, setFreeRoom] = useState(false)
    const [createRoomGo, setCreateRoomGo] = useState(false)
    const [loadingGo, setLoadingGo] = useState(false)
    const [loginGo, setLoginGo] = useState(false)
    const [profileGo, setProfileGo] = useState(false)
    const [logged, setLogged] = useState(localStorage.getItem("userName") != null)


    //Solo se ejecuta cuando se carga el componente o hay un cambio en deployedOptions
    useEffect(() => {
        func.openFullscreen()
        func.deployOptions(deployedOptions)
    }, [deployedOptions])


    //Solo se ejecuta cuando se carga el componente o hay un cambio en nightTheme
    useEffect(() => {
        sessionStorage.setItem("nightTheme", nightTheme)
        func.changeTheme(nightTheme)
    }, [nightTheme])


    //Cambia el estado disabled de los botones en funcion de los inputs
    useEffect(() => {
        document.getElementById("joinButton").disabled = !(correctPlayerName && correctRoomCode && !freeRoom)
        document.getElementById("createButton").disabled = !(correctPlayerName && correctRoomCode && freeRoom)
    }, [correctPlayerName, correctRoomCode, freeRoom])


    //Este bloque solo se renderiza una vez
    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()


        socket.on("checkPlayerNameResult", (result, playerNameParam, roomCodeParam) => {
            const playerNameInput = document.getElementById("playerName")

            //Comprobar undefined para evitar que entre aqui durante la pantalla de carga
            if (playerNameInput != undefined) {
                if (result != null) { //Respuesta del servidor
                    playerNameInput.style.borderBottomColor = result ? "green" : "red"
                    setCorrectPlayerName(result)

                    if (!result) {
                        Swal.fire(
                            'ERROR',
                            'Player name already exists',
                            'error'
                        )
                    }

                } else { //Broadcast de otro cliente (desde el servidor)
                    const roomCodeInput = document.getElementById("roomCode")

                    const playerNameValue = playerNameInput.value.split(" ").join("_")
                    const roomCodeValue = roomCodeInput.value.split(" ").join("_")

                    const equalPlayerName = playerNameValue == playerNameParam
                    const equalRoomCode = roomCodeValue == roomCodeParam

                    if (equalPlayerName && equalRoomCode) {
                        playerNameInput.style.borderBottomColor = "red"
                        setCorrectPlayerName(false)

                        Swal.fire(
                            'ERROR',
                            'Player name already exists',
                            'error'
                        )
                    }
                }
            }
        })


        socket.on("checkRoomCodeResult", (result, roomCodeParam) => {
            const roomCodeInput = document.getElementById("roomCode")

            if (roomCodeParam != null) { //Broadcast de otro cliente (desde el servidor)
                if (roomCodeInput.value == roomCodeParam) {
                    setCorrectRoomCode(result != null)
                    setFreeRoom(result != false)
                    if (result == false) roomCodeInput.style.borderBottomColor = "black"
                }

            } else { //Respuesta del servidor
                roomCodeInput.style.borderBottomColor = result == "FULL" ? "red" : "black"
                setCorrectRoomCode(result == false || result == true)
                setFreeRoom(result == true)

                if (result == "CREATING") {
                    Swal.fire(
                        'WAIT PLEASE',
                        'The room is been creating',
                        'info'
                    )
                }

                if (result == "FULL") {
                    Swal.fire(
                        'ERROR',
                        'The room is full',
                        'error'
                    )
                }
            }
        })
    }, [])


    if (loadingGo) return (<Loading socket={socket} />)
    if (createRoomGo) return (<CreateRoom socket={socket} />)
    if (profileGo) {
        func.openFullscreen()
        return (<Profile socket={socket} />)
    }

    if (loginGo) {
        func.openFullscreen()
        return (<Login socket={socket} />)
    }
    

    return (
        <>
            <img id="gameLogo" src="/logoWeb.png" />
            <div id="initialMenu">
                <div>
                    <input id="playerName" className="textInput" type="text" placeholder="NAME" maxLength="8" autoComplete="off" onFocus={() => func.openFullscreen()} onInput={() => func.checkInputs(socket, setCorrectPlayerName, setCorrectRoomCode)} />
                    <input id="roomCode" className="textInput" type="text" placeholder="ROOM CODE" maxLength="8" autoComplete="off" onFocus={() => func.openFullscreen()} onInput={() => func.checkInputs(socket, setCorrectPlayerName, setCorrectRoomCode)} />
                </div>

                <div>
                    <button id="joinButton" className="simpleButton" onClick={() => func.joinCreateRoom(socket, setLoadingGo)}>JOIN ROOM</button>
                    <button id="createButton" className="simpleButton" onClick={() => func.joinCreateRoom(socket, setCreateRoomGo)}> CREATE ROOM</button>
                </div>
            </div>

            <div id="options">
                <button id="configButton" className="optionButton" onClick={() => setDeployedOptions(!deployedOptions)}><img id="configButtonImg" src="/config.png" /></button>
                <div id="deployOptions">
                    <button id="themeButton" className="optionButton" onClick={() => setNightTheme(!nightTheme)}><img id="themeButtonImg" src={nightTheme ? "/sun.png" : "/moon.png"} /></button>
                    <button id="loginButton" className="optionButton" onClick={() => func.login(logged, setLogged, setLoginGo)}><img id="loginButtonImg" src={logged ? "/logout.png" : "/login.png"} /></button>
                    <button id="profileButton" className="optionButton" disabled={!logged} onClick={() => setProfileGo(true)}><img id="profileButtonImg" src="/profile.png" /></button>
                </div>
            </div>
        </>
    )

}