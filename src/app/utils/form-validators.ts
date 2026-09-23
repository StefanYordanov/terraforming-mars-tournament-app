import { SchemaPathTree, validate } from "@angular/forms/signals";
import { PlayerReservation } from "../models/tournament.model";

export function uniqueIdsValidator(
  value: SchemaPathTree<number[]>,
  options?: { message: string }) {
  validate(value, (ids) => {
    const uniqueIds = new Set(ids.value());
    if (ids.value().length !== uniqueIds.size) {
      return {
        kind: 'uniqueIds',
        message: options?.message || 'Duplicate player IDs are not allowed' };
    }
    return null;
  });
}

export function uniquePlayerReservationValidator(
  value: SchemaPathTree<PlayerReservation[]>,
  options?: { message: string }) {
  validate(value, (ids) => {
    const uniqueIds = new Set(ids.value().map((r) => r.playerId));
    if (ids.value().length !== uniqueIds.size) {
      return {
        kind: 'uniqueIds',
        message: options?.message || 'Duplicate player IDs are not allowed' };
    }
    return null;
  });
}
