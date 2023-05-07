import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Route, Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  errorMessage: string = "";

  constructor(private auth: AuthService, private toastr: ToastrService, private router: Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const myToken = this.auth.getJwtToken();

    if (myToken != null) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}` }
      });
    }

    return next.handle(request).pipe(
      catchError((error: any) => {
        
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {

            case 401: {
              this.toastr.warning("A sua sessão expirou. Volte a Entrar na sua conta", 'Sessão Expirou');
              this.router.navigate(['login']);
              break;
            }

            case 0: {
              this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.message}`;
              console.log(this.errorMessage);
              this.toastr.error(this.errorMessage, "Detalhes");
              break;
            }

            default: {
              // Erro no Servidor ou API
              this.errorMessage = `O Servidor devolveu um código ${error.status}. Detalhes: ${error.error}`;
              console.log(this.errorMessage);
              this.toastr.error(this.errorMessage, "Detalhes");
            }

          }
        }

        if (error.error instanceof ErrorEvent) {
          //Erro no lado do cliente
          this.errorMessage = `Ocorreu um erro: ${error.message}`;
          console.log(this.errorMessage);
          this.toastr.error(this.errorMessage, "Detalhes");
        }

        return throwError(() => new Error('Erro: ' + error.Message));
      }));
  }
}
