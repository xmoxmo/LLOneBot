import {
  CategoryFriend,
  type Friend,
  type FriendRequest,
  type Group,
  type GroupMember,
  type SelfInfo,
  User,
} from '../ntqqapi/types'
import { type FileCache, type LLOneBotError } from './types'
import { NTQQGroupApi } from '../ntqqapi/api/group'
import { log } from './utils/log'
import { isNumeric } from './utils/helper'
import { NTQQFriendApi } from '../ntqqapi/api'
import { WebApiGroupMember } from '@/ntqqapi/api/webapi'

export const selfInfo: SelfInfo = {
  uid: '',
  uin: '',
  nick: '',
  online: true,
}
export const WebGroupData = {
  GroupData: new Map<string, Array<WebApiGroupMember>>(),
  GroupTime: new Map<string, number>(),
}
export let groups: Group[] = []
export let friends: Friend[] = []
export let friendRequests: Map<number, FriendRequest> = new Map<number, FriendRequest>()
export const llonebotError: LLOneBotError = {
  ffmpegError: '',
  httpServerError: '',
  wsServerError: '',
  otherError: 'LLOnebot未能正常启动，请检查日志查看错误',
}

export async function getFriend(uinOrUid: string): Promise<Friend | undefined> {
  let filterKey = isNumeric(uinOrUid.toString()) ? 'uin' : 'uid'
  let filterValue = uinOrUid
  let friend = friends.find((friend) => friend[filterKey] === filterValue.toString())
  if (!friend) {
    try {
      const _friends = await NTQQFriendApi.getFriends(true)
      friend = _friends.find((friend) => friend[filterKey] === filterValue.toString())
      if (friend) {
        friends.push(friend)
      }
    } catch (e: any) {
      log('刷新好友列表失败', e.stack.toString())
    }
  }
  return friend
}

export async function getGroup(qq: string): Promise<Group | undefined> {
  let group = groups.find((group) => group.groupCode === qq.toString())
  if (!group) {
    try {
      const _groups = await NTQQGroupApi.getGroups(true)
      group = _groups.find((group) => group.groupCode === qq.toString())
      if (group) {
        groups.push(group)
      }
    } catch (e) {
    }
  }
  return group
}

export function deleteGroup(groupCode: string) {
  const groupIndex = groups.findIndex((group) => group.groupCode === groupCode.toString())
  // log(groups, groupCode, groupIndex);
  if (groupIndex !== -1) {
    log('删除群', groupCode)
    groups.splice(groupIndex, 1)
  }
}

export async function getGroupMember(groupQQ: string | number, memberUinOrUid: string | number) {
  groupQQ = groupQQ.toString()
  memberUinOrUid = memberUinOrUid.toString()
  const group = await getGroup(groupQQ)
  if (group) {
    const filterKey = isNumeric(memberUinOrUid) ? 'uin' : 'uid'
    const filterValue = memberUinOrUid
    let filterFunc: (member: GroupMember) => boolean = (member) => member[filterKey] === filterValue
    let member = group.members?.find(filterFunc)
    if (!member) {
      try {
        const _members = await NTQQGroupApi.getGroupMembers(groupQQ)
        if (_members.length > 0) {
          group.members = _members
        }
      } catch (e) {
        // log("刷新群成员列表失败", e.stack.toString())
      }

      member = group.members?.find(filterFunc)
    }
    return member
  }
  return null
}

export async function refreshGroupMembers(groupQQ: string) {
  const group = groups.find((group) => group.groupCode === groupQQ)
  if (group) {
    group.members = await NTQQGroupApi.getGroupMembers(groupQQ)
  }
}

export const uidMaps: Record<string, string> = {} // 一串加密的字符串(uid) -> qq号

export function getUidByUin(uin: string) {
  for (const uid in uidMaps) {
    if (uidMaps[uid] === uin) {
      return uid
    }
  }
}

export let tempGroupCodeMap: Record<string, string> = {} // peerUid => 群号

export let rawFriends: CategoryFriend[] = []