import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgmdTeamsChartComponent } from './orgmd-teams-chart.component';

describe('OrgmdTeamsChartComponent', () => {
  let component: OrgmdTeamsChartComponent;
  let fixture: ComponentFixture<OrgmdTeamsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgmdTeamsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgmdTeamsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
