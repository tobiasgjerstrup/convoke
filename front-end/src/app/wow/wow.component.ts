import { HttpClient } from '@angular/common/http';
import { Component, Inject, Renderer2 } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-wow',
  templateUrl: './wow.component.html',
  styleUrls: ['./wow.component.scss'],
})
export class WowComponent {
  items = [{ id: null, name: null, icon: null, quality: 0 }];
  apiSite = 'https://convoke.uk'; // 'https://convoke.uk' 'http://localhost:8080'
  order = 'id';

  maxResults = 2000;
  lazyResults = 1000; //amount of results to load after the initial results has loaded. Initial amount is maxResults - lazyResults
  constructor(private http: HttpClient, public toastService: ToastService, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document: Document) {}

  public ngOnInit() {
    //load scripts
    let script = this._renderer2.createElement('script');
    script.src = 'https://wow.zamimg.com/js/tooltips.js';
    this._renderer2.appendChild(this._document.body, script);
  }

  public getQuality(quality: number) {
    switch (quality) {
      case 1:
        return '#ffffff';
      case 2:
        return '#1eff00';
      case 3:
        return '#0070dd';
      case 4:
        return '#a335ee';
      case 5:
        return '#ff8000';
      case 6:
        return '#e5cc80';
      case 7:
        return '#00ccff';
      case 8:
        return '#00ccff';
      default:
        return '#9d9d9d';
    }
  }
  updateOrder(event: any) {
    this.order = event.target.value;
  }
  search(event: any) {
    this.http.get<any>(this.apiSite + '/api/v1/?count=true&search=' + event.target.value).subscribe((count) => {
      console.log(count[0].count);
      if (count[0].count > this.maxResults) {
        this.showDanger('Found ' + count[0].count + ' Items' + ' Limit is ' + this.maxResults);
        this.showSuccess('Showing ' + this.maxResults + ' Items');
      } else if (count[0].count > 0) this.showSuccess('Found ' + count[0].count + ' Items');
      else this.showDanger('Your search gave 0 results');
      const initResults = this.maxResults - this.lazyResults;
      this.http.get<any>(this.apiSite + '/api/v1/?limit=' + initResults + '&order=' + this.order + '&search=' + event.target.value).subscribe((data) => {
        this.items = data;
        if (count[0].count > initResults) {
          this.http.get<any>(this.apiSite + '/api/v1/?limit=' + this.lazyResults + '&order=' + this.order + '&offset=' + initResults + '&search=' + event.target.value).subscribe((extraData) => {
            this.items = this.items.concat(extraData);
          });
        }
      });
    });
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
