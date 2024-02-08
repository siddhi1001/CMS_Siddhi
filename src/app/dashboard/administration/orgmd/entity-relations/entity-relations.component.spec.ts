import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRelationsComponent } from './entity-relations.component';

describe('EntityRelationsComponent', () => {
  let component: EntityRelationsComponent;
  let fixture: ComponentFixture<EntityRelationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRelationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
