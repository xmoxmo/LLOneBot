import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent'

abstract class OB11PokeEvent extends OB11BaseNoticeEvent {
  notice_type = 'notify'
  sub_type = 'poke'
  target_id = 0
  abstract user_id: number
  raw_message: any
}

export class OB11FriendPokeEvent extends OB11PokeEvent {
  user_id: number

  constructor(user_id: number, target_id: number, raw_message: any) {
    super();
    this.target_id = target_id;
    this.user_id = user_id;
    this.raw_message = raw_message;
  }
}

export class OB11GroupPokeEvent extends OB11PokeEvent {
  user_id: number
  group_id: number
  constructor(group_id: number, user_id: number = 0, target_id: number = 0, raw_message: any) {
    super()
    this.group_id = group_id
    this.target_id = target_id
    this.user_id = user_id
    this.raw_message = raw_message
  }
}
