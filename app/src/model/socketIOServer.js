
import { Server } from "socket.io";
import { createServer } from "http";


/**
 * @file Servidor de socket.io que controla el ascpecto multijugador de la aplicación.
 * @module socketIOServer 
*/

const server = createServer();

const io = new Server(server, { cors: { origin: "*" } });

server.listen(8002, () => {
    console.log("SERVER READY");
});


/**
 * Crea un sala nueva.
 * @class Room
 * @property {int} gameMode Modo de juego.
 * @property {list} players Almacena todos los jugadores de la sala.
 * @property {int} totalPlayers Número de jugadores que quedan en la ronda.
 * @property {list} doodles Lista con los nombres de los doodles que se van a usar en la partida.
 * @property {int} guessAmount Número de jugadores de una ronda que han adivinado el doodle.
 * @property {int} time Tiempo que dura cada ronda.
 * @property {int} rounds Numero de rondas que tiene la partida.
 * @property {string} winner Nombre del jugador que ha ganado la partida.
 * @property {int} readyPlayers Número de jugadores listos para la siguiente ronda.
 * @property {diccionary} playerDoodles Diccionario con los dibujos en base64 de todos los jugadores de una ronda (clave: nombre del jugador).
 */
class Room {
    constructor() {
        this.gameMode_ = null
        this.players_ = []
        this.totalPlayers_ = 0
        this.doodles_ = []
        this.guessAmount_ = 0
        this.time_ = 0
        this.rounds_ = 0
        this.winner_ = ""
        this.readyPlayers_ = 0
        this.playerDoodles_ = {}
    }

    set gameMode(gameMode) { this.gameMode_ = gameMode }
    set players(players) { this.players_ = players }
    set totalPlayers(totalPlayers) { this.totalPlayers_ = totalPlayers }
    set time(time) { this.time_ = time }
    set rounds(rounds) { this.rounds_ = rounds }
    set doodles(doodles) { this.doodles_ = doodles}
    set guessAmount(guessAmount) { this.guessAmount_ = guessAmount }
    set winner(winner) { this.winner_ = winner }
    set readyPlayers(readyPlayers) { this.readyPlayers_ = readyPlayers }
    set playerDoodles(playerDoodles) { this.playerDoodles_ = playerDoodles }

    get gameMode() { return this.gameMode_ }
    get players() { return this.players_ }
    get totalPlayers() { return this.totalPlayers_ }
    get time() { return this.time_ }
    get rounds() { return this.rounds_ }
    get doodles() { return this.doodles_ }
    get guessAmount() { return this.guessAmount_ }
    get winner() { return this.winner_ }
    get readyPlayers() { return this.readyPlayers_ }
    get playerDoodles() { return this.playerDoodles_ }

}



/**
 * Crea un jugador nuevo.
 * @class Player
 * @property {string} name Nombre del jugador.
 * @property {int} points Número de puntos del jugador.
 * @property {socket} socket Socket del cliente.
 * @property {boolean} correctDoodle Indica si ha acertado el doodle de la ronda.
 * @property {boolean} lost Indica si el jugador ha perdido la ronda y ha sido eliminado de la partida.
 */
class Player {
    constructor(name, socket, peer) {
        this.name_ = name
        this.points_ = 0
        this.socket_ = socket
        this.correctDoodle_ = false
        this.lost_ = false
        this.peer_ = peer
    }

    set correctDoodle(correctDoodle) { this.correctDoodle_ = correctDoodle }
    set lost(lost) { this.lost_ = lost }
    set points(points) { this.points_ = points }

    get socket() { return this.socket_ }
    get correctDoodle() { return this.correctDoodle_ }
    get name() { return this.name_ }
    get lost() { return this.lost_ }
    get points() { return this.points_ }
}


//Diccionario con informacion de todas las salas y sus jugadores
//{roomCode: Room()}
const rooms = {}

//Diccionario que relaciona el socket de cada jugador con su sala. Mejora el borrado de jugadores O(n*n) -> O(n)
//{socket.id: roomCode}
const playerRoom = {}


/**
 * Evento que se encarga de realizar la conexion cliente-servidor.
 * @event connection
 * @param {socket} socket Socket del cliente.
 */
