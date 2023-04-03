import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  private username$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");

  constructor() { }

  public getRoleFromUserStore() {
    return this.role$.asObservable();
  }

  public setRoleForUserStore(role: string) {
    this.role$.next(role)
  }

  public getUserNameFromUserStore() {
    console.log(this.username$.asObservable())
    return this.username$.asObservable();
  }

  public setUserNameForUserStore(username: string) {
    this.username$.next(username)
  }
}
