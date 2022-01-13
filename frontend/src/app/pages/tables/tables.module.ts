import { NgModule } from '@angular/core';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbTreeGridModule
} from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { TablesRoutingModule, routedComponents } from './tables-routing.module';
import { FsIconComponent } from './tree-grid/tree-grid.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    TablesRoutingModule,
    Ng2SmartTableModule,
    NbButtonModule,
    NbAlertModule,
    FormsModule,
  ],
  declarations: [
    ...routedComponents,
    FsIconComponent,
  ],
})
export class TablesModule { }
