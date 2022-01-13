import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LocalDataSource, ViewCell} from 'ng2-smart-table';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NbDialogRef, NbDialogService} from '@nebular/theme';


@Component({
  selector: 'ngx-name-prompt',
  template: `
    <nb-card>
      <nb-card-header>Amount for transaction: {{rowData.id}}</nb-card-header>
      <nb-card-body>
        <nb-alert status="success" *ngIf="decrypted">
          The amount is: {{decryptedAmount}}€
        </nb-alert>

        <nb-alert status="danger" *ngIf="!decrypted && error">
          Wrong decryption key.
        </nb-alert>
        <input name="inputKey" [(ngModel)]="inputKey" nbInput placeholder="Decryption key" *ngIf="!decrypted">
      </nb-card-body>
      <nb-card-footer>
        <button nbButton status="danger" (click)="cancel()" *ngIf="!decrypted">Cancel</button>
        <button nbButton fullWidth status="primary" (click)="cancel()" *ngIf="decrypted">Understood</button>
        <button nbButton status="success" (click)="decrypt()" *ngIf="!decrypted">Decrypt</button>
      </nb-card-footer>
    </nb-card>
  `,
})
export class DialogNamePromptComponent {
  @Input() rowData: any;
  decrypted = false;
  decryptedAmount = 0;
  error = false;
  inputKey = '';

  constructor(protected dialogRef: NbDialogRef<DialogNamePromptComponent>, private http: HttpClient) {
  }

  cancel() {
    this.decrypted = false;
    this.error = false;
    this.rowData = null;
    this.decryptedAmount = 0;
    this.inputKey = '';
    this.dialogRef.close();
  }

  decrypt() {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    this.http.get(
      `http://localhost:8080/transaction/view?transaction_id=
      ${parseInt(this.rowData.id, 10)}&decription_dni_key=${this.inputKey}`, requestOptions).subscribe((data) => {
      console.info(data);
      this.error = false;
      this.decrypted = true;
      this.decryptedAmount = data['decryptedAmount'];
    }, (err) => {
      this.error = true;
      console.error(err);
    });
  }
}

@Component({
  selector: 'ngx-button-view',
  template: `
    <button (click)="onClick()">{{ renderValue }}</button>
  `,
})
export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();


  constructor(private dialogService: NbDialogService) {

  }

  ngOnInit() {
    this.renderValue = this.value.toString().toUpperCase();
  }

  onClick() {
    this.dialogService.open(DialogNamePromptComponent, {context: {rowData: this.rowData}})
      .onClose.subscribe(rowData => this.rowData);
    this.save.emit(this.rowData);
  }
}


@Component({
  selector: 'ngx-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.scss'],
})
export class SmartTableComponent implements OnInit {

  settings = {
    actions: false,
    columns: {
      id: {
        title: 'ID',
        type: 'number',
      },
      description: {
        title: 'Description',
        type: 'string',
      },
      encryptedAmount: {
        title: 'Encrypted Amount',
        type: 'string',
      },
      to: {
        title: 'To',
        type: 'string',
        valuePrepareFunction: (row) => {
          return row['name'] + ' ' + row['surnames'];
        },
        filterFunction: (row, search) => {
          return (row['name'] + ' ' + row['surnames']).toLocaleLowerCase().includes(search.toLocaleLowerCase());
        },
      },
      from: {
        title: 'From',
        type: 'string',
        valuePrepareFunction: (row) => {
          return row['name'] + ' ' + row['surnames'];
        },
        filterFunction: (row, search) => {
          return (row['name'] + ' ' + row['surnames']).toLocaleLowerCase().includes(search.toLocaleLowerCase());
        },
      },
      button: {
        title: 'Button',
        type: 'custom',
        renderComponent: ButtonViewComponent,
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();

  constructor(private http: HttpClient) {

  }

  async ngOnInit() {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    this.http.get('http://localhost:8080/transactions', requestOptions).subscribe((data: any[]) => {
      console.info('historical ok', data);
      data.forEach((row) => {
        row.button = 'Decrypt data';
      });
      this.source.load(data);
    }, (err) => {
      console.info('historical err', err);
    });

  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
}
