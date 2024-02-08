import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgmdTeamManagementComponent } from './orgmd-team-management.component';

describe('OrgmdTeamManagementComponent', () => {
  let component: OrgmdTeamManagementComponent;
  let fixture: ComponentFixture<OrgmdTeamManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgmdTeamManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgmdTeamManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
