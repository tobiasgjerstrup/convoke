import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-git-history',
  templateUrl: './git-history.component.html',
  styleUrls: ['./git-history.component.scss']
})
export class GitHistoryComponent {
  commits = [{ commit: { committer: { name: null, date: null }, message: null }, html_url: null, stats: { additions: null, deletions: null }, files: null }]

  constructor(private http: HttpClient, public toastService: ToastService) { }

  ngOnInit() {
    this.http.get<any>('https://api.github.com/repos/tobiasgjerstrup/convoke/commits').subscribe(data => {
      data.forEach((element: any) => {
        this.http.get<any>(element.url).subscribe(commit => {
          this.commits = this.commits.concat(commit)
        });
      });
      this.commits = this.commits.splice(1, 1);
    });
  }
}


/*
commits [
  0:[
    author: string
    stats: [
      deletions: string
      additions: string
    ]
    time: string
    url: string
  ]
]
*/