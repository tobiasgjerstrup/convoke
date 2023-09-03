import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class httpService {
  constructor(private http: HttpClient) {}

  get(url: string) {
    url = this.appendCredentials(url);
    return this.http.get<any>(url);
  }
  post(url: string, body: any) {
    url = this.appendCredentials(url);
    return this.http.post<any>(url, body);
  }

  put(url: string, body: any) {
    url = this.appendCredentials(url);
    return this.http.put(url, body);
  }

  delete(url: string, body: any) {
    url = this.appendCredentials(url);
    return this.http.delete<any>(url, {body: body});
  }

  appendCredentials(url: string) {
    if (environment.apiUser !== '' && environment.apiPass !== '') {
      if (!url.includes('?')) url += '?user=';
      else url += '&user=';
      url += environment.apiUser + '&pass=' + environment.apiPass;
    }
    return url;
  }
}
