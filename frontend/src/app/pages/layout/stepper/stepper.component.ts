import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NbStepperComponent, NbToastrService} from '@nebular/theme';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import {JSEncrypt} from 'jsencrypt';

@Component({
  selector: 'ngx-stepper',
  templateUrl: 'stepper.component.html',
  styleUrls: ['stepper.component.scss'],
})
export class StepperComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper: NbStepperComponent;
  availableBeneficiaries = [];

  amountFormError = false;
  beneficiaryFormError = false;
  diginalSignatureFormError = false;
  description = '';
  amount = 0;
  to = {
    id: 0,
    dni: '',
    name: '',
    surnames: '',
  };
  pubKey = '';
  generatedTransactionId = 0;
  decryptionError = false;

  constructor(private http: HttpClient, private toastrService: NbToastrService) {
  }

  ngOnInit() {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    this.http.get('http://localhost:8080/users', requestOptions).subscribe((users: []) => {
      this.availableBeneficiaries = users;
    }, (err) => {
      console.error(err);
    });
  }

  amountForm() {
    if (this.amount <= 0 || this.description === undefined || this.description === null || this.description === '') {
      this.amountFormError = true;
    } else {
      this.amountFormError = false;
      this.stepper.next();
    }
  }

  beneficiaryForm() {
    if (this.to.dni === undefined || this.to.dni === ''
      || !this.availableBeneficiaries.find((u) => u.dni === this.to.dni)) {
      this.beneficiaryFormError = true;
    } else {
      this.beneficiaryFormError = false;
      this.stepper.next();
    }
  }

  digitalSignatureForm() {
    if (this.pubKey === undefined || this.pubKey === null || this.pubKey === '' || this.pubKey !== localStorage.getItem('pubKey')) {
      this.diginalSignatureFormError = true;
    } else {
      this.diginalSignatureFormError = false;
      this.stepper.next();
    }
  }

  reviewForm() {
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    };

    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };

    const jwt = localStorage.getItem('jwt');
    console.info(jwt);
    const user = jwt_decode(localStorage.getItem('jwt'))['user'];
    console.info(user);
    const cipher = new JSEncrypt();

    cipher.setPublicKey(this.pubKey);

    this.http.put(`http://localhost:8080/transaction?dni_to=${this.to.dni}`,
      {
        'description': this.description,
        'pub_key': this.pubKey,
        'amount': cipher.encrypt(String(this.amount)),
        'from': {'id': user['id']},
        'to': {'id': this.to.id},
      }, requestOptions).subscribe((transaction) => {
      console.info(transaction);
      this.generatedTransactionId = transaction['id'];
      this.stepper.next();
      this.resetForm();
    }, (err) => {
      this.toastrService.show(
        'Invalid decryption key while decrypting your pubkey. Have you signed it on another device?',
        `Invalid decryption public key (assymetric)`,
        {status: 'danger'});
      this.resetForm();
      this.decryptionError = true;
      this.stepper.next();
    });
  }

  resetForm() {
    this.amountFormError = false;
    this.beneficiaryFormError = false;
    this.diginalSignatureFormError = false;
    this.description = '';
    this.amount = 0;
    this.to = {
      id: 0,
      dni: '',
      name: '',
      surnames: '',
    };
    this.pubKey = '';
    this.generatedTransactionId = 0;
    this.decryptionError = false;
  }

  ngOnDestroy(): void {
    this.stepper.reset();
    this.resetForm();
  }

}
