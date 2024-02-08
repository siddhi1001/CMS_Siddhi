import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdRecordsManagementComponent } from './ecmd-records-management.component';

describe('EcmdRecordsManagementComponent', () => {
  let component: EcmdRecordsManagementComponent;
  let fixture: ComponentFixture<EcmdRecordsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdRecordsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdRecordsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
