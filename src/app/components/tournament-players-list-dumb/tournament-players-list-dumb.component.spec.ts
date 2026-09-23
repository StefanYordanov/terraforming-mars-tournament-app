import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorunamentPlayersListDumbComponent } from './tournament-players-list-dumb.component';

describe('TorunamentPlayersListDumbComponent', () => {
  let component: TorunamentPlayersListDumbComponent;
  let fixture: ComponentFixture<TorunamentPlayersListDumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorunamentPlayersListDumbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TorunamentPlayersListDumbComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
