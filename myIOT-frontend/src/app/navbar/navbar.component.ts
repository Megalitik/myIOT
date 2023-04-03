import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router:Router, private auth : AuthService) { }

  ngOnInit(): void {
  }

  onLogout()
  {
    this.auth.Logout();
  }

  hideLogoutButton()
  {

    if(this.auth.isUserLoggedIn() == true)
      return false;
      else {
        return true;
      }
  }

  isUserSignedIn()
  {

    if(this.auth.isUserLoggedIn() == true)
      return true;
      else {
        return false;
      }
  }

}
