import { useState, useEffect } from 'react'
import * as func from "../controller/gameController.js"
import { EndRound_hillChampion } from './endRound_hillChampion.jsx'
import { EndGame_hillChampion } from './endGame_hillChampion.jsx'


/**
 * @file Modo de juego de Hill Champion.
 * @module hillChampion
 */

/**
 * Componente que carga los elementos html del modo de juego Hill Champion.
 * @function HillChampion
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function HillChampion({ socket }) {

    var drawing = false
    const [goal, setGoal] = useState("")
    const [playersCount, setPlayersCount] = useState("")
    const [lostRound, setLostRound] = useState(null)
    const [win, setWin] = useState(false)

    //Bloque que solo se ejecuta al renderizar el componente por primera vez
    useEffect(() => {
        const canvas = document.getElementById("canvas")
        const ctx = canvas.getContext("2d")

        //Canvas responsive
        canvas.width = window.outerWidth / 2.4;
        canvas.height = canvas.width;

        //Si se cambia el fondo en el css, la primera vez detecta mal el doodle
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        //Para que siempre pinte al inicio de cada turno
        func.paint()

        /**
         * Cambia el tamaño del canvas según las dimensiones de la ventana.
         * @event resize
         */
        window.addEventListener("resize", function (e) {
            canvas.width = window.outerWidth / 2.4
            canvas.height = canvas.width
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        });


        /**
         * Deja de pintar cuando se sale el ratón del canvas
         * @event mouseleave
         */
        canvas.addEventListener("mouseleave", function (e) {
            drawing = false;
            ctx.beginPath();
        });


        /**
         * Pinta cuando se hace click con el ratón.
         * @event mousedown
         */
        canvas.addEventListener("mousedown", function (e) {
            drawing = true
            func.draw(e.clientX, e.clientY, socket)
        });


        /**
         * Deja de pintar cuando no se hace click.
         * @event mouseup
         */
        canvas.addEventListener('mouseup', function (e) {
            drawing = false
            ctx.beginPath()
        });


        /**
         * Pinta cuando se mueve el ratón.
         * @event mousemove
         */
        canvas.addEventListener('mousemove', function (e) {
            if (drawing == true) func.draw(e.clientX, e.clientY, socket)
        });



        /**
         * Pinta cuando se toca la pantalla. Dispositivos táctiles.
         * @event touchstart
         */
        canvas.addEventListener("touchstart", function (e) {
            drawing = true
            func.draw(e.touches[0].clientX, e.touches[0].clientY, socket)
        });


        /**
         * Deja de pintar cuando se levanta el dedo de la pantalla. Dispositivos táctiles.
         * @event touchend
         */
        canvas.addEventListener('touchend', function (e) {
            drawing = false
            ctx.beginPath()
        });



        /**
         * Pinta cuando se mueve el dedo por la pantalla. Dispositivos táctiles.
         * @event touchmove
         */
        canvas.addEventListener('touchmove', function (e) {
            if (drawing == true) func.draw(e.touches[0].clientX, e.touches[0].clientY, socket)
        });


        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        socket.emit("getDoodle", sessionStorage.getItem("roomCode"))
        socket.emit("getTotalPlayers", sessionStorage.getItem("roomCode"))
        socket.emit("getPlayerNames", sessionStorage.getItem("roomCode"), false)

        socket.on("getDoodleResult", (result) => {
            setGoal(result)
        })


        socket.on("getTotalPlayersResult", (result) => {
            setPlayersCount(result)
        })


        socket.on("getPlayerNamesResult", (result) => {
            const playerList = document.getElementById("playerList")

            result.forEach(name => {
                const player = document.createElement("li")
                player.setAttribute("id", name)
                player.innerText = name
                playerList.append(player)
                if (name == sessionStorage.getItem("playerName")) player.style.color = "yellow"
            });
        })


        socket.on("correctDoodleResult", (result, actualPlayers, totalPlayers) => {

            //Es el ultimo jugador que pierde, tampoco va a la pantalla de fin de ronda
            if (actualPlayers == 1 && totalPlayers == 2) {
                setWin(true)

            } else {

                //Si actualPlayers es 1, el jugador ha perdido y va a otra pantalla
                if (actualPlayers == 1) {

                    //Enviar mensaje al servidor para indicar que ha perdido  
                    socket.emit("nextRound", sessionStorage.getItem("roomCode"), sessionStorage.getItem("playerName"))

                    setLostRound(true)

                } else {
                    document.getElementById(result).style.textDecoration = "line-through solid red 1vh"

                    setPlayersCount(actualPlayers + "/" + totalPlayers)
                }
            }

        })

    }, [])


    if (lostRound != null) return (<EndRound_hillChampion socket={socket} lostRound={lostRound} />)
    if (win) return (<EndGame_hillChampion socket={socket} />)

    return (
        <>
            <label id="goalLabel">GOAL:</label>
            <div className="container" id="goalContainer">
                <label id="goal">{`${goal}`} </label>
            </div>

            <div className="container" id="toolsContainer">
                <button id="eraseButton" className="simpleButton" onClick={func.erase}>ERASE</button>
                <button id="paintButton" className="simpleButton" onClick={func.paint}>PAINT</button>
                <input type="range" id="strokeSlider" min={5} max={20} defaultValue={13} />
                <hr />
                <button id="clearCanvas" className="simpleButton" onClick={func.clearCanvas}>CLEAR CANVAS</button>
            </div>

            <canvas id="canvas" />

            <div className="container" id="resultContainer">
                <button id="validButton" className="simpleButton" onClick={() => func.validImage(socket, goal, playersCount, setLostRound, setWin)}>VALID IMAGE</button>
                <label id="result">------------------------------</label>
            </div>

            <div id="names" className="container">
                <label id="playersCount">{`PLAYERS: ${playersCount}`}</label>
                <ul id="playerList"></ul>
            </div>

        </>
    )
}