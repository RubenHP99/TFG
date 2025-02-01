import { useState, useEffect } from "react"


/**
 * @file Pantalla final donde se muestra al ganador del modo de juego Hill Champion.
 * @module endGame_hillChampion
 */


/**
 * Componente que carga los elementos html de la pantalla de fin del juego del modo Hill Champion.
 * @function EndGame_hillChampion
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function EndGame_hillChampion({ socket }) {

    const [winner, setWinner] = useState("")

    useEffect(() => {

        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()

        socket.emit("getWinner", sessionStorage.getItem("roomCode"))

        socket.on("getWinnerResult", (result) => {

            //Al pulsar a la vez validar imagen en la ultima ronda, a veces no muestra ningun ganador (fallo de sincronizaion de socket.io)
            if(result == "") socket.emit("getWinner", sessionStorage.getItem("roomCode"))

            setWinner(result)


            //Si es el jugador que ha ganado, aumenta el numero de juegos ganados del usuario
            if(result == sessionStorage.getItem("playerName")){
                if(localStorage.getItem("userName") != null){
                    const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
                    const http = new XMLHttpRequest()
                    http.open("PUT", dataBaseUrl + "/winnedGames?userName=" + localStorage.getItem("userName"));
                    http.send();
                }
            }
        })


        if(localStorage.getItem("userName") != null){
            const dataBaseUrl = sessionStorage.getItem("dataBaseUrl")
            const http = new XMLHttpRequest()
            http.open("PUT", dataBaseUrl + "/playedGamesLastGame?userName=" + localStorage.getItem("userName"));
            http.send();
        }

    }, [])


    return (
        <>
            <h1 id="winnerHeader">
                WINNER:
                <br />
                <img src="/star.gif" height={"150vh"} style={{ verticalAlign: "middle" }} />
                <label style={{margin: "2%", fontWeight: "normal"}}>{winner}</label>
                <img src="/star.gif" height={"150vh"} style={{ verticalAlign: "middle" }} />
            </h1>
            {/* location.reload para recargar la pagina, que aparezca en el menu y se borren los datos */}
            <button id="menuButton" className="optionButton" onClick={() => location.reload()}><img id="menuButtonImg" src="/house.png" /></button>
        </>
    )

}