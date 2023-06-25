import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WowResourcesComponent } from './wow-resources.component';

describe('WowResourcesComponent', () => {
  let component: WowResourcesComponent;
  let fixture: ComponentFixture<WowResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WowResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WowResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
