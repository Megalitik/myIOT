import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit {

  constructor(public userService: UserService, private toastr:ToastrService) { }

  ngOnInit(): void {
    this.userService.formModel.reset();
  }

  onSubmit() {
    console.log("On submit...");


    this.userService.Register().subscribe(
      (response: any) => {
        if (response.succeded) {
          this.userService.formModel.reset();
          this.toastr.success('Novo Utilizador foi criado', 'Registro de Utilizador feito com sucesso.')
        }
        else {
          response.errors.array.forEach((element: any) => {
            switch (element.code) {
              case 'DuplicateUserName':
                this.toastr.error('Nome de Utilizador já foi criado.', 'Registro de Utilizador falhou')
                break;
              default:
                this.toastr.error('Erro ao criar Utilizador - ' + element.description, 'Registro de Utilizador falhou')
                break;
            }
          });
        }
      })
  }

}
