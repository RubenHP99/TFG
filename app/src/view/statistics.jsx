import { useState, useEffect } from "react"
import { Profile } from "./profile"
import * as func from "../controller/userController.js"




/**
 * @file Pantalla donde los usuarios pueden ver sus estadísticas.
 * @module statistics
 */




/**
 * Componente que carga los elementos html de la pantalla de estadísticas.
 * @function Statistics
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function Statistics({ socket }) {
    const [profileGo, setProfileGo] = useState(false)

    useEffect(() => { func.loadStatistics() }, [])

    if (profileGo) return (<Profile socket={socket}/>)

    return (
        <>
            <h1 id="statisticsHeader">STATISTICS:</h1>
            <div id="stats"/>
            <button id="backButton" className="optionButton" onClick={() => setProfileGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}