import { useState, useEffect } from "react"


/**
 * @file Pantalla final donde se muestra el ranking de los jugadores del modo de juego Time's Up.
 * @module endGame_timesUp
 */


/**
 * Componente que carga los elementos html de la pantalla de fin del juego del modo Time's Up.
 * @function EndGame_timesUp
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function EndGame_timesUp({ socket }) {

    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        socket.emit("getRanking", sessionStorage.getItem("roomCode"))

        socket.on("getRankingResult", (result) => {

            const rankingList = document.getElementById("rankingList")
            var star = null

            result.forEach((playerRanking, index) => {
                const player = document.createElement("li")
                const fontSize = 4 - index*0.5 //Cambia el tamaño del elemento de la lista en funcion de su posicion

                for (let i = 0; i < 3 - index; i++) {
                    star = document.createElement("img")
                    star.style.height = fontSize + "vw"
                    star.src = "/star.gif"
                    player.append(star)
                }

                const playerName = document.createElement("label")
                playerName.style.margin = "1% 2%"
                playerName.setAttribute("id", "pos" + index) //Dependiendo de la posicion el texto se pone de un color u otro
                
                //A partir del tercer puesto no baja mas el tamaño del texto
                playerName.style.fontSize = index>2 ? "2.5vw" : fontSize + "vw"
                playerName.innerText = playerRanking
                player.append(playerName)


                for (let i = 0; i < 3 - index; i++) {
                    star = document.createElement("img")
                    star.style.height = fontSize + "vw"
                    star.src = "/star.gif"
                    player.append(star)
                }


                rankingList.append(player)


                //Comprueba el nombre del ganador para aumenta el numero de juegos ganados
                if (index == 0) {
                    if (playerRanking.split(":")[0] == sessionStorage.getItem("playerName")) {
                        if (localStorage.getItem("userName") != null) {
                            const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
                            const http = new XMLHttpRequest()
                            http.open("PUT", dataBaseUrl + "/winnedGames?userName=" + localStorage.getItem("userName"));
                            http.send();
                        }
                    }
                }
            });
        })


        if (localStorage.getItem("userName") != null) {
            const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
            const http = new XMLHttpRequest()
            http.open("PUT", dataBaseUrl + "/playedGamesLastGame?userName=" + localStorage.getItem("userName"));
            http.send();
        }

    }, [])


    return (
        <>
            <h1 id="rankingHeader">RANKING:</h1>
            <ul id="rankingList"></ul>
            {/* location.reload para recargar la pagina, que aparezca en el menu y se borren los datos */}
            <button id="menuButton_time" className="optionButton" onClick={() => location.reload()}><img id="menuButtonImg" src="/house.png" /></button>
        </>
    )

}