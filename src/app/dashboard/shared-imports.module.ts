import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeMapList } from '../dashboard/pipes/employeemaplist.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule, MatFormFieldModule, MatCheckboxModule, MatIconModule, MatTreeModule } from '@angular/material';
import { multiLanguageTranslatorModule, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MatRadioModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatExpansionModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    NgxPaginationModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    CdkTreeModule,
    MatSidenavModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatRadioModule,
    multiLanguageTranslatorModule.forRoot({
      defaultLang: 'en',
      storagePrefix: 'current-language'
    })
  ],
  declarations: [
    EmployeeMapList
  ],
  exports: [
    CommonModule,
    EmployeeMapList,
    MatMenuModule,
    MatExpansionModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    NgxPaginationModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    CdkTreeModule,
    MatSidenavModule,
    multiLanguageTranslatorModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatRadioModule,
  ],
  providers: [
    multiLanguageTranslatorPipe
  ]
})
export class SharedImportsModule { }
