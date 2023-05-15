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
  loginInfo = { pass: '', user: '' };

  constructor(private http: HttpClient, public toastService: ToastService) {}

  updateField(value: string, event: any) {
    if (event.key === 'Enter') {
      this.login();
      return;
    }
    if (value === 'pass') this.loginInfo.pass = event.target.value;
    else this.loginInfo.user = event.target.value;
  }

  register() {
    const test = this.http.post<any>(this.apiUrl + 'api/v1/signup', this.loginInfo).subscribe((data) => {
      this.showToast(data.statuscode, data.message);
      this.user = data.user;
    });
  }

  login() {
    const test = this.http.post<any>(this.apiUrl + 'api/v1/signin', this.loginInfo).subscribe((data) => {
      this.showToast(data.statuscode, data.message);
      this.user = data.user;
    });

    console.log(test);

    /*    this.http.get<any>(this.apiUrl+'api/v1').subscribe((data) => {
      console.log(data);
      this.user = data.user;
    }); */
  }

  showToast(statuscode: string, message: string){
    if (statuscode == '200')
    this.showSuccess(message);
    else 
    this.showDanger(message);
  }

  showSuccess(message: string) {
    this.toastService.show(message, { classname: 'bg-success text-light', delay: 5000 });
  }

  showDanger(message: string) {
    this.toastService.show(message, { classname: 'bg-danger text-light', delay: 5000 });
  }

  ngOnDestroy(): void {
    this.toastService.clear();
  }
}
