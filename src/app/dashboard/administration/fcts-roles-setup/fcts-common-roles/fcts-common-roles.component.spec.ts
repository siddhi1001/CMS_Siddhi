import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FctsCommonRolesComponent } from './fcts-common-roles.component';

describe('FctsCommonRolesComponent', () => {
  let component: FctsCommonRolesComponent;
  let fixture: ComponentFixture<FctsCommonRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FctsCommonRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FctsCommonRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
