import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgmdChartComponent } from './orgmd-chart.component';

describe('OrgmdChartComponent', () => {
  let component: OrgmdChartComponent;
  let fixture: ComponentFixture<OrgmdChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgmdChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgmdChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
