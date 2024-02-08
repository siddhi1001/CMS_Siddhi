import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDefinitionComponent } from './base-definition.component';

describe('BaseDefinitionComponent', () => {
  let component: BaseDefinitionComponent;
  let fixture: ComponentFixture<BaseDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
