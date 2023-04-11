import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private auth : AuthService) { }

  ngOnInit(): void {
  }

  isUserSignedIn()
  {

    if(this.auth.isUserLoggedIn() == true)
      return false;
      else {
        return true;
      }
  }

}
