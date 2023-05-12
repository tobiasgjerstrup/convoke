import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastService } from './services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'convoke';
  user = '';
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, public toastService: ToastService) {}

  login() {
    this.http.get<any>(this.apiUrl+'api/v1').subscribe((data) => {
      console.log(data);
      this.user = data.user;
    });
  }

  ngOnInit() {
    console.log(this.apiUrl);
    this.login();
  }
}
