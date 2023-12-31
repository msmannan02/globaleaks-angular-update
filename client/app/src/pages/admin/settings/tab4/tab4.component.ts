import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { NodeResolver } from 'app/src/shared/resolvers/node.resolver';
import { UtilsService } from 'app/src/shared/services/utils.service';

@Component({
  selector: 'src-tab4',
  templateUrl: './tab4.component.html',
  styleUrls: ['./tab4.component.css']
})
export class Tab4Component {
  @Input() contentForm: NgForm;
  vars: any = {};
  custom_texts: any = {};
  default_texts: any = {};
  custom_texts_selector: any[] = [];
  customTextsExist: boolean = false;

  languages_enabled: any = {};
  languages_enabled_selector: any[] = [];
  languages_supported: any = {};
  constructor(public utilsService: UtilsService, public node: NodeResolver, config: NgbTooltipConfig) { }

  ngOnInit(): void {
    this.initLanguages();
  }

  initLanguages(): void {
    this.languages_supported = {};
    this.languages_enabled = {};
    this.languages_enabled_selector = [];
    this.node.dataModel.languages_supported.forEach((lang: any) => {
      this.languages_supported[lang.code] = lang;

      if (this.node.dataModel.languages_enabled.indexOf(lang.code) !== -1) {
        this.languages_enabled[lang.code] = lang;
        this.languages_enabled_selector.push(lang);
      }
    });
    this.vars = {
      "language_to_customize": this.node.dataModel.default_language
    };
    this.get_l10n(this.vars.language_to_customize);
  }


  get_l10n(lang: any): void {
    if (!lang) {
      return;
    }
    this.utilsService.AdminL10NResource(lang).subscribe(res => {
      this.custom_texts = res
      this.customTextsExist = Object.keys(this.custom_texts).length > 0;
    })

    this.customTextsKeys()
    this.utilsService.DefaultL10NResource(lang).subscribe(default_texts => {
      const list = [];
      for (const key in default_texts) {
        if (default_texts.hasOwnProperty(key)) {
          let value = default_texts[key];
          if (value.length > 150) {
            value = value.substr(0, 150) + "...";
          }
          list.push({ "key": key, "value": value });
        }
      }
      this.default_texts = default_texts;
      this.custom_texts_selector = list.sort((a, b) => a.value.localeCompare(b.value));
    });
  }
  customTextsKeys(): { key: string }[] {
    return Object.keys(this.custom_texts).map(key => ({ key }));
  }
  updateCustomText(data: any, lang: any) {
    this.utilsService.updateAdminL10NResource(data, lang).subscribe(res => { })
  }
  deleteCustomText(dict: any, key: string): void {
    delete dict[key];
  }

}
