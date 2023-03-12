import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-wow',
  templateUrl: './wow.component.html',
  styleUrls: ['./wow.component.scss']
})
export class WowComponent {

  items = [{ id: null, name: null, icon: null }]

  constructor(private http: HttpClient) { }

  test(event: any) { // without type info
    this.http.get<any>('https://convoke.uk/api/v1/$limit=1000$order=asc$search=' + event.target.value).subscribe(data => {
      this.items = data
    });
  }
}
