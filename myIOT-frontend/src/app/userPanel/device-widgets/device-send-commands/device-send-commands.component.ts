import { HttpClient, HttpErrorResponse, JsonpInterceptor } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/_services/api/api.service';

@Component({
  selector: 'app-device-send-commands',
  templateUrl: './device-send-commands.component.html',
  styleUrls: ['./device-send-commands.component.css']
})
export class DeviceSendCommandsComponent {

  DeviceCommands: any[] = [];
  selectedCommand: any;

  selectedDeleteDeviceCommand: string = '';

  newDeviceCommandName: string = '';
  newDeviceCommandCommand: string = '';
  newDeviceCommandPayload: string = '';

  validPayload: boolean = true;
  validCommandName: boolean = true;
  validCommand: boolean = true;
  isDeleteCommandSelected: boolean = true;

  @Input() currentDeviceID: string;

  constructor(private api: ApiService, private toastr: ToastrService, private http: HttpClient) {

  }

  ngOnInit(): void {

    this.userDeviceCommandsList(this.currentDeviceID);
  }

  userDeviceCommandsList(deviceId: string) {
    this.api.getDeviceCommands(deviceId).subscribe(commands => {

      this.DeviceCommands = commands
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          console.log(`O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`);
        } else {
          // Erro no Servidor ou API
          console.log(`O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`);
        }
      });
  }

  sendCommand() {
    this.api.sendCommandMethod(this.selectedCommand.deviceId, this.selectedCommand.id).subscribe(deviceMessage => {

      this.toastr.success("Método foi chamado", "Método Chamado");
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.toastr.error("Houve um erro ao chamar o método", "Erro")
        } else {
          // Erro no Servidor ou API
          this.toastr.error("Houve um erro ao chamar o método", "Erro")
        }
      });
  }

  addDeviceCommand() {

    if (this.ValidateAddCommand()) {

      this.validPayload = this.CheckPayload(this.newDeviceCommandPayload);

      if (this.validPayload) {

        this.api.addNewDeviceCommand(this.currentDeviceID, this.newDeviceCommandName, this.newDeviceCommandCommand, this.newDeviceCommandPayload).subscribe(deviceMessage => {

          this.toastr.success("O comando foi criado", "Comando criado");
          this.userDeviceCommandsList(this.currentDeviceID);

          const closeButton = document.getElementById("addDeviceCommandCloseBtn");
          closeButton?.click();
        },
          (error: HttpErrorResponse) => {
            if (error.error instanceof ErrorEvent) {
              //Erro no lado do cliente
              this.toastr.error("Houve um erro ao adicionar o comando", "Erro")
            } else {
              // Erro no Servidor ou API
              this.toastr.error("Houve um erro ao adicionar o comando", "Erro")
            }
          });
      }
    }
  }

  deleteDeviceCommand() {

    if (this.ValidateDeleteCommand() == false) {

      return;
    }
    this.api.deleteCommandMessage(this.currentDeviceID, this.selectedDeleteDeviceCommand).subscribe(deviceMessage => {
      this.userDeviceCommandsList(this.currentDeviceID);
      this.isDeleteCommandSelected = true;
      this.selectedDeleteDeviceCommand = '';

      this.toastr.success("O comando foi apagado", "Comando apagado");
      const closeButton = document.getElementById("deleteDeviceCommandCloseBtn");
      closeButton?.click();
    },
      (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.toastr.error("Houve um erro ao apagar o comando", "Erro")
        } else {
          // Erro no Servidor ou API
          this.toastr.error("Houve um erro ao apagar o comando", "Erro")
        }
      });
  }

  ValidateAddCommand() {

    if (this.CheckPayload(this.newDeviceCommandPayload) == false) {
      this.validPayload = false;

      return false;
    }

    if (this.newDeviceCommandName.length === 0) {
      this.validCommandName = false;
      this.newDeviceCommandName = '';
      return false;
    }

    if (this.newDeviceCommandCommand.length === 0) {
      this.validCommand = false;
      this.newDeviceCommandCommand = '';
      return false;
    }

    return true;

  }

  ValidateDeleteCommand() {

    if (this.selectedDeleteDeviceCommand.length === 0) {
      this.isDeleteCommandSelected = false;
      this.selectedDeleteDeviceCommand = '';
      return false;
    }

    return true;

  }

  CheckPayload(str: string) {
    if (str == null || str.length === 0) {
      return true;
    }
    try {
      JSON.parse(str);
    } catch (e) {
      this.newDeviceCommandPayload = '';
      return false;
    }
    return true;
  }
}
