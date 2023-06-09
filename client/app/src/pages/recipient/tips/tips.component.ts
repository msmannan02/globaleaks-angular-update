import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppDataService } from 'app/src/app-data.service';
import { DeleteConfirmationComponent } from 'app/src/shared/modals/delete-confirmation/delete-confirmation.component';
import { GrantAccessComponent } from 'app/src/shared/modals/grant-access/grant-access.component';
import { RevokeAccessComponent } from 'app/src/shared/modals/revoke-access/revoke-access.component';
import { PreferenceResolver } from 'app/src/shared/resolvers/preference.resolver';
import { RtipsResolver } from 'app/src/shared/resolvers/rtips.resolver';
import { HttpService } from 'app/src/shared/services/http.service';
import { UtilsService } from 'app/src/shared/services/utils.service';
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: 'src-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.css']
})
export class TipsComponent implements OnInit {
  search: string | undefined;
  selectedTips: any[] = [];
  //TO DO Filter
  filteredTips: any[];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  dropdownSettings = { dynamicTitle: false, showCheckAll: false, showUncheckAll: false, enableSearch: true, displayProp: "label", idProp: "label", itemsShowLimit: 5 };

  reportDateFilter: any = null;
  updateDateFilter: any = null;
  expiryDateFilter: any = null;
  reportDateModel: any = null;
  updateDateModel: any = null;
  expiryDateModel: any = null;
  dropdownStatusModel: any[] = [];
  dropdownStatusData: any[] = [];
  dropdownContextModel: any[] = [];
  dropdownContextData: any[] = [];
  dropdownScoreModel: any[] = [];
  dropdownScoreData: any[] = [];
  sortKey: string = 'creation_date';
  sortReverse: boolean = true;
  //NEED TO CONFIRM FOLLOWING
  index: number;
  date: { year: number; month: number };
  submission_statuses: any;
  reportDatePicker: boolean = false;
  lastUpdatePicker: boolean = false;
  expirationDatePicker: boolean = false;
  oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  selectAll() {
    this.selectedTips = [];
    this.filteredTips.forEach(tip => {
      this.selectedTips.push(tip.id);
    });
  }
  deselectAll() {
    this.selectedTips = []
  }

  openGrantAccessModal() {
    alert('Alert from outside');

    this.utils.runUserOperation("get_users_names", {}, true).subscribe(
      {
        next: response => {
          const modalRef = this.modalService.open(GrantAccessComponent);
          modalRef.componentInstance.users_names = response;
          modalRef.componentInstance.confirmFun = (receiver_id: any) => {
            const args = {
              rtips: this.selectedTips,
              receiver: receiver_id
            };
            return this.utils.runRecipientOperation("grant", args, true);
          };
        },
        error: (error: any) => {
          alert(JSON.stringify(error));
        }
      }
    );
  }

  openRevokeAccessModal() {
    this.utils.runUserOperation("get_users_names", {}, true).subscribe(
      {
        next: response => {
          const modalRef = this.modalService.open(RevokeAccessComponent);
          modalRef.componentInstance.users_names = response;
          modalRef.componentInstance.confirmFun = (receiver_id: any) => {
            const args = {
              rtips: this.selectedTips,
              receiver: receiver_id
            };
            return this.utils.runRecipientOperation("revoke", args, true);
          };
        },
        error: (error: any) => {
          alert(JSON.stringify(error));
        }
      }
    );
  }
  tipDeleteSelected() {
    const modalRef = this.modalService.open(DeleteConfirmationComponent);
    modalRef.componentInstance.selectedTips = this.selectedTips;
    modalRef.componentInstance.operation = "delete";
  }
  tipsExport() {
    for (let i = 0; i < this.selectedTips.length; i++) {
      (function (i) {
        // this.tokenResource.get().subscribe((token: any) => {
        //   window.open(`api/rtips/${this.selectedTips[i]}/export?token=${token.id}:${token.answer}`);
        // });
      })(i);
    }
  }
  reload() {
    this.utils.reloadCurrentRoute();
  }
  tipSwitch(id: number): void {
    this.index = this.selectedTips.indexOf(id);
    if (this.index > -1) {
      this.selectedTips.splice(this.index, 1);
    } else {
      this.selectedTips.push(id);
    }
  }
  isSelected(id: any): boolean {
    return this.selectedTips.indexOf(id) !== -1;
  }
  exportTip(id: number) { }
  markReportStatus(date: string): boolean {
    const report_date = new Date(date);
    const current_date = new Date();
    return current_date > report_date;
  }


