import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardEnum } from '../../models/board.model';
import { TournamentRoundsListComponent } from './tournament-rounds-list.component';

describe('TournamentRoundsListComponent', () => {
  let component: TournamentRoundsListComponent;
  let fixture: ComponentFixture<TournamentRoundsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentRoundsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentRoundsListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tournament', {
      id: 1,
      title: 'Test tournament',
      playerReservations: [],
      playersIds: [1, 2, 3],
      settings: {
        qualifierRoundsCount: 2,
        preferedPlayerCountPerTablePriority: [4, 3, 5, 2],
        numberOfTables: 8,
        roundBoards: [BoardEnum.Tharsis, BoardEnum.Elysium, BoardEnum.Hellas],
      },
      qualifierRounds: [],
      finalRound: null,
    });
    fixture.componentRef.setInput('players', {
      1: { id: 1, name: 'Alice', phoneNumber: '111' },
      2: { id: 2, name: 'Bob', phoneNumber: '222' },
      3: { id: 3, name: 'Charlie', phoneNumber: '333' },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
