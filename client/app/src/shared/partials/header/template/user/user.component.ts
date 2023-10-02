import {ChangeDetectorRef, Component} from '@angular/core';
import {AuthenticationService} from "../../../../../services/authentication.service";
import {PreferenceResolver} from "../../../../resolvers/preference.resolver";
import {AppConfigService} from "../../../../../services/app-config.service";
import {UtilsService} from "../../../../services/utils.service";
import {AppDataService} from "../../../../../app-data.service";
import {TranslationService} from "../../../../../services/translation.service";
import {TranslateService} from "@ngx-translate/core";
import {HttpService} from "../../../../services/http.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'views-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

  constructor(public activatedRoute: ActivatedRoute, public httpService: HttpService, public appConfigService: AppConfigService, public translateSersvice: TranslateService, private cdr: ChangeDetectorRef,public translateService: TranslationService ,public authentication: AuthenticationService, public preferences:PreferenceResolver, public appConfig: AppConfigService, public utils: UtilsService, public appDataService:AppDataService, public translationService:TranslationService) {
    this.onQueryParameterChangeListener()
  }

  onQueryParameterChangeListener(){
    this.activatedRoute.queryParams.subscribe(params => {
      let storageLanguage = localStorage.getItem("default_language")
      if(params['lang']){
        const paramLangValue = params['lang'] && this.appDataService.public.node.languages_enabled.includes(params['lang']) ? params['lang'] : '';
        if(storageLanguage != paramLangValue){
          this.translationService.onChange(paramLangValue)
          this.appConfigService.reinit(false)
          this.utils.reloadCurrentRouteFresh()
        }
        localStorage.setItem("default_language", paramLangValue)
      }
    });
  }

  onChangeLanguage() {
    this.cdr.detectChanges();

    localStorage.setItem("default_language", this.translationService.language)
    this.translationService.onChange(this.translationService.language)
    this.appConfigService.reinit(false)
    this.utils.reloadCurrentRouteFresh()
  }
}
