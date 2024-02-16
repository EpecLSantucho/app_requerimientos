import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) =>  {
    const {email, nombre, token} = datos;

   
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
      });

    // informacion del email 
    const info = await transport.sendMail({
        from: '"RQ - Adminsitrador de Requerimientos" <cuentas@rq.com>',
        to: email,
        subject: "RQ - Comprueba tu Cuenta",
        text: "Comprueba tu Cuenta en RQ",
        html: `<p>Hola: ${nombre} Comprueba tu Cuenta en RQ </p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:         
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        </p>
        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    });
}

export const emailOlvidePassword = async (datos) =>  {
  const {email, nombre, token} = datos;

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

  // informacion del email 
  const info = await transport.sendMail({
      from: '"RQ - Adminsitrador de Requerimientos" <cuentas@rq.com>',
      to: email,
      subject: "RQ - Reestablece tu Password",
      text: "Reestablece tu Password en RQ",
      html: `<p>Hola: ${nombre} has solicitado reestablecer tu password </p>
      <p>Sigue el siguiente enlace para generar un nuevo password:         
          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
      </p>
      <p>Si tu no solicitaste este email, puedes ignorar este mensaje</p>
      `
  });
}