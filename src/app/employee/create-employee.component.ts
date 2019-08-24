import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  
  employeeForm: FormGroup;
  fullNameLength : number;

  // This object contains all the validation messages for this form
  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 10 characters.'
    },
    'email': {
      'required': 'Email is required.'
    },
    'phone': {
      'required': 'Phone is required.'
    },
    'skillName': {
      'required': 'Skill Name is required.',
    },
    'experienceInYears': {
      'required': 'Experience is required.',
    },
    'proficiency': {
      'required': 'Proficiency is required.',
    },
  };

  // This object will hold the messages to be displayed to the user
  // Notice, each key in this object has the same name as the corresponding form control
  formErrors = {
    'fullName': '',
    'email': '',
    'skillName': '',
    'experienceInYears': '',
    'proficiency': ''
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Avec FormGroup & FormControl
    // this.employeeForm = new FormGroup({
    //   fullName: new FormControl(),
    //   email: new FormControl(),
    //   skills: new FormGroup({
    //     skillName: new FormControl(),
    //     experienceInYears: new FormControl(),
    //     proficiency: new FormControl()
    //   })
    // });
    // Avec formBuilder
    this.employeeForm = this.fb.group({
      fullName: [ ''/*1er indice pour default value*/ , [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      // Si un seul validator alors pas la peine de le mettre dans un array, ça sera comme ça --> ['', Validators.required]
      contactPreference: ['email'],
      email: ['', Validators.required],
      phone: [''],
      skills: this.fb.group({
        skillName: ['', Validators.required],
        experienceInYears: ['', Validators.required],
        proficiency: ['', Validators.required]
      })
    });

    // subscribing to valueChanges. This method is exposed in AbstractControl so inherited by FormGroup and FormControl. 
    // it returns Observable<any>
    this.employeeForm.get('fullName').valueChanges.subscribe((value: string) => {
      this.fullNameLength = value.length;
    });

    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.get('contactPreference').valueChanges.subscribe((valRadioSelected : string) => {
      this.onContactPreferenceChange(valRadioSelected);
    });
  }// End ngOnInit()

  //cette methode souscrit a valuesChange (vois ds ngOnInt)
  logValidationErrors(group : FormGroup = this.employeeForm){
    Object.keys(group.controls).forEach(key => {
      
      const abstractControl = group.get(key);

      if(abstractControl instanceof FormGroup){
        this.logValidationErrors(abstractControl);
      }else{
        //effacer d'abord message historique
        this.formErrors[key] = '';

        if(abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)){         
          const messages = this.validationMessages[key];

          //console.log(abstractGroup.errors) si par exemple abstractGroup concerne fullName 
          //et fullname pas renseigné --> {required: true}

          for(const errorKey /*exemple required*/ in abstractControl.errors){
            if(errorKey){
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }

  ChargerDataWithPatchValueAndSetValue(): void {
    this.employeeForm.setValue({
      fullName: 'moi',
      email: 'moi@com',

      skills: {
        skillName: 'All',
        experienceInYears: 2,
        proficiency: 'intermediate'
      }
    });
  }

  loopAndLogThrougFormGroup(group: FormGroup): void {
    const keys: string[] = Object.keys(group.controls);
    keys.forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.loopAndLogThrougFormGroup(abstractControl);
        // abstractControl.disable(); si on veut desactiver uniquement le nested group
      } else {
        console.log('key = ' + key, 'Value = ' + abstractControl.value);
        abstractControl.disable();
        // abstractControl.markAsDirty() ...etc
      }
    });
  }

  logFormErrors(group : FormGroup){
    this.logValidationErrors(group); //il va remplis formErrors
    console.log(this.formErrors);
  }

  onContactPreferenceChange(valRadioButtonSelected : string){
    const phoneControl = this.employeeForm.get('phone');
    if(valRadioButtonSelected === 'phone'){
      phoneControl.setValidators([Validators.required]) //method in AbsractControl
    }else{
      phoneControl.clearValidators() //method in AbsractControl
    }
    phoneControl.updateValueAndValidity(); //pour appliquer les changement immediatement (method in AbsractControl)
  }

  onSubmit(): void {
    console.log(this.employeeForm.value);
  }
}
