import { HttpClient } from '@angular/common/http';
import { Component, Inject, Renderer2 } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  apiUrl = environment.apiUrl
  constructor(private http: HttpClient, public toastService: ToastService) {}

  testGet() {
    this.http.get<any>(this.apiUrl+'api/v1').subscribe((data) => {
      console.log(data)
    });
  }
}
