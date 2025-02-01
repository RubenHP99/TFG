import { useState, useEffect } from 'react'
import { HillChampion } from './hillChampion'
import { TimesUp } from './timesUp'
import { EndGame_timesUp } from './endGame_timesUp'


/**
 * @file Pantalla de carga mientras se llena la sala.
 * @module loading
 */


/**
 * Componente que carga los elementos html de la pantalla de carga.
 * @function Loading
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function Loading({ socket, time }) {

    const [gameModeGo, setGameModeGo] = useState(-1)
    const [endGameGo, setEndGameGo] = useState(false)

    const gameModes = [<HillChampion socket={socket} />, <TimesUp socket={socket} />]


    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()


        //Muestra el contador actual de jugadores listos. 
        //Si estan todos listos empieza la siguiente ronda del modo de juego correspondiente.
        socket.on("playersReady", (actualPlayers, totalPlayers, gameModeParam) => {
            document.getElementById("playersReady").innerText = `PLAYERS READY : ${actualPlayers}/${totalPlayers}`

            if (actualPlayers == totalPlayers) setGameModeGo(gameModeParam)
        })


        //Envía al jugador a la pantalla final del juego
        socket.on("endGame", () => {
            setEndGameGo(true)
        })


        //Si esta en el modo de juego por tiempo, notifica al socketServer que esta listo para la siguiente ronda
        //En el modo de juego de suddenDeath el jugador esta listo cuando se une a la sala
        if (time) socket.emit("ready", sessionStorage.getItem("roomCode"))

    }, [])


    if (gameModeGo != -1) return (gameModes[gameModeGo])
    if (endGameGo) return (<EndGame_timesUp socket={socket}/>)


    return (
        <>
            <img id="loadingGif" src="loading.gif" />
            <label id="playersReady"></label>
        </>
    )

}