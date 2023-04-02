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

  constructor(private auth : AuthService, private toastr : ToastrService, private router : Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const myToken = this.auth.getJwtToken();

    if (myToken != null) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}`}
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse)
        {
          if (error.status === 401)
          {
            this.toastr.warning("A sua sessão expirou. Volte a Entrar na sua conta", 'Sessão Expirou');
            this.router.navigate(['login']);
          }
        }

        return throwError(()=> new Error('Erro: ' + error.message));
      }));
  }
}
