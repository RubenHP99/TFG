import { useState, useEffect } from 'react'
import * as func from "../controller/gameController.js"
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { EndRound_timesUp } from './endRound_timesUp.jsx'


/**
 * @file Modo de juego de Time's Up.
 * @module timesUp
 */

/**
 * Componente que carga los elementos html del modo de juego Times's Up.
 * @function TimesUp
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function TimesUp({ socket }) {

    var drawing = false
    const [goal, setGoal] = useState("")
    const [playersCount, setPlayersCount] = useState("")
    const [time, setTime] = useState(0)
    const [endRoundGo, setEndRoundGo] = useState(false)
    const [fixOnCompleted, setFixOnCompleted] = useState(true) //Estado para arreglar que no se ejecute varias veces onComplete del timer

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
            func.draw(e.clientX, e.clientY, null)
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
            if (drawing == true) func.draw(e.clientX, e.clientY, null)
        });



        /**
         * Pinta cuando se toca la pantalla. Dispositivos táctiles.
         * @event touchstart
         */
        canvas.addEventListener("touchstart", function (e) {
            drawing = true
            func.draw(e, null)
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
            if (drawing == true) func.draw(e.touches[0].clientX, e.touches[0].clientY, null)
        });


        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        socket.emit("getDoodle", sessionStorage.getItem("roomCode"))
        socket.emit("getTotalPlayers", sessionStorage.getItem("roomCode"))
        socket.emit("getPlayerNames", sessionStorage.getItem("roomCode"), true)
        socket.emit("getTime", sessionStorage.getItem("roomCode"))

        //Almacena el doodle que hay que dibujar en la ronda
        socket.on("getDoodleResult", (result) => {
            setGoal(result)
        })

        //Devuelve el numero de jugaddores de la partida. Split porque los 2 numeros que devuelve son los mismo
        socket.on("getTotalPlayersResult", (result) => {
            setPlayersCount(result.split("/")[0])
        })


        //Devuelve una lista con el nombre y la puntuacion de los jugadores de la partida
        socket.on("getPlayerNamesResult", (result) => {
            const playerList = document.getElementById("playerList")

            result.forEach(namePoints => {
                const name = namePoints.split(":")[0]
                const player = document.createElement("li")
                player.setAttribute("id", name)
                player.innerText = namePoints
                playerList.append(player)
                if (name == sessionStorage.getItem("playerName")) player.style.color = "yellow"
            });
        })


        //Almacena el tiempo de la ronda
        socket.on("getTimeResult", (result) => {
            setTime(result)
        })

    }, [])


    if (endRoundGo) return (<EndRound_timesUp socket={socket} />)


    return (
        <>
            <label id="goalLabel">GOAL:</label>
            <div className="container" id="goalContainer">
                <label id="goal">{`${goal}`} </label>
            </div>

            <div id="timer">
                <CountdownCircleTimer
                    isPlaying
                    size={window.innerWidth / 6}
                    duration={time}
                    strokeWidth={window.innerWidth / 40}
                    colors={["#5CE91E ", "#F7B801", "#FF1100"]}
                    colorsTime={[time, time * 0.8, 0]}
                    onComplete={() => {

                        if (fixOnCompleted) {
                            setFixOnCompleted(false)

                            const canvas = document.getElementById("canvas")
                            const image = canvas.toDataURL()

                            const url = sessionStorage.getItem("url")
                            const http = new XMLHttpRequest()

                            const formData = new FormData();
                            formData.append("imageEncoded", image.split(",")[1]);

                            http.open("POST", url + "/validImage");
                            http.send(formData);
                            http.onreadystatechange = (e) => {
                                if (http.readyState == 4 && http.status == 200) { //Dato recibido correctamente
                                    const [doodle, points] = http.responseText.split(":")

                                    socket.emit("timeout", sessionStorage.getItem("roomCode"), sessionStorage.getItem("playerName"), image, doodle, parseInt(points))
                                    setEndRoundGo(true)

                                }
                            }

                        }


                    }}
                >
                    {({ remainingTime }) => remainingTime}
                </CountdownCircleTimer>
            </div>

            <div className="container" id="toolsContainer">
                <button id="eraseButton" className="simpleButton" onClick={func.erase}><b>ERASE</b></button>
                <button id="paintButton" className="simpleButton" onClick={func.paint}><b>PAINT</b></button>
                <input type="range" id="strokeSlider" min={5} max={20} defaultValue={13} />
                <hr />
                <button id="clearCanvas" className="simpleButton" onClick={func.clearCanvas}><b>CLEAR CANVAS</b></button>
            </div>

            <canvas id="canvas" />

            <div id="names" className="container">
                <label id="playersCount"><b>{`PLAYERS: ${playersCount}`}</b></label>
                <ul id="playerList"></ul>
            </div>

        </>
    )
}