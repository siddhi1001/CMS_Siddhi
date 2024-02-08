import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegationReportComponent } from './delegation-report.component';

describe('DelegationReportComponent', () => {
  let component: DelegationReportComponent;
  let fixture: ComponentFixture<DelegationReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegationReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
