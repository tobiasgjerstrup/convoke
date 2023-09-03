import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { httpService } from '../services/http-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private http: httpService) {}
  title = 'front-endv2';

  user = '';
  loginInfo = { pass: '', user: '' };

  updateField(value: string, event: any) {
    if (event.key === 'Enter') {
      this.login();
      return;
    }
    if (value === 'pass') this.loginInfo.pass = event.target.value;
    else this.loginInfo.user = event.target.value;
  }

  register() {
    const test = this.http
      .post(environment.apiUrl + 'api/v1/signup', this.loginInfo)
      .subscribe((data) => {
        this.user = data.user;
      });
  }

  login() {
    const test = this.http
      .post(environment.apiUrl + 'api/v1/signin', this.loginInfo)
      .subscribe((data) => {
        this.user = data.user;
      });
  }

  ngOnInit() {
    this.http.get(environment.apiUrl + 'api/v1/').subscribe((data) => {
      this.user = data.user;
    });
  }
}