io.on("connection", (socket) => {
    console.log("USER CONNECTED: " + socket.id);

    /**
     * Se lanza cada vez que un jugador cierra o refresca la pagina, borra los datos relacionados con él.
     * @event disconnect
     */
    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED: " + socket.id)

        var found = -1
        const room = playerRoom[socket.id] //Guarda la sala a la que corresponde la sesion que se desconecta

        //Si todavia no se ha unido o creado un sala no se hace nada (no hay que borrar de ninguna estructura)
        if (rooms[room] != undefined) {

            //Recorre los jugadores de esa sala hasta encontrar el jugador a borrar
            for (let i = 0; i < rooms[room].players.length && found == -1; i++) {
                if (rooms[room].players[i].socket.id == socket.id) found = i
            }

            //Borra el jugador si se ha unido a una sala
            if (found != -1) {
                rooms[room].players.splice(found, 1) //Borra al jugador de la estructura rooms
                delete playerRoom[socket.id] //Borra al jugador de la estructura playerRoom
                console.log("PLAYERS OF ROOM " + room + ": " + rooms[room].players)
                console.log("PLAYERROOM STRUCTURE: " + Object.keys(playerRoom))

                //Se borra la sala del diccionario si esta vacia
                if (rooms[room].players.length == 0) {
                    delete rooms[room]
                    console.log("ALL ROOM CODES: " + Object.keys(rooms))
                }

            }
        }

    });


    /**
     * Comprueba que no exista un jugador con ese nombre en esa sala.
     * @event checkPlayerName
     * @param {string} playerName Nombre del jugador.
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("checkPlayerName", (playerName, roomCode) => {
        var correct = true

        if (rooms[roomCode] != undefined) {
            for (let i = 0; i < rooms[roomCode].players.length && correct; i++) {
                if (rooms[roomCode].players[i].name == playerName) correct = false
            }
        }

        socket.emit("checkPlayerNameResult", correct, null, null)
    })


    
    /**
     * Comprueba si el codigo de sala es correcto.
     * @event checkRoomCode
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("checkRoomCode", (roomCode) => {
        var result = true


        //Si la sala es undefined no puede acceder a ningun atributo del objeto
        if (rooms[roomCode] != undefined) {

            //No deja unirse si la sala ha alcanzado el tope de jugadores
            if (rooms[roomCode].players.length == rooms[roomCode].totalPlayers) result = "FULL"

            //Hasta que no se crea la sala con sus datos no se pueden unir
            if (rooms[roomCode].gameMode == undefined) result = "CREATING"

            if (result == true) result = false

        }

        //Si el codigo esta vacio o la sala esta llena, devuelve error, en caso contrario devuelve true si NO existe la sala
        socket.emit("checkRoomCodeResult", result, null)

    })



    /**
     * Evento para unirse a una sala (o crearla si no lo está).
     * @event joinRoom
     * @param {string} playerName Nombre del jugador.
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("joinRoom", (playerName, roomCode) => {
        var create = false //Controla si el que entra se esta uniendo o creando la sala

        //Solo entra al crear la sala
        if (rooms[roomCode] == undefined) {
            rooms[roomCode] = new Room()
            create = true
        }

        socket.join(roomCode)

        //Añade el juador a la lista
        rooms[roomCode].players.push(new Player(playerName, socket))

        //Se relaciona el socket del jugador con la sala
        playerRoom[socket.id] = roomCode

        io.to(roomCode).emit("playersReady", rooms[roomCode].players.length, rooms[roomCode].totalPlayers, rooms[roomCode].gameMode)

        console.log(io.sockets.adapter.rooms)
        console.log(rooms[roomCode].players)

        //Comprueba los valores de los input de todos los otros clientes
        socket.broadcast.emit("checkPlayerNameResult", null, playerName, roomCode)
        if (create) socket.broadcast.emit("checkRoomCodeResult", null, roomCode) //Solo emite este evento el que crea la sala

    })


    /**
     * Se crea la configuracion del modo de juego.
     * @event addOptions
     * @param {int} roomCode Código de la sala.
     * @param {int} playersValue Cantidad de jugadores de la partida.
     * @param {int} timeValue Segundos que dura cada ronda.
     * @param {int} roundsValue Numero de rondas de la partida.
     * @param {int} gameMode Modo de juego seleccionado.
     * @param {list} doodles Lista de doodles que se van a utilizar en la partida.
     */
    socket.on("addOptions", (roomCode, playersValue, timeValue, roundsValue, gameMode, doodles) => {
        rooms[roomCode].gameMode = gameMode
        rooms[roomCode].totalPlayers = playersValue
        rooms[roomCode].time = timeValue
        rooms[roomCode].rounds = roundsValue
        rooms[roomCode].doodles = doodles

        console.log(rooms[roomCode].doodles)

        io.to(roomCode).emit("playersReady", rooms[roomCode].players.length, rooms[roomCode].totalPlayers, gameMode)
        socket.broadcast.emit("checkRoomCodeResult", false, roomCode) //Manda un mensaje de que ya se ha creado la sala y se pueden unir

    })



    /**
     * Devuelve el primer doodle de la lista.
     * @event getDoodle
     * @param {int} roomCode Código de la sala.
     */
    socket.on("getDoodle", (roomCode) => {
        const doodle = rooms[roomCode].doodles[0] //Elige siempre el primer doodle, al acabar la ronda se borra el primero
        socket.emit("getDoodleResult", doodle)
    })



    /**
     * Devuelve la cantidad de jugadores que quedan vivos al principio de una ronda.
     * @event getTotalPlayers
     * @param {int} roomCode Código de la sala.
     */
    socket.on("getTotalPlayers", (roomCode) => {
        const room = rooms[roomCode]
        socket.emit("getTotalPlayersResult", room.totalPlayers + "/" + room.totalPlayers)
    })



    /**
     * Crea una lista con los jugadores que quedan en la partida.
     * @event getPlayerNames
     * @param {int} roomCode Código de la sala.
     * @param {boolean} timeMode Si es true, debe guardar el nombre del jugador + su puntuación actual.
     */
    socket.on("getPlayerNames", (roomCode, timeMode) => {
        const names = []
        rooms[roomCode].players.forEach(player => {
            if(timeMode){
                names.push(player.name+": "+player.points)

            }else{ //Modo de juego suddenDeath
                if (!player.lost) names.push(player.name)
            }
        });
        socket.emit("getPlayerNamesResult", names)
    })



    /**
     * Preocesa datos de la sala cuando un jugador acierta el doodle.
     * @event correctDoodle
     * @param {int} roomCode Código de la sala.
     * @param {string} playerName Nombre del jugador que ha acertado.
     */
    socket.on("correctDoodle", (roomCode, playerName) => {
        const room = rooms[roomCode]
        room.guessAmount += 1

        var found = false
        for (let i = 0; i < room.players.length && !found; i++) {
            if (room.players[i].name == playerName) {
                room.players[i].correctDoodle = true
                found = true
            }
        }


        //Solo les llega a los que estan suscrito al evento. (los que estan en la pantalla de suddenDeath)
        socket.to(roomCode).emit("correctDoodleResult", playerName, room.totalPlayers - room.guessAmount, room.totalPlayers)

    })



    /**
     * Prepara el juego para avanzar a la siguiente ronda.
     * @event nextRound
     * @param {int} roomCode Código de la sala.
     * @param {string} playerName Nombre del jugador.
     */
    socket.on("nextRound", (roomCode, playerName) => {
        const room = rooms[roomCode]

        room.doodles.shift() //Borra el primer doodle de la lista utilizado en la ronda
        room.guessAmount = 0 //Resetea el numero de jugadores que han adivinado el doodle

        room.totalPlayers -= 1 //Se reduce en uno porque un jugador muere al final de cada ronda


        for (let i = 0; i < room.players.length; i++) {
            room.players[i].correctDoodle = false
            if (room.players[i].name == playerName) room.players[i].lost = true
        }


        //Los que estan muertos estan en la misma pantalla y no deben recibir este evento
        room.players.forEach(player => {
            if (!player.lost) player.socket.emit("nextRoundResult")
        });

    })



    /**
     * Guarda al ganador de la partida.
     * @event endGame
     * @param {int} roomCode Código de la sala.
     * @param {string} winner Jugador que ha ganado la partida.
     */
    socket.on("endGame", (roomCode, winner) => {
        //A veces al validar imagen a la vez, entran aqui 2 jugadores
        if(rooms[roomCode].winner == ""){
            rooms[roomCode].winner = winner
            io.to(roomCode).emit("endGameResult")
        }
    })



    /**
     * Devuelve el ganador de la partida.
     * @event getWinner
     * @param {int} roomCode Código de la sala
     */
    socket.on("getWinner", (roomCode) => {
        socket.emit("getWinnerResult", rooms[roomCode].winner)
    })



    /**
     * Crea una lista con los jugadores que siguen dibujando en la ronda.
     * @event getActivePlayers
     * @param {int} roomCode Código de la sala.
     */
    socket.on("getActivePlayers", (roomCode) => {
        const room = rooms[roomCode]

        //Guarda los nombres de los jugadores que siguen jugando en esa ronda
        //Los que ya han adivinado el doodle no los guarda porque ya no dibujan nada
        const names = []
        room.players.forEach(player => {
            if (!player.correctDoodle && !player.lost) names.push(player.name)
        });

        socket.emit("getActivePlayersResult", names)
    })



    /**
     * Envía el canvas de un jugador a todos.
     * @event sendImage
     * @param {int} roomCode Código de la sala.
     * @param {string} playerName Nombre del jugador que envía la imagen.
     * @param {string} image Imagen en base64.
     */
    socket.on("sendImage", (roomCode, playerName, image) => {
        //Solo les llega a los que estan suscrito al evento. (los que estan en la pantalla de nextRound)
        io.to(roomCode).emit("sendImageResult", playerName, image)
    })


