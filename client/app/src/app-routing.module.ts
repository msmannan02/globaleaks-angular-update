import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './pages/auth/auth-routing.module';
import {AdminRoutingModule} from "./pages/admin/admin-routing.module";
import {RouterModule, Routes} from "@angular/router";
import {SessionGuard} from "./app-guard.service";
import { HomeComponent } from './pages/dashboard/home/home.component';
import {PasswordResetResponseComponent} from "./pages/auth/password-reset-response/password-reset-response.component";
import {RecipientRoutingModule} from "./pages/recipient/recipient-routing.module";
import {PreferenceResolver} from "./shared/resolvers/preference.resolver";
import {ActionRoutingModule} from "./pages/action/action-routing.module";
import {SignupRoutingModule} from "./pages/signup/signup-routing.module";
import {Pageguard} from "./shared/guards/pageguard.service";
import {ActivationComponent} from "./pages/signup/templates/activation/activation.component";
import {WizardRoutingModule} from "./pages/wizard/wizard-routing.module";
import { NodeResolver } from './shared/resolvers/node.resolver';
import { RtipsResolver } from './shared/resolvers/rtips.resolver';
import { TipComponent } from './pages/recipient/tip/tip.component';
import { UsersResolver } from './shared/resolvers/users.resolver';
import { QuestionnairesResolver } from './shared/resolvers/questionnaires.resolver';
import {AuditlogResolver} from "./shared/resolvers/auditlog.resolver";
import {JobResolver} from "./shared/resolvers/job.resolver";
import {TipsResolver} from "./shared/resolvers/tips.resolver";
import { ContextsResolver } from './shared/resolvers/contexts.resolver';
import { NotificationsResolver } from './shared/resolvers/notifications.resolver';
import { NetworkResolver } from './shared/resolvers/network.resolver';
import { RedirectsResolver } from './shared/resolvers/redirects.resolver';
import { FieldtemplatesResolver } from './shared/resolvers/fieldtemplates.resolver';
import {TitleResolver} from "./shared/resolvers/title-resolver.resolver";
import { StatuseResolver } from './shared/resolvers/statuses.resolver';
import {CustodianRoutingModule} from "./pages/custodian/custodian-routing.module";
import {IarsResolver} from "./shared/resolvers/iars.resolver";


const routes: Routes = [
  {
    path: 'blank',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [Pageguard],
    component: HomeComponent,
    data: { pageTitle: ''},
    resolve: {
    },
    pathMatch: 'full',
   
  },
  {
    path: 'login',
    
    resolve: {

    },
    loadChildren: () => AuthRoutingModule,
  },
  {
    path: 'signup',
    resolve: {
      PreferenceResolver
    },
    loadChildren: () => SignupRoutingModule,
   
  },
  {
    path: 'action',
    resolve: {
    },
    loadChildren: () => ActionRoutingModule,
  },
  {
    path: 'recipient',
    canActivate: [SessionGuard],
    resolve: {
      PreferenceResolver,NodeResolver,RtipsResolver
    },
    loadChildren: () => RecipientRoutingModule,
    data:{
      sidebar: 'recipient-sidebar'
    }
  },
  {
    path: 'custodian',
    canActivate: [SessionGuard],
    resolve: {
      PreferenceResolver,NodeResolver, RtipsResolver, IarsResolver
    },
    loadChildren: () => CustodianRoutingModule,
    data:{
      sidebar: 'custodian-sidebar'
    }
  },
  {
    path: 'admin',
    canActivate: [SessionGuard],
    resolve: {
      NodeResolver,PreferenceResolver,UsersResolver,QuestionnairesResolver, ContextsResolver, AuditlogResolver, JobResolver, TipsResolver,NotificationsResolver,NetworkResolver,RedirectsResolver,FieldtemplatesResolver,StatuseResolver
    },
    loadChildren: () => AdminRoutingModule,
    data:{
      sidebar: 'admin-sidebar', pageTitle: 'Home'
    }
  },
  {
    path: 'password/reset',
    component: PasswordResetResponseComponent,
  },
  {
    path: 'activation',
    component: ActivationComponent,
  },
  {
    path: 'wizard',
    data: { pageTitle: 'Platform wizard' },
    resolve: {
      PreferenceResolver,
      title: TitleResolver
    },
    loadChildren: () => WizardRoutingModule,
  },
  {
    path: 'status/:tip_id',
    component: TipComponent,
    pathMatch: 'full',
    resolve: {
      PreferenceResolver,NodeResolver,RtipsResolver
   },
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule{

}
