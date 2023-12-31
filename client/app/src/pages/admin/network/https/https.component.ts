import { Component, OnInit } from '@angular/core';
import { Constants } from 'app/src/shared/constants/constants';
import { NodeResolver } from 'app/src/shared/resolvers/node.resolver';
import { HttpService } from 'app/src/shared/services/http.service';
import { UtilsService } from 'app/src/shared/services/utils.service';

@Component({
  selector: 'src-https',
  templateUrl: './https.component.html',
  styleUrls: ['./https.component.css']
})
export class HttpsComponent implements OnInit {
  protected readonly Constants = Constants;
  hostname: any
  state = 0;
  menuState = "setup";
  tlsConfig: any;
  constructor(public node: NodeResolver, public httpService: HttpService, public utilsService: UtilsService) { }
  ngOnInit() {
    this.initFunction()
  }
  initFunction() {
    this.httpService.requestTlsConfigResource().subscribe(

      (config: any) => {
        this.parseTLSConfig(config);
      },
      (error: any) => {
      }
    );
  }
  updateHostname(hostname:any) {
    this.utilsService.runAdminOperation('set_hostname', { 'value': hostname }, true)
    this.utilsService.reloadCurrentRoute()
  }
  parseTLSConfig(tlsConfig: any): void {
    this.tlsConfig = tlsConfig;

    let t = 0;
    let choice = 'setup';

    if (!tlsConfig.acme) {
      if (tlsConfig.files.key.set) {
        t = 1;
      }

      if (tlsConfig.files.cert.set) {
        t = 2;
      }

      if (tlsConfig.files.chain.set) {
        t = 3;
      }
    } else if (
      tlsConfig.files.key.set &&
      tlsConfig.files.cert.set &&
      tlsConfig.files.chain.set
    ) {
      t = 3;
    }

    if (tlsConfig.enabled) {
      choice = 'status';
      t = -1;
    } else if (t > 0) {
      choice = 'files';
    }

    this.state = t;
    this.menuState = choice;
  }

  httpsSetup(data: string) {
    if (data) {
      this.menuState = data
    }
    if (!data) {
      this.initFunction()
    }
    // this.utilsService.reloadCurrentRoute()
  }
  httpsFiles(data: string) {
    if (data) {
      this.menuState = data
    }
    if (!data) {
      this.initFunction()
    }
    // this.utilsService.reloadCurrentRoute()
  }
  httpsStatus(data: string) {
    if (data) {
      this.menuState = data
    }
    if (!data) {
      this.initFunction()
    }
    // this.utilsService.reloadCurrentRoute()
  }
}
