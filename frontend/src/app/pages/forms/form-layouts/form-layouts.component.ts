import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NbDialogRef, NbDialogService, NbToastrService} from '@nebular/theme';
import {Router} from '@angular/router';
import {DialogNamePromptComponent} from '../../tables/smart-table/smart-table.component';

@Component({
  selector: 'ngx-pubkey-dialog',
  template: `
    <nb-card>
      <nb-card-header>Your transaction key</nb-card-header>
      <nb-card-body>
        <button nbButton status="primary" (click)="download($event)">
          <nb-icon icon="clipboard-outline"></nb-icon>
          Download
        </button>
        <textarea nbInput fullWidth disabled>{{pubKey}}</textarea>
      </nb-card-body>
      <nb-card-footer>
        <button nbButton status="danger" (click)="close()">I've already copied</button>
      </nb-card-footer>
    </nb-card>
  `,
})
export class PubKeyDialogComponent implements OnInit {
  pubKey = '';

  public download(event: MouseEvent): void {

    const blob = new Blob([this.pubKey], {type: 'text'});
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  constructor(protected dialogRef: NbDialogRef<DialogNamePromptComponent>, private router: Router) {
  }

  ngOnInit(): void {
    this.pubKey = localStorage.getItem('pubKey');
  }


  close() {
    this.dialogRef.close();

    this.router.navigateByUrl('/pages/tables/smart-table').then(() => {

    });
  }
}

@Component({
  selector: 'ngx-form-layouts',
  styleUrls: ['./form-layouts.component.scss'],
  templateUrl: './form-layouts.component.html',
})
export class FormLayoutsComponent {
  dni = '';
  pass = '';

  constructor(private http: HttpClient, private toastrService: NbToastrService, private router: Router,
              private dialogService: NbDialogService) {
  }

  doLogin() {
    this.http.post(`http://localhost:8080/auth?dni=${this.dni}&password=${this.pass}`, null).subscribe(async (data) => {
      this.toastrService.show(
        'You were logged in successfully.',
        `Success login`,
        {status: 'success'});

      this.toastrService.show(
        data['jwt'],
        `JWT`,
        {status: 'primary'});
      localStorage.setItem('jwt', data['jwt']);
      localStorage.setItem('pubKey', data['pubKey']);
      this.dialogService.open(PubKeyDialogComponent, {});
    }, () => {
      this.toastrService.show(
        'Could not login with provided credentials.',
        `Invalid login`,
        {status: 'danger'});
    });
  }

}
