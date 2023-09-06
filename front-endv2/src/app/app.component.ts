import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { httpService } from '../services/http-service.service';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private http: httpService, private modalService: NgbModal, private config: NgbModalConfig) {
    config.backdrop = 'static';
		config.keyboard = false;
  }

  @ViewChild('content2') content2 : any;

  openModal() {
    this.modalService.open(this.content2);
  }

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
    this.http
      .post(environment.apiUrl + 'api/v1/signup', this.loginInfo)
      .subscribe((data) => {
        this.user = data.user;
      });
  }

  login() {
    this.http
      .post(environment.apiUrl + 'api/v1/signin', this.loginInfo)
      .subscribe((data) => {
        this.user = data.user;
        if (this.user){
          this.modalService.dismissAll('User logged in!');
        }
      });
  }

  ngOnInit() {
    this.http.get(environment.apiUrl + 'api/v1/user').subscribe((data) => {
      this.user = data.user;
      if (!this.user){
        this.openModal();
      }
    });
  }
}
