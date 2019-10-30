import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray
} from "@angular/forms";

@Component({
  selector: "app-create-employee",
  templateUrl: "./create-employee.component.html",
  styleUrls: ["./create-employee.component.css"]
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  fullNameLength: number;
  updateExperience: boolean = false;

  // This object contains all the validation messages for this form
  validationMessages = {
    fullName: {
      required: "Full Name is required.",
      minlength: "Full Name must be greater than 2 characters.",
      maxlength: "Full Name must be less than 15 characters."
    },
    email: {
      required: "Email is required.",
      emailDomain: "Email domain should be 'canada.com'"
    },
    emailConfirmation: {
      required: "please confirm your email"
    },
    emailGroup: {
      mismatch: "email entered do not match with email confirmed"
    },
    phone: {
      required: "Phone is required."
    }
  };

  // This object will hold the messages to be displayed to the user
  // Notice, each key in this object has the same name as the corresponding form control
  formErrors = {
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
      fullName: [
        "" /*1er indice pour default value*/,
        [Validators.required, Validators.minLength(2), Validators.maxLength(15)]
      ],
      // Si un seul validator alors pas la peine de le mettre dans un array, ça sera comme ça --> ['', Validators.required]
      contactPreference: ["email"],
      emailGroup: this.fb.group(
        {
          email: [
            "",
            [Validators.required, customValidationEmailDomain("canada.com")]
          ],
          emailConfirmation: ["", [Validators.required]]
        },
        {
          validators: checkEmailMatching
        } /*attach this nested group to checkEmailMatching function*/
      ),

      phone: [""],
      skills: this.fb.array([
        this.addSkillsFormGroup()
      ])
    });

    // subscribing to valueChanges. This method is exposed in AbstractControl so inherited by FormGroup and FormControl.
    // it returns Observable<any>
    this.employeeForm
      .get("fullName")
      .valueChanges.subscribe((value: string) => {
        this.fullNameLength = value.length;
      });

    this.employeeForm.valueChanges.subscribe(data => {
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm
      .get("contactPreference")
      .valueChanges.subscribe((valRadioSelected: string) => {
        this.onContactPreferenceChange(valRadioSelected);
      });
  } // End ngOnInit()

  addSkillsFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ["", Validators.required],
      experienceInYears: ["", Validators.required],
      proficiency: ["", Validators.required]
    })
  }

  AddSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillsFormGroup());
  }

  //cette methode souscrit a valuesChange (voir ngOnInt)
  logValidationErrors(group: FormGroup = this.employeeForm) {
    Object.keys(group.controls).forEach(key => {
      const abstractControl = group.get(key);

      //effacer d'abord message historique
      this.formErrors[key] = "";

      if (abstractControl &&
        !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty)) {

        const messages = this.validationMessages[key];
        //console.log(abstractGroup.errors) si par exemple abstractGroup concerne fullName
        //et fullname pas renseigné --> {required: true}

        for (const errorKey /*exemple required*/ in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + " ";
          }
        }
        if (abstractControl instanceof FormGroup) {
          this.logValidationErrors(abstractControl);
        }
      }
    });
  }

  loadData(): void {
    const formArray = this.fb.array([
      new FormControl('Elie', Validators.required),
      new FormGroup({
        country: new FormControl('defaultCountry', Validators.required)
      })
    ]);
    formArray.push(new FormControl('ABC'));

    console.log(formArray.at(formArray.length - 1).value)
  }

  ChargerDataWithPatchValueAndSetValue(): void {
    this.employeeForm.setValue({
      fullName: "me",
      email: "me@com",
      phone: "100-100-1010",
      contactPreference: "phone",
      skills: {
        skillName: "angular-react-js-c#",
        experienceInYears: 2,
        proficiency: "intermediate"
      }
    });
    this.updateExperience = !this.updateExperience;
  }

  UpdateExperienceWithPatchValue(): void {
    this.employeeForm.patchValue({
      skills: {
        experienceInYears: 5,
        proficiency: "advanced"
      }
    });
    this.updateExperience = !this.updateExperience;
  }

  loopAndLogThrougFormGroup(group: FormGroup): void {
    const keys: string[] = Object.keys(group.controls);
    keys.forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.loopAndLogThrougFormGroup(abstractControl);
        // abstractControl.disable(); si on veut desactiver uniquement le nested group
      } else {
        console.log("key = " + key, " | Value = " + abstractControl.value);
        abstractControl.disable();
        //abstractControl.markAsPending(); ...etc
      }
    });
  }

  logFormErrors(group: FormGroup) {
    this.logValidationErrors(group); //il va remplis formErrors
    console.log(this.formErrors);
  }

  onContactPreferenceChange(valRadioButtonSelected: string) {
    const phoneControl = this.employeeForm.get("phone");
    if (valRadioButtonSelected === "phone") {
      phoneControl.setValidators([Validators.required]); //method in AbsractControl
    } else {
      phoneControl.clearValidators(); //method in AbsractControl
    }
    phoneControl.updateValueAndValidity(); //pour appliquer les changement immediatement (method in AbsractControl)
  }

  onSubmit(): void {
    console.log(this.employeeForm.value);
  }

  removeSkillsButtonClicked(index: number) : void{
    (<FormArray>this.employeeForm.get('skills')).removeAt(index);
  }
}

function customValidationEmailDomain(emailDomain: string) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const email: string = control.value;
    const domain = email.substring(email.lastIndexOf("@") + 1);
    if (email == "" || domain.toUpperCase() === emailDomain.toUpperCase()) {
      return null;
    } else {
      return { emailDomain: true };
    }
  };
}

//cette fonction doit être attachée au nested group emailGroup
function checkEmailMatching(
  emailGroup: AbstractControl
): { [key: string]: any } | null {
  const emailControl = emailGroup.get("email");
  const emailConfirmedControl = emailGroup.get("emailConfirmation");
  if (emailConfirmedControl.pristine /*i.e pas de saisie encore*/ ||
    emailControl.value === emailConfirmedControl.value) {
    return null;
  }
  return { 'mismatch': true };
}
