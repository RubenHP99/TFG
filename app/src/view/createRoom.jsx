import { useState, useEffect } from 'react'
import * as func from "../controller/createRoomController.js"
import { Loading } from './loading.jsx';


/**
 * @file Pantalla de configuración de los modos de juego.
 * @module createRoom
 */


//Lista con diccionarios con informacion de los modos de juego
const modeList = [{ name: "HILL CHAMPION", logo: "/hillChampionMode.jpg", desc: "En cada ronda pierde el jugador que no consiga dibujar el doodle. El último jugador en pie gana." },
{ name: "TIME'S UP", logo: "/timesUpMode.jpg", desc: "Los jugadores deben dibujar en el tiempo determinado. A mayor precisión mayor puntuación." }];



/**
 * Componente que carga los elementos html para la configuración del modo de juego.
 * @function CreateRoom
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function CreateRoom({ socket }) {
    //Estado que cambia cuando se cambia el modo de juego (se pulsan las flechas)
    const [mode, setMode] = useState(0)

    //Estado para saber si los datos introducidos de todos los campos son correctos
    const [correctInputs, setCorrectInputs] = useState(false)

    const [gameLoadingGo, setGameLoadingGo] = useState(false)


    //Cada vez que se cambia el modo se comprueban los campos
    useEffect(() => {
        setCorrectInputs(func.checkInputs())
    }, [mode])
    

    useEffect(() => {
        //Dar de baja a todos los eventos para que no se ejecuten mas de 1 vez
        //Al hacer on se suscribe un evento y al cargar otra vez el componente se vuelve a suscribir.
        socket.removeAllListeners()
    }, [])
    

    if (gameLoadingGo) return (<Loading socket={socket} />)


    return (
        <>
            <h1 id="modeName">{modeList[mode].name}</h1>
            <div id="modeSelect">
                <button id="leftButton" className="optionButton" onClick={() => setMode(Math.abs((mode + 1) % modeList.length))}><img src="/leftArrow.png" /></button>
                <img id="modeLogo" src={modeList[mode].logo} />
                <button id="rightButton" className="optionButton" onClick={() => setMode(Math.abs((mode - 1) % modeList.length))}><img src="/rightArrow.png" /></button>
            </div>

            <p id="modeDescription">{modeList[mode].desc}</p>

            <div id="modeOptions">
                <input id="playersInput" className="textInput" type="text" placeholder="PLAYERS(2-6)" maxLength={1} onInput={e => setCorrectInputs(func.validInput(e.target.id))} autoComplete="off" />

                {mode == 1 ?
                    <>
                        <input id="timeInput" className="textInput" type="text" placeholder="SECONDS(10-30)" maxLength={2} onInput={e => setCorrectInputs(func.validInput(e.target.id))} autoComplete="off" />
                        <input id="roundsInput" className="textInput" type="text" placeholder="ROUNDS(1-5)" maxLength={1} onInput={e => setCorrectInputs(func.validInput(e.target.id))} autoComplete="off" />
                    </> : null}
            </div>

            <button id="okButton" className="optionButton" disabled={!correctInputs} onClick={() => func.prepareGame(socket, setGameLoadingGo, mode)}> <img src="ok.png" /></button>
        </>
    )

}