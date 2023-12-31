import {Component} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from "../../services/utils.service";
import {PreferenceResolver} from "../../resolvers/preference.resolver";
import {TwofactorauthData} from "../../../services/2fa.data.service";

@Component({
  selector: 'src-enable2fa',
  templateUrl: './enable2fa.component.html'
})
export class Enable2faComponent {

  constructor(private preferenceResolver: PreferenceResolver, private activeModal: NgbActiveModal, private utilsService: UtilsService, public twoFactorAuthData: TwofactorauthData) {
  }

  dismiss() {
    this.activeModal.dismiss()
  }

  confirm() {
    let requestObservable = this.utilsService.runUserOperation("enable_2fa", {
      "secret": this.twoFactorAuthData.totp.secret,
      "token": this.twoFactorAuthData.totp.token
    }, true);
    requestObservable.subscribe(
      {
        next: response => {
          this.preferenceResolver.dataModel.two_factor = true;
          this.activeModal.dismiss()
        },
        error: (error: any) => {
          this.utilsService.reloadCurrentRoute();
        }
      }
    );
  }
}