  processTips() {
    const uniqueKeys: string[] = [];

    for (let tip of this.rtips.dataModel.rtips) {
      tip.context = this.utils.array_to_map(tip.context_id);
      tip.context_name = tip.context.name;
      tip.questionnaire = this.rtips.dataModel.questionnaires[tip.questionnaire];
      tip.submissionStatusStr = this.utils.getSubmissionStatusText(tip.status, tip.substatus, this.submission_statuses);
      console.log(tip.submissionStatusStr);
      if (!uniqueKeys.includes(tip.submissionStatusStr)) {
        uniqueKeys.push(tip.submissionStatusStr);
        this.dropdownStatusData.push({ id: this.dropdownStatusData.length + 1, label: tip.submissionStatusStr });
      }

      if (!uniqueKeys.includes(tip.context_name)) {
        uniqueKeys.push(tip.context_name);
        this.dropdownContextData.push({ id: this.dropdownContextData.length + 1, label: tip.context_name });
      }

      const scoreLabel = this.utils.maskScore(tip.score);

      if (!uniqueKeys.includes(scoreLabel)) {
        uniqueKeys.push(scoreLabel);
        this.dropdownScoreData.push({ id: this.dropdownScoreData.length + 1, label: scoreLabel });
      }
    }
  }


  //Logic for datepickers


  onReportFilterChange(event: { fromDate: NgbDate | null; toDate: NgbDate | null } | any) {
    const { fromDate, toDate } = event;
    this.reportDateModel = { fromDate, toDate };
    if (!fromDate && !toDate) {
      this.reportDateFilter = null;
      this.closeAllDatePickers();
    } else {
      this.reportDateFilter = [this.utils.getTimestampFromDate(fromDate), this.utils.getTimestampFromDate(toDate)+this.oneDayInMilliseconds]
    }
    this.applyFilter();
  }
  onUpdateFilterChange(event: { fromDate: NgbDate | null; toDate: NgbDate | null } | any) {
    const { fromDate, toDate } = event;
    this.updateDateModel = { fromDate, toDate };
    if (!fromDate && !toDate) {
      this.updateDateFilter = null;
      this.closeAllDatePickers();
    } else {
      this.updateDateFilter = [this.utils.getTimestampFromDate(fromDate), this.utils.getTimestampFromDate(toDate)+this.oneDayInMilliseconds]
    }
    this.applyFilter();
  }
  onExpiryFilterChange(event: { fromDate: NgbDate | null; toDate: NgbDate | null } | any) {
    const { fromDate, toDate } = event;
    this.expiryDateModel = { fromDate, toDate };
    if (!fromDate && !toDate) {
      this.expiryDateFilter = null;
      this.closeAllDatePickers();
    } else {
      this.expiryDateFilter = [this.utils.getTimestampFromDate(fromDate), this.utils.getTimestampFromDate(toDate)+this.oneDayInMilliseconds]
    }
    this.applyFilter();
  }
  applyFilter() {
    this.filteredTips = this.utils.getStaticFilter(this.rtips.dataModel.rtips, this.dropdownStatusModel, "submissionStatusStr");
    this.filteredTips = this.utils.getStaticFilter(this.filteredTips, this.dropdownContextModel, "context_name");
    this.filteredTips = this.utils.getStaticFilter(this.filteredTips, this.dropdownScoreModel, "score");
    this.filteredTips = this.utils.getDateFilter(this.filteredTips, this.reportDateFilter, this.updateDateFilter, this.expiryDateFilter);
  }
  ngOnInit() {
    if(!this.rtips.dataModel){
      this.router.navigate(['/recipient/home']);
    }else {
      this.filteredTips = this.rtips.dataModel.rtips;
    }
  }

  // BODY CLICK HANDLER
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const isContainerClicked = clickedElement.classList.contains('ngb-dtepicker-container') ||
      clickedElement.closest('.ngb-dtepicker-container') !== null;

    if (!isContainerClicked && !this.elementRef.nativeElement.contains(clickedElement)) {
      this.closeAllDatePickers();
    }
  }
  closeAllDatePickers() {
    this.reportDatePicker = false;
    this.lastUpdatePicker = false;
    this.expirationDatePicker = false;
  }
  constructor(public httpService: HttpService,
    public rtips: RtipsResolver,
    public preference: PreferenceResolver,
    public modalService: NgbModal,
    public utils: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    public appDataService: AppDataService,
    private renderer: Renderer2, private elementRef: ElementRef
  ) {

  }
}