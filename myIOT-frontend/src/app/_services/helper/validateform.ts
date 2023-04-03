import { FormControl, FormGroup } from "@angular/forms";


export default class ValidateForm {
    ValidateAllFormFields (formGroup : FormGroup) {
        Object.keys(formGroup.controls).forEach(fieldName => {
            const control = formGroup.get(fieldName);

            if (control instanceof FormControl) {
                control.markAsDirty({ onlySelf: true });
             } 
             else if (control instanceof FormGroup) {
                this.ValidateAllFormFields(control);
             }
        })
    }
}