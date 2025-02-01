import { useState, useEffect } from 'react'
import { Loading } from '../view/loading'
import * as func from "../controller/gameController.js"



/**
 * @file Pantalla de espera donde se ve los dibujos de los demás jugadores del modo de juego Time's Up.
 * @module endRound_timesUp
 */




/**
 * Componente que carga los elementos html de fin de ronda del modo de juego Time's Up.
 * @function EndRound_timesUp
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function EndRound_timesUp({ socket }) {

    const [nextRoundGo, setNextRoundGo] = useState(false)

    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        //Pide al socketServer el diccionario de cada jugador con su dibujo de la ronda
        socket.emit("getPlayerDoodles", sessionStorage.getItem("roomCode"))

        //Muestra en pantalla todos los dibujos de la ronda con el nombre de los jugadores
        socket.on("getPlayerDoodlesResult", (result) => {

            //Para que no se pongan varias veces las imagenes
            document.getElementById("allCanvas").innerHTML = ""

            for (const [key, value] of Object.entries(result)) {

                const playerScreen = document.createElement("div")
                playerScreen.setAttribute("class", "playerScreen")

                const playerName = document.createElement("label")
                playerName.innerText = key

                const playerCanvas = document.createElement("img")
                playerCanvas.setAttribute("class", "playerCanvas")
                playerCanvas.setAttribute("src", value)
                playerCanvas.setAttribute("id", key)

                playerScreen.append(playerName)
                playerScreen.append(playerCanvas)

                document.getElementById("allCanvas").append(playerScreen)


                //Comprueba si el nombre coincide con el nombre del jugador
                if (key.split(":")[0] == sessionStorage.getItem("playerName")) {

                    //Comprueba si ha conseguido puntos y esta logueado
                    if (key.split(":")[1] != " +0" && localStorage.getItem("userName") != null) {
                        const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
                        const http = new XMLHttpRequest()
                        http.open("PUT", dataBaseUrl + "/guessedDoodles?userName=" + localStorage.getItem("userName"));
                        http.send();
                    }
                }
            }

            func.rescaleCanvas(Object.keys(result).length)
        })

    }, [])


    if (nextRoundGo) return (<Loading socket={socket} time={true} />)


    return (
        <>
            <h1 id="endRoundHeader">RESULTS:</h1>
            <div id="allCanvas" />
            <button id="nextRoundButton" className='optionButton' onClick={() => setNextRoundGo(true)}><img src='rightArrow.png' /></button>
        </>
    )

}