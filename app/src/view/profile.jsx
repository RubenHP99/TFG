import { useEffect, useState } from 'react'
import { Menu } from '../view/menu'
import { Statistics } from './statistics'
import { ChangePassword } from './changePassword'
import { ChangeEmail } from './changeEmail'
import * as func from "../controller/userController.js"


/**
 * @file Pantalla con la cuenta de un usuario registrado.
 * @module profile
 */



/**
 * Componente que carga los elementos html del perfil de un usuario.
 * @function Profile
 * @param {socket} socket El socket del cliente que carga la página.
 * @returns {html} Devuelve un componente u otro en funcion del comportamiento de la aplicación.
 */
export function Profile({ socket }) {
    const [menuGo, setMenuGo] = useState(false)
    const [statisticsGo, setStatisticsGo] = useState(false)
    const [changePassGo, setChangePassGo] = useState(false)
    const [changeEmailGo, setChangeEmailGo] = useState(false)

    if (menuGo) return (<Menu socket={socket} />)
    if (statisticsGo) return (<Statistics socket={socket} />)
    if (changePassGo) return (<ChangePassword socket={socket} />)
    if (changeEmailGo) return (<ChangeEmail socket={socket} />)

    return (
        <>
            <h1 id="profileHeader">{localStorage.getItem("userName")}</h1>
            <div id="profileMenu">
                <button id="statisticsButton" className="simpleButton" onClick={() => setStatisticsGo(true)}> STATISTICS </button>
                <button id="changePassButton" className="simpleButton" onClick={() => setChangePassGo(true)}> CHANGE PASSWORD </button>
                <button id="changeEmailButton" className="simpleButton" onClick={() => setChangeEmailGo(true)}> CHANGE E-MAIL </button>
                <button id="deleteAccountButton" className="simpleButton" onClick={() => func.deleteAccount(setMenuGo)}> DELETE ACCOUNT </button>
            </div>

            <button id="backButton" className="optionButton" onClick={() => setMenuGo(true)}><img src="/leftArrow.png" /></button>
        </>
    )

}