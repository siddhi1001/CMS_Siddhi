import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FctsCommonRolesUsersComponent } from './fcts-common-roles-users.component';

describe('FctsCommonRolesUsersComponent', () => {
  let component: FctsCommonRolesUsersComponent;
  let fixture: ComponentFixture<FctsCommonRolesUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FctsCommonRolesUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FctsCommonRolesUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
