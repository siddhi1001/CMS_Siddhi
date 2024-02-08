import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdMainComponent } from './ecmd-main.component';

describe('EcmdMainComponent', () => {
  let component: EcmdMainComponent;
  let fixture: ComponentFixture<EcmdMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