//-----------------------EVENTOS DEL MODO DE JUEGO TIME------------------------

    /**
     * Evento para obtener el tiempo configurado.
     * @event getTime
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("getTime", (roomCode) => {
        socket.emit("getTimeResult", rooms[roomCode].time)
    })


    /**
     * Evento que se ejecuta cuando acaba el tiempo de la ronda.
     * @event timeOut
     * @param {int} roomCode Código de la sala del jugador.
     * @param {string} playerName Nombre del jugador.
     * @param {string} image Imagen en base64 de lo que ha el jugador dibujado en la ronda.
     * @param {string} doodle Nombre del doodle que ha devuelto la red neuronal.
     * @param {int} points Puntos que ha conseguido en la ronda actual.
     */
    socket.on("timeout", (roomCode, playerName, image, doodle, points) => {
        //Resetear numero de jugadores preparados para empezar la siguiente ronda. Se puede poner en el evento de arriba o abajo tambien
        rooms[roomCode].readyPlayers = 0 

        const room = rooms[roomCode]

        var roundPoints = 0

        if(room.doodles[0] == doodle) roundPoints = points

        rooms[roomCode].playerDoodles[playerName + ": +" + roundPoints] = image

        room.players.forEach(player => {
            
            if(player.name == playerName){
                player.points += roundPoints
                return //Para salir del forEach
            }
        });
    })



    /**
     * Envía un evento con el diccionario de dibujos de la ronda.
     * @event getPlayerDoodles
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("getPlayerDoodles", (roomCode) => {
        const room = rooms[roomCode]

        //Se envia cuando se han recibido todas las imagenes
        if (room.totalPlayers == Object.keys(room.playerDoodles).length) io.to(roomCode).emit("getPlayerDoodlesResult", room.playerDoodles)
    })



    /**
     * Notifica al servidor que el jugador está listo para la siguiente ronda.
     * El último jugador prepara la siguiente ronda.
     * También controla si es la última ronda.
     * @event ready
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("ready", (roomCode) => {
        const room = rooms[roomCode]

        room.readyPlayers += 1
        
        //Si es el ultimo jugador que se une, prepara la siguiente ronda
        if (room.readyPlayers == room.totalPlayers) {
            room.players = room.players.sort((a, b) => (a.points < b.points) ? 1 : -1) //Ordena los jugadores descendentemente por puntuacion
            room.doodles.shift() //Borra el primer doodle de la lista para pasar al siguiente
            room.playerDoodles = {} //Borrar todos los datos que relacionan a cada jugador con el dibujo, ya que la ronda ha terminado
        }
        
        //Si no hay mas doodles significa que la partida ha terminado
        if(room.doodles.length == 0){
            io.to(roomCode).emit("endGame")
        }else{
            io.to(roomCode).emit("playersReady", room.readyPlayers, room.totalPlayers, room.gameMode)
        }

    })


    /**
     * Crea una lista con la clasificación de los jugadores y sus puntuaciones.
     * @event getRanking
     * @param {int} roomCode Código de la sala del jugador.
     */
    socket.on("getRanking", (roomCode) => {
        const room = rooms[roomCode]
        const ranking = []

        room.players.forEach(player => {
            ranking.push(player.name + ": " + player.points + " points")
        });


        socket.emit("getRankingResult", ranking)
    })
});




