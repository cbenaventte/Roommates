const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
       user: "nodemailerADL2@gmail.com",
       pass: "desafiolatam"
   },
});

const send = async(nombregasto, correo, gastot) => {
    let mailOptions = {
        from: "nodemailerADL2@gmail.com",
        to: ["cbenaventte@gmail.com"].concat(correo),
        subjet: `${nombregasto} has realizado un gasto`,
        html: `<h3>${nombregasto} realizo un gasto de $: ${gastot}</h3>`    
    };
 
     try {
        const result = await transporter.sendMail(mailOptions);
        return result;
     } catch (e) {
         throw(e)
     }
};
//send({nombre: "Estamos probando"}, [], "PROBANDO CORREO")
module.exports = {send}