import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcmdChartComponent } from './ecmd-chart.component';

describe('EcmdChartComponent', () => {
  let component: EcmdChartComponent;
  let fixture: ComponentFixture<EcmdChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcmdChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcmdChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
