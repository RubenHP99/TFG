import { useState, useEffect } from 'react'
import { HillChampion } from './hillChampion'
import { EndGame_hillChampion } from './endGame_hillChampion'
import * as func from "../controller/gameController.js"



/**
 * @file Pantalla de espera donde se ve los dibujos de los demás jugadores del modo de juego Hill Champion.
 * @module endRound_hillChampion
 */




/**
 * Componente que carga los elementos html de fin de ronda del modo de juego Hill Champion.
 * @function EndRound_hillChampion
 * @param {socket} socket El socket del cliente que carga la página.
 * @param {boolean} lostRound Indica si el jugador ha acertado el doodle o ha perdido la ronda.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function EndRound_hillChampion({ socket, lostRound }) {

    const [nextRoundGo, setNextRoundGo] = useState(false)
    const [endGameGo, setEndGameGo] = useState(false)

    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        socket.emit("getActivePlayers", sessionStorage.getItem("roomCode"))

        socket.on("nextRoundResult", () => {
            setNextRoundGo(true)
        })


        socket.on("endGameResult", () => {
            setEndGameGo(true)
        })


        socket.on("getActivePlayersResult", (result) => {

            result.forEach(name => {
                const playerScreen = document.createElement("div")
                playerScreen.setAttribute("class", "playerScreen")

                const playerName = document.createElement("label")
                playerName.innerText = name

                const playerCanvas = document.createElement("img")
                playerCanvas.setAttribute("class", "playerCanvas")
                playerCanvas.setAttribute("src", "emptyCanvas.png")
                playerCanvas.setAttribute("id", name)

                playerScreen.append(playerName)
                playerScreen.append(playerCanvas)

                document.getElementById("allCanvas").append(playerScreen)

            });

            func.rescaleCanvas(result.length)

        })


        socket.on("sendImageResult", (playerName, image) => {
            const playerCanvas = document.getElementById(playerName)
            playerCanvas.setAttribute("src", image)
        })

    }, [])


    if (nextRoundGo) return (<HillChampion socket={socket} />)
    if (endGameGo) return (<EndGame_hillChampion socket={socket} />)


    return (
        <>
            <h1 id="roundState">{lostRound ? "YOU LOST" : "CORRECT DOODLE"}</h1>
            <div id="allCanvas" />
        </>
    )

}