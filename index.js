const url = require("url")
const http = require("http")
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const {agregaRoommate, guardarRoommate} = require("./usuarios")
const {send} = require("./correo")

http
    .createServer((req, res) => {
        if(req.url == "/" && req.method == "GET") {
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("index.html", "utf8"))  
        }
      
        if(req.url.startsWith('/roommate') && req.method == 'POST'){
            agregaRoommate().then(async (roommate) => {
                guardarRoommate(roommate)
                res.end(JSON.stringify(roommate))
            })
            .catch((e) => {
                res.statusCode = 500;
                res.end();
                console.log("Error en el registro", e)
            })

        }

        if(req.url.startsWith('/roommate') && req.method == 'GET'){
            res.setHeader("Content-Type", "application/json");
            res.end(fs.readFileSync("roommates.json", "utf8"));
        }
        

        // Creacion de la API REST--------------------------------//
        let gastosJSON = JSON.parse(fs.readFileSync('./gastos.json','utf8'));
        let gastos = gastosJSON.gastos;
        
        //a. GET /gastos:
        if(req.url.startsWith('/gastos') && req.method == 'GET'){

           const gastot = JSON.parse(fs.readFileSync("gastos.json", "utf8")).monto;
           const nombregasto = JSON.parse(fs.readFileSync("gastos.json", "utf8")).roommate;
           const roommates = JSON.parse(fs.readFileSync("roommates.json", "utf8")).roommates;
           const correo = roommates.map((u)=> u.correo);
          
           send(nombregasto, correo, gastot)
           .then(() =>{
               res.end(JSON.stringify(nombregasto))
           })
           .catch((e) =>{
               res.statusCode = 500;
               res.end();
               console.log("Error al enviar el correo", e);
           })

            res.end(JSON.stringify(gastosJSON,null,1));
        }

        //b. POST /gasto:
        if(req.url.startsWith('/gasto') && req.method == 'POST'){
            let body;
            req.on('data',(payload) => {
                body = JSON.parse(payload);
            });

            req.on('end',() => {
                gasto = {
                    id: uuidv4().slice(30),
                    roommate: body.roommate,
                    descripcion: body.descripcion,
                    monto: body.monto
                };

                gastos.push(gasto);

                fs.writeFileSync('./gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end();
                console.log('El Gasto ha sido registrado con exito!');
            })
        }

        //c. PUT /gasto:
        if(req.url.startsWith('/gasto') && req.method == 'PUT') {
            let body;
            const { id } = url.parse(req.url,true).query;

            req.on('data',(payload) => {
                body = JSON.parse(payload);
                body.id = id;
            });

            req.on('end', () => {
                gastosJSON.gastos = gastos.map((g) => {
                    if ( g.id == body.id){
                        return body;
                    }
                    return g;
                });
                
                fs.writeFileSync('./gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end()
            })
        }

        // d. DELETE /gasto:
        if(req.url.startsWith('/gasto') && req.method == 'DELETE') {
            const { id } = url.parse(req.url,true).query;
            gastosJSON.gastos = gastos.filter((g) => g.id !== id);
            fs.writeFileSync('./gastos.json',JSON.stringify(gastosJSON,null,1));
            res.end();
            console.log('Se elimino Gasto del historial con exito!');
        }




    }).listen(3000, ()=>console.log('Escuchando puerto 3000'))