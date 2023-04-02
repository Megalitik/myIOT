import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService) {

  }

  canActivate(): boolean {
    if (this.auth.isUserLoggedIn()) {
      return true;
    }
    else {
      return false;
    }
  }

}
