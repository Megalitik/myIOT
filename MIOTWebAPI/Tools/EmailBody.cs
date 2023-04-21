using System;

namespace MIOTWebAPI.Tools
{
    public class EmailBody
    {
        public static string EmailResetPasswordBodyHtml(string email, string emailToken)
        {
            return $@"<html>
            <head>
                <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet'>
                <link rel=""stylesheet"" href=""https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"" integrity=""sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"" crossorigin=""anonymous"">
            </head>
            <body style=""margin:0; padding:0; background-color: #1C2228; color: #f7fff7;"">
                <div style=""height: auto; width:400px; padding:30px;"">
                    <div>
                        <div>
                            <a class=""navbar-brand"">
                            <span style=""color: #fff; font-weight: bold; font-size: 1.4em; background-color: #1560eb; padding: 3px 5px 3px 8px; margin-left: 20px; border-radius: 4px;"">my</span>
                            <span style=""color: #fff; font-weight: bold; font-size: 1.4em; padding: 3px 8px 3px 3px; border-radius: 4px;"">IOT</span>
                            </a>
                            <hr>
                            <p> Está a receber este email devido ao seu pedido para repor a sua Palavra-Passe.</p>
                            <p> Clique em baixo para repor a sua Palavra-Passe.</p>

                            <a href=""http://localhost:4200/reset?email={email}&code={emailToken}"" class=""btn btn-primary"">Repor Palavra-Passe </a>
                        </div>
                    </div>
                </div>
            </body></html>";
        }

        public static string EmailDeviceWarningBodyHtml(string email, string deviceName, string emailToken)
        {
            return $@"<html>
            <head>
                <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet'>
                <link rel=""stylesheet"" href=""https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"" integrity=""sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"" crossorigin=""anonymous"">
            </head>
            <body style=""margin:0; padding:0; background-color: #1C2228; color: #f7fff7;"">
                <div style=""height: auto; width:400px; padding:30px;"">
                    <div>
                        <div>
                            <a class=""navbar-brand"">
                            <span style=""color: #fff; font-weight: bold; font-size: 1.4em; background-color: #1560eb; padding: 3px 5px 3px 8px; margin-left: 20px; border-radius: 4px;"">my</span>
                            <span style=""color: #fff; font-weight: bold; font-size: 1.4em; padding: 3px 8px 3px 3px; border-radius: 4px;"">IOT</span>
                            </a>
                            <hr>
                            <p> Está a receber este email devido ao seu dispositivo {deviceName} ter ativado o aviso.</p>
                            <p> Clique em baixo para ir para a aplicação</p>

                            <a href=""http://localhost:4200/"" class=""btn btn-primary"">Ir para a aplicação </a>
                        </div>
                    </div>
                </div>
            </body></html>";
        }
    }
}