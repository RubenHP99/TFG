import React from 'react'
import ReactDOM from 'react-dom/client'
import "./style.css"
import "./pleaserotate.js"
import { Menu } from "./menu";
import {io} from "socket.io-client"


const ip = window.location.hostname //Ip de la maquina

const socket = io(`http://${ip}:8002`) //Ip y puerto del Socket.io. Con esta linea se crea la conexion cliente-servidor


//Direccion sel servidor de python con el modelo entrenado
sessionStorage.setItem("url", `http://${ip}:8000`)

//Direccion del servidor de python con la base de datos de usuarios
sessionStorage.setItem("dataBaseUrl", `http://${ip}:8003`)

sessionStorage.setItem("nightTheme", false)


/**
 * @file Archivo principal de react donde se despliega la aplicación.
 * @author Rubén Herrero Pérez <ruherrero@usal.es>
 * @version 1.0
 */
function App() {
  return (<Menu socket={socket}/>)
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
