const express = require("express")
const app = express()
const path = require("path")
const http = require("http")
const mongoose = require("mongoose")
const { Server } = require("socket.io")
const { forEach } = require("async")


const server = http.createServer(app)

const io = new Server(server)
app.use(express.static(path.resolve("")))


let playingArray = []

mongoose.connect("mongodb://localhost:27017/gameDB");



const gameSchema = {
    name: String
};

const Game = mongoose.model("Game", gameSchema);


let arr = [];


io.on("connection", (socket) => {

    socket.on("find", (e) => {

        if (e.name != null) {

            const player = new Game({
                name: e.name
            });

            player.save().then(() => console.log('Success'));

            let numofplayer = 0;
            
            Game.find({}).then(users => {
                
                if (users.length >= 2) {
                    let p1obj = {
                        p1name: users[users.length-1].name,
                        p1value: "X",
                        p1move: ""
                    }
                    let p2obj = {
                        p2name:  users[users.length-2].name,
                        p2value: "O",
                        p2move: ""
                    }
    
                    let obj = {
                        p1: p1obj,
                        p2: p2obj,
                        sum: 1
                    }
                    playingArray.push(obj);
                    io.emit("find", { allPlayers: playingArray })

                }
                socket.on("playing", (e) => {
                    if (e.value == "X") {
                        let objToChange = playingArray.find(obj => obj.p1.p1name === e.name)
            
                        objToChange.p1.p1move = e.id
                        objToChange.sum++
                    }
                    else if (e.value == "O") {
                        let objToChange = playingArray.find(obj => obj.p2.p2name === e.name)
            
                        objToChange.p2.p2move = e.id
                        objToChange.sum++
                    }
            
                    io.emit("playing", { allPlayers: playingArray })
            
                })
            
                socket.on("gameOver", (e) => {
                    playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name)
                    console.log(playingArray)
            
                })
        
            })
            .catch(err => {
                    console.error(err);
                });

             

        }

    })

    
})




app.get("/", (req, res) => {
    return res.sendFile("index.html")
})

server.listen(3000, () => {
    console.log("port connected to 3000")
})
